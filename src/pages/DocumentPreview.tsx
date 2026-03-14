import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, FileText, Printer, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GOBD_CHAPTERS } from '@/lib/chapter-structure';
import { generateVerfahrensdokumentation } from '@/lib/generatePdf';
import { getNegativvermerk } from '@/lib/chapter-leitfragen';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';
import { CHAPTER_TITLE_MAP } from '@/lib/chapter-structure';

interface VersionEntry {
  version: string;
  date: string;
  changedBy: string;
  description: string;
  chapter?: string;
}

interface ChapterData {
  chapter_key: string;
  editor_text: string | null;
  generated_text: string | null;
  generated_hints: string[] | null;
  status: string | null;
  client_notes: string | null;
}

export default function DocumentPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [isFinal, setIsFinal] = useState(false);
  const [versionEntries, setVersionEntries] = useState<VersionEntry[]>([]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [projRes, chapRes, onbRes] = await Promise.all([
        supabase.from('projects').select('name, status, client_id, clients(company)').eq('id', id).single(),
        supabase.from('chapter_data').select('chapter_key, editor_text, generated_text, generated_hints, status, client_notes').eq('project_id', id),
        supabase.from('project_onboarding').select('answers').eq('project_id', id).maybeSingle(),
      ]);
      if (projRes.data) {
        setProjectName(projRes.data.name);
        setCompanyName((projRes.data as any).clients?.company || '');
        setIsFinal((projRes.data as any).status === 'completed');
      }
      setChapters(chapRes.data || []);
      setAnswers((onbRes.data?.answers as OnboardingAnswers) || {});
      setLoading(false);
    };
    load();
  }, [id]);

  const handleDownload = () => {
    const doc = generateVerfahrensdokumentation({
      companyName,
      projectName,
      chapters: chapters.map(c => ({
        chapter_key: c.chapter_key,
        editor_text: c.editor_text,
        generated_text: c.generated_text,
        generated_hints: c.generated_hints,
      })),
      answers,
      isFinal,
    });
    doc.save(`${companyName || 'Verfahrensdokumentation'}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getChapterContent = (chKey: string, chData: ChapterData | undefined, isActive: boolean): { text: string | null; isNegativ: boolean } => {
    if (chData?.editor_text) return { text: chData.editor_text, isNegativ: false };
    if (chData?.generated_text) return { text: chData.generated_text, isNegativ: false };
    if (!isActive) {
      const nv = getNegativvermerk(chKey, answers, companyName);
      if (nv) return { text: nv, isNegativ: true };
      const sc = GOBD_CHAPTERS.flatMap(c => c.subChapters).find(s => s.key === chKey);
      if (sc?.inactiveText) return { text: sc.inactiveText, isNegativ: true };
      return { text: 'Dieses Kapitel ist für das Unternehmen nicht relevant.', isNegativ: true };
    }
    return { text: null, isNegativ: false };
  };

  // Count chapters with open hints
  const chaptersWithHints = chapters.filter(c => {
    const hints = c.generated_hints;
    return hints && Array.isArray(hints) && hints.length > 0;
  });

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b border-border -mx-4 px-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dokumentenvorschau</h1>
            <p className="text-xs text-muted-foreground">{projectName}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={isFinal ? 'default' : 'secondary'}>
            {isFinal ? 'FINAL' : 'ENTWURF'}
          </Badge>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Drucken
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Als PDF herunterladen
          </Button>
        </div>
      </div>

      {/* Quality warning */}
      {chaptersWithHints.length > 0 && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-950/20 p-4 flex items-start gap-3 print:hidden">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              ⚠ Rückfragen wahrscheinlich
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              {chaptersWithHints.length} Kapitel haben offene KI-Prüfhinweise. Diese Kapitel sollten vor der Finalisierung überprüft werden.
            </p>
          </div>
        </div>
      )}

      {/* Cover page simulation */}
      <div className="bg-white text-foreground rounded-lg p-12 text-center space-y-4 relative overflow-hidden border border-border print:rounded-none">
        {!isFinal && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 print:opacity-5">
            <span className="text-7xl font-bold rotate-[-30deg] text-red-500">ENTWURF</span>
          </div>
        )}
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h1 className="text-3xl font-bold text-zinc-900">Verfahrensdokumentation</h1>
        <p className="text-lg text-zinc-500">nach GoBD</p>
        <div className="w-16 h-px bg-zinc-300 mx-auto" />
        <p className="text-xl font-semibold text-zinc-900">{companyName}</p>
        <p className="text-zinc-500">{projectName}</p>
        <p className="text-sm text-zinc-400">Erstellt am: {today}</p>
        <p className="text-sm text-zinc-400">Version 1.0</p>
        <Badge className={`mt-4 ${isFinal ? 'bg-green-600' : 'bg-orange-600'} text-white`}>
          {isFinal ? 'FINAL' : 'ENTWURF'}
        </Badge>
      </div>

      {/* Table of contents */}
      <div className="rounded-lg border border-border p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Inhaltsverzeichnis</h2>
        <div className="space-y-4">
          {GOBD_CHAPTERS.map((mainCh) => (
            <div key={mainCh.key}>
              <p className="font-semibold text-foreground">{mainCh.number}. {mainCh.title}</p>
              <div className="ml-6 space-y-1 mt-1">
                {mainCh.subChapters.map((sc) => (
                  <p key={sc.key} className="text-sm text-muted-foreground">
                    {sc.number} {sc.title}
                  </p>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="font-semibold text-foreground">6. Anlagenverzeichnis</p>
            <div className="ml-6 space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">6.1 Systeminventar</p>
              <p className="text-sm text-muted-foreground">6.2 Schnittstellenübersicht</p>
              <p className="text-sm text-muted-foreground">6.3 Backup- und Sicherungskonzept</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter content */}
      {GOBD_CHAPTERS.map((mainCh) => (
        <div key={mainCh.key} className="space-y-6 print:break-before-page">
          <div className="border-b-2 border-primary pb-2 print:border-black">
            <h2 className="text-2xl font-bold text-foreground">{mainCh.number}. {mainCh.title}</h2>
          </div>

          {mainCh.subChapters.map((sc) => {
            const isActive = sc.isActive(answers);
            const chData = chapters.find(c => c.chapter_key === sc.key);
            const { text, isNegativ } = getChapterContent(sc.key, chData, isActive);

            return (
              <div key={sc.key} className="rounded-lg border border-border p-6 space-y-3 print:border-gray-300 print:rounded-none">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {sc.number} {sc.title}
                  </h3>
                  {chData?.generated_hints && Array.isArray(chData.generated_hints) && chData.generated_hints.length > 0 && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500/40 print:hidden">
                      ⚠ Rückfragen
                    </Badge>
                  )}
                </div>
                {text ? (
                  <div className={`prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed print:text-black ${isNegativ ? 'text-foreground/80' : 'text-foreground/90'}`}>
                    {text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h4>;
                      if (line.startsWith('## ')) return null;
                      if (line.startsWith('| ')) return <p key={i} className="font-mono text-xs text-muted-foreground">{line}</p>;
                      if (line.startsWith('- **') || line.startsWith('- ')) return <p key={i} className="ml-4 text-sm">{line}</p>;
                      if (/^\d+\.\s/.test(line)) return <p key={i} className="ml-4 text-sm">{line}</p>;
                      if (line.startsWith('---')) return <hr key={i} className="my-4 border-border" />;
                      if (line.startsWith('*[DEMO')) return <p key={i} className="text-xs italic text-muted-foreground/60 mt-4">{line.replace(/\*/g, '')}</p>;
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="text-sm">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="rounded-md bg-muted/50 p-4 text-center print:bg-gray-100">
                    <p className="text-sm text-muted-foreground italic">
                      [Noch nicht fertiggestellt]
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
        <p>Vertraulich – {companyName} – {today}</p>
      </div>
    </div>
  );
}
