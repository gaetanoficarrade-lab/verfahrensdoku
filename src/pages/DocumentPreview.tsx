import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GOBD_CHAPTERS } from '@/lib/chapter-structure';
import { generateVerfahrensdokumentation } from '@/lib/generatePdf';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';

interface ChapterData {
  chapter_key: string;
  editor_text: string | null;
  generated_text: string | null;
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

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [projRes, chapRes, onbRes] = await Promise.all([
        supabase.from('projects').select('name, client_id, clients(company)').eq('id', id).single(),
        supabase.from('chapter_data').select('chapter_key, editor_text, generated_text, status, client_notes').eq('project_id', id),
        supabase.from('project_onboarding').select('answers').eq('project_id', id).maybeSingle(),
      ]);
      if (projRes.data) {
        setProjectName(projRes.data.name);
        setCompanyName((projRes.data as any).clients?.company || '');
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
      })),
    });
    doc.save(`${companyName || 'Verfahrensdokumentation'}.pdf`);
  };

  const getChapterContent = (ch: ChapterData) => {
    if (ch.editor_text) return ch.editor_text;
    if (ch.generated_text) return ch.generated_text;
    if (ch.status === 'empty' || !ch.status) return null;
    return null;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-4 border-b border-border -mx-4 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Dokumentenvorschau</h1>
            <p className="text-xs text-muted-foreground">{projectName}</p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Als PDF herunterladen
        </Button>
      </div>

      {/* Cover page simulation */}
      <div className="bg-zinc-900 text-white rounded-lg p-12 text-center space-y-4">
        <FileText className="h-12 w-12 mx-auto opacity-50" />
        <h1 className="text-3xl font-bold">Verfahrensdokumentation</h1>
        <p className="text-lg opacity-80">nach GoBD</p>
        <div className="w-16 h-px bg-zinc-500 mx-auto" />
        <p className="text-xl font-semibold">{companyName}</p>
        <p className="opacity-70">{projectName}</p>
        <p className="text-sm opacity-50">Erstellt am: {today}</p>
      </div>

      {/* Table of contents */}
      <div className="rounded-lg border border-border p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Inhaltsverzeichnis</h2>
        <div className="space-y-4">
          {GOBD_CHAPTERS.map((mainCh) => (
            <div key={mainCh.key}>
              <p className="font-semibold text-foreground">{mainCh.number}. {mainCh.title}</p>
              <div className="ml-6 space-y-1 mt-1">
                {mainCh.subChapters.map((sc) => {
                  const isActive = sc.isActive(answers);
                  return (
                    <p key={sc.key} className={`text-sm ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/50 italic'}`}>
                      {sc.number} {sc.title}
                      {!isActive && ' (nicht relevant)'}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter content */}
      {GOBD_CHAPTERS.map((mainCh) => (
        <div key={mainCh.key} className="space-y-6">
          <div className="border-b-2 border-primary pb-2">
            <h2 className="text-2xl font-bold text-foreground">{mainCh.number}. {mainCh.title}</h2>
          </div>

          {mainCh.subChapters.map((sc) => {
            const isActive = sc.isActive(answers);
            const chData = chapters.find(c => c.chapter_key === sc.key);
            const content = chData ? getChapterContent(chData) : null;

            return (
              <div key={sc.key} className="rounded-lg border border-border p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {sc.number} {sc.title}
                </h3>
                {content ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {content.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) return <h4 key={i} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h4>;
                      if (line.startsWith('## ')) return null; // Skip h2 (already in header)
                      if (line.startsWith('| ')) return <p key={i} className="font-mono text-xs text-muted-foreground">{line}</p>;
                      if (line.startsWith('- **') || line.startsWith('- ')) return <p key={i} className="ml-4 text-sm">{line}</p>;
                      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ')) return <p key={i} className="ml-4 text-sm">{line}</p>;
                      if (line.startsWith('---')) return <hr key={i} className="my-4 border-border" />;
                      if (line.startsWith('*[DEMO')) return <p key={i} className="text-xs italic text-muted-foreground/60 mt-4">{line.replace(/\*/g, '')}</p>;
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="text-sm">{line}</p>;
                    })}
                  </div>
                ) : (
                  <div className="rounded-md bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground italic">
                      {!isActive ? 'Dieses Kapitel ist für das Unternehmen nicht relevant.' : '[Noch nicht fertiggestellt]'}
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
