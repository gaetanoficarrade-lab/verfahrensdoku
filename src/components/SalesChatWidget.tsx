import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant'; content: string };
type CtaAction = { url: string; label: string } | null;

const SUPABASE_URL = 'https://supabase.gobd-suite.de';
const CHAT_URL = `${SUPABASE_URL}/functions/v1/sales-chat`;

const CTA_REGEX = /\{"action"\s*:\s*"show_cta_button"[^}]*\}/g;

function parseCtaFromText(text: string): { clean: string; cta: CtaAction } {
  const match = text.match(CTA_REGEX);
  if (!match) return { clean: text, cta: null };
  try {
    const parsed = JSON.parse(match[0]);
    return {
      clean: text.replace(CTA_REGEX, '').trim(),
      cta: { url: parsed.url, label: parsed.label },
    };
  } catch {
    return { clean: text, cta: null };
  }
}

export function SalesChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cta, setCta] = useState<CtaAction>(null);
  const [greeted, setGreeted] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text: string, idx: number) => {
    if (!ttsSupported) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const stripped = text.replace(/[#*_`>\[\]()!]/g, '').replace(/\n+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(stripped);
    utterance.lang = 'de-DE';
    utterance.rate = 1;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  }, [speakingIdx, ttsSupported]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);
    (transcript) => setInput((prev) => (prev ? prev + ' ' + transcript : transcript))
  );

  // Auto-open after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-greet on first open
  useEffect(() => {
    if (open && !greeted && messages.length === 0) {
      setGreeted(true);
      setMessages([
        {
          role: 'assistant',
          content:
            'Hi! 👋 Ich bin Lena von der GoBD-Suite. Wie kann ich dir helfen? Suchst du eine Lösung für deine eigene Verfahrensdokumentation oder betreust du Mandanten?',
        },
      ]);
    }
  }, [open, greeted, messages.length]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const userMsg: Msg = { role: 'user', content: text.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setLoading(true);

      let assistantSoFar = '';

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        const { clean } = parseCtaFromText(assistantSoFar);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && prev.length === newMessages.length + 1) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: clean } : m));
          }
          return [...prev, { role: 'assistant', content: clean }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!resp.ok || !resp.body) throw new Error('Stream failed');

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buf.indexOf('\n')) !== -1) {
            let line = buf.slice(0, idx);
            buf = buf.slice(idx + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (!line.startsWith('data: ')) continue;
            const json = line.slice(6).trim();
            if (json === '[DONE]') break;
            try {
              const p = JSON.parse(json);
              const c = p.choices?.[0]?.delta?.content;
              if (c) upsert(c);
            } catch {
              buf = line + '\n' + buf;
              break;
            }
          }
        }

        // Final CTA check
        const { cta: finalCta } = parseCtaFromText(assistantSoFar);
        if (finalCta) setCta(finalCta);
      } catch (e) {
        console.error('Chat error:', e);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Entschuldigung, es ist ein Fehler aufgetreten. Bitte versuche es erneut.' },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-5 right-5 z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105',
          'h-14 w-14',
          open
            ? 'bg-[hsl(220,15%,18%)] text-[hsl(40,10%,88%)]'
            : 'bg-[hsl(43,80%,48%)] text-white'
        )}
        aria-label={open ? 'Chat schließen' : 'Chat öffnen'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex flex-col w-[360px] max-w-[calc(100vw-40px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl shadow-2xl border overflow-hidden bg-[hsl(220,15%,13%)] border-[hsl(220,12%,20%)] text-[hsl(40,10%,88%)]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(220,12%,20%)] bg-[hsl(220,15%,16%)]">
            <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[hsl(43,80%,48%)] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[hsl(40,10%,92%)]">Lena</p>
              <p className="text-xs text-[hsl(40,6%,50%)]">GoBD-Suite Beratung</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'bg-[hsl(43,80%,48%)] text-white rounded-br-md'
                      : 'bg-[hsl(220,12%,18%)] text-[hsl(40,10%,88%)] rounded-bl-md'
                  )}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-1.5">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[hsl(220,12%,18%)] rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(43,80%,48%)]" />
                </div>
              </div>
            )}

            {/* CTA Button */}
            {cta && (
              <div className="flex justify-center pt-2">
                <a
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(43,80%,48%)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(43,80%,42%)] transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  {cta.label}
                </a>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[hsl(220,12%,20%)] p-3 bg-[hsl(220,15%,14%)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Schreib eine Nachricht…"
                disabled={loading}
                className="flex-1 rounded-xl border border-[hsl(220,12%,24%)] bg-[hsl(220,15%,18%)] px-3.5 py-2.5 text-sm text-[hsl(40,10%,88%)] placeholder:text-[hsl(40,6%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(43,80%,48%)] disabled:opacity-50"
              />
              {micSupported && (
                <Button
                  type="button"
                  size="icon"
                  onClick={toggleMic}
                  className={cn(
                    'h-10 w-10 rounded-xl transition-colors',
                    isListening
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                      : 'bg-[hsl(220,12%,22%)] text-[hsl(40,10%,70%)] hover:bg-[hsl(220,12%,26%)]'
                  )}
                  aria-label={isListening ? 'Mikrofon stoppen' : 'Mikrofon starten'}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-[hsl(43,80%,48%)] text-white hover:bg-[hsl(43,80%,42%)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
