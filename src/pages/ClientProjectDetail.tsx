import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, Clock, AlertCircle, Circle, ChevronDown, Ban, Download, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion } from 'framer-motion';
import { generateVerfahrensdokumentation } from '@/lib/generatePdf';
import { toast } from 'sonner';
import { logAudit } from '@/lib/auditLog';
import { triggerWebhook } from '@/lib/webhookTrigger';
import { GOBD_CHAPTERS } from '@/lib/chapter-structure';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';
import OnboardingWizard from '@/components/OnboardingWizard';

const statusConfig: Record<string, { label: string; icon: typeof Circle; className: string }> = {
  empty: { label: 'Offen', icon: Circle, className: 'text-muted-foreground bg-muted' },
  client_draft: { label: 'Entwurf', icon: Clock, className: 'text-primary bg-primary/10' },
  client_submitted: { label: 'Eingereicht', icon: CheckCircle2, className: 'text-accent-foreground bg-accent/20' },
  advisor_review: { label: 'In Prüfung', icon: AlertCircle, className: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' },
  approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  advisor_approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  inactive: { label: 'Nicht relevant', icon: Ban, className: 'text-muted-foreground bg-muted/50' },
};

interface ChapterData {
  id: string;
  chapter_key: string;
  status: string | null;
  client_notes: string | null;
  editor_text: string | null;
  generated_text: string | null;
}

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  client_id: string;
}

export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [openChapters, setOpenChapters] = useState<string[]>(['1']);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    const [projRes, chapRes, onbRes] = await Promise.all([
      supabase.from('projects').select('id, name, status, workflow_status, client_id').eq('id', id).single(),
      supabase.from('chapter_data').select('id, chapter_key, status, client_notes, editor_text, generated_text').eq('project_id', id),
      supabase.from('project_onboarding').select('id, answers, completed').eq('project_id', id).maybeSingle(),
    ]);
    setProject(projRes.data);
    setChapters(chapRes.data || []);
    const onb = onbRes.data;
    setAnswers((onb?.answers as OnboardingAnswers) || {});
    setOnboardingId(onb?.id || null);
    const isComplete = onb?.completed === true;
    setOnboardingComplete(isComplete);
    // Auto-show onboarding if not completed
    if (!isComplete && onb) {
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const getSubChapterStatus = (key: string, isActive: boolean) => {
    if (!isActive) return 'inactive';
    const ch = chapters.find((c) => c.chapter_key === key);
    return ch?.status || 'empty';
  };

  const getMainChapterProgress = (subKeys: string[]) => {
    let done = 0;
    for (const key of subKeys) {
      const ch = chapters.find((c) => c.chapter_key === key);
      if (ch?.status === 'approved' || ch?.status === 'advisor_approved') done++;
    }
    return { done, total: subKeys.length };
  };

  const toggleChapter = (key: string) => {
    setOpenChapters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGeneratePdf = async () => {
    if (!project || !id) return;
    setPdfLoading(true);
    try {
      const { data: clientData } = await supabase
        .from('clients').select('company').eq('id', project.client_id).single();
      const companyName = clientData?.company || 'Unbekannt';
      const doc = generateVerfahrensdokumentation({ companyName, projectName: project.name, chapters });
      const fileName = `VfDoc_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: existing } = await supabase
        .from('document_versions').select('version_number').eq('project_id', id)
        .order('version_number', { ascending: false }).limit(1);
      const nextVersion = (existing?.[0]?.version_number || 0) + 1;
      await supabase.from('document_versions').insert({
        project_id: id, version_number: nextVersion, pdf_path: fileName,
        status: 'draft', is_draft: true, created_by: user?.id,
        notes: `PDF erstellt am ${new Date().toLocaleDateString('de-DE')}`,
      });
      logAudit('pdf_created', 'project', id, { version: nextVersion, file: fileName });
      triggerWebhook('dokument_finalisiert', { project_id: id, project_name: project.name, version: nextVersion });
      toast.success('PDF wurde erstellt und heruntergeladen.');
    } catch (err) {
      console.error(err);
      toast.error('Fehler beim Erstellen des PDFs.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projekt nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/client')}>Zurück</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/client')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Verfahrensdokumentation – Kapitelübersicht</p>
        </div>
        <Button onClick={handleGeneratePdf} disabled={pdfLoading}>
          {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
          PDF erstellen
        </Button>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && id && (
        <OnboardingWizard
          projectId={id}
          onboardingId={onboardingId || ''}
          initialAnswers={answers}
          onComplete={() => {
            setShowOnboarding(false);
            setOnboardingComplete(true);
            fetchData();
          }}
        />
      )}

      {/* Onboarding Banner */}
      {!onboardingComplete && !showOnboarding && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Onboarding starten</h3>
                <p className="text-sm text-muted-foreground">
                  Bitte füllen Sie zunächst das Onboarding aus, damit Ihre Verfahrensdokumentation korrekt erstellt werden kann.
                </p>
              </div>
              <Button onClick={() => setShowOnboarding(true)}>
                <Rocket className="h-4 w-4 mr-2" />
                Hier starten
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {GOBD_CHAPTERS.map((mainCh, i) => {
          const subKeys = mainCh.subChapters.map((sc) => sc.key);
          const progress = getMainChapterProgress(subKeys);
          const isOpen = openChapters.includes(mainCh.key);

          return (
            <motion.div
              key={mainCh.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Collapsible open={isOpen} onOpenChange={() => toggleChapter(mainCh.key)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardContent className="flex items-center gap-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                        {mainCh.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{mainCh.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {progress.done}/{progress.total} Unterkapitel freigegeben
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t px-4 pb-3 pt-1 space-y-1">
                      {mainCh.subChapters.map((sc) => {
                        const isActive = sc.isActive(answers);
                        const status = getSubChapterStatus(sc.key, isActive);
                        const config = statusConfig[status] || statusConfig.empty;
                        const StatusIcon = config.icon;

                        return (
                          <div
                            key={sc.key}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                              isActive ? 'hover:bg-muted/50 cursor-pointer' : 'opacity-60'
                            }`}
                            onClick={() => {
                              if (isActive) navigate(`/client/projects/${id}/chapters/${sc.key}`);
                            }}
                          >
                            <span className="text-xs font-mono text-muted-foreground w-8 shrink-0">{sc.number}</span>
                            <span className={`flex-1 text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {sc.title}
                            </span>
                            <Badge variant="secondary" className={`gap-1 text-[10px] px-2 py-0.5 ${config.className}`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
