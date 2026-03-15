import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

const PURCHASES = [
  'Thomas R. aus Hamburg hat gerade den Agentur-Plan gebucht',
  'Sandra K. aus München hat gerade den Berater-Plan gebucht',
  'Marcus W. aus Berlin hat gerade den Solo-Plan gekauft',
  'Julia F. aus Frankfurt hat gerade den Berater-Plan gebucht',
  'Andreas M. aus Stuttgart hat gerade den Agentur-Plan gebucht',
  'Petra S. aus Düsseldorf hat gerade den Solo-Plan gekauft',
  'Michael B. aus Köln hat gerade den Berater-Plan gebucht',
  'Laura K. aus Wien hat gerade den Solo-Plan gekauft',
];

const TESTS = [
  'Jemand aus Hamburg testet gerade GoBD-Suite',
  'Jemand aus München hat den kostenlosen Test gestartet',
  'Jemand aus Berlin hat den kostenlosen Test gestartet',
  'Jemand aus Zürich testet gerade GoBD-Suite',
];

function pickMessage(): string {
  const useTest = Math.random() < 0.3;
  const pool = useTest ? TESTS : PURCHASES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomMinutes(): number {
  return Math.floor(Math.random() * 44) + 2;
}

function randomPause(): number {
  return (Math.floor(Math.random() * 8) + 8) * 1000; // 8-15s
}

const SESSION_KEY = 'social_proof_dismissed';

export default function SocialProofNotification() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [message, setMessage] = useState('');
  const [minutes, setMinutes] = useState(5);
  const [leaving, setLeaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    setMessage(pickMessage());
    setMinutes(randomMinutes());
    setLeaving(false);
    setVisible(true);

    // auto-hide after 5s
    timeoutRef.current = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => {
        setVisible(false);
        // schedule next
        timeoutRef.current = setTimeout(show, randomPause());
      }, 400);
    }, 5000);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const initial = setTimeout(show, 8000);
    return () => {
      clearTimeout(initial);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dismissed, show]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-[280px] rounded-xl bg-white p-3 pr-8 md:p-4 md:pr-9 shadow-[0_4px_24px_rgba(0,0,0,0.12)] transition-transform duration-400 ${leaving ? '-translate-x-[120%]' : 'animate-[slideInLeft_0.4s_ease-out]'}`}
      style={{ fontFamily: 'inherit' }}
    >
      {/* close */}
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-muted-foreground/60 hover:text-foreground transition-colors"
        aria-label="Schließen"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-2.5">
        {/* pulse dot */}
        <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>

        <div className="min-w-0">
          <p className="text-xs md:text-[13px] leading-snug text-gray-800 font-medium">{message}</p>
          <p className="mt-1 text-[11px] text-gray-400">vor {minutes} Minuten</p>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-gray-300 leading-tight">* Beispielhafte Darstellung</p>
    </div>
  );
}
