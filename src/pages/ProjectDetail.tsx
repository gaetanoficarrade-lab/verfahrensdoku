import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, CheckCircle2, Clock, AlertCircle, Circle, ChevronDown, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion } from 'framer-motion';
import OnboardingWizard from '@/components/OnboardingWizard';
import { GOBD_CHAPTERS } from '@/lib/chapter-structure';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';

const statusConfig: Record<string, { label: string; icon: typeof Circle; className: string }> = {
  empty: { label: 'Offen', icon: Circle, className: 'text-muted-foreground bg-muted' },
  client_draft: { label: 'Entwurf', icon: Clock, className: 'text-primary bg-primary/10' },
  client_submitted: { label: 'Eingereicht', icon: CheckCircle2, className: 'text-accent-foreground bg-accent/20' },
  advisor_review: { label: 'In Prüfung', icon: AlertCircle, className: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' },
  approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  advisor_approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
  inactive: { label: 'Nicht relevant', icon: Ban, className: 'text-muted-foreground bg-muted/50' },
};

const workflowLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  data_collection: 'Datenerfassung',
  data_entry: 'Datenerfassung',
  review: 'Review',
  finalization: 'Finalisierung',
  completed: 'Abgeschlossen',
};

const statusLabels: Record<string, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  completed: 'Abgeschlossen',
  archived: 'Archiviert',
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

interface Onboarding {
  id: string;
  answers: OnboardingAnswers;
  completed_at: string | null;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<string[]>(['1']);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const [projRes, chapRes, onbRes] = await Promise.all([
      supabase.from('projects').select('id, name, status, workflow_status, client_id').eq('id', id).single(),
      supabase.from('chapter_data').select('id, chapter_key, status, client_notes, editor_text, generated_text').eq('project_id', id),
      supabase.from('project_onboarding').select('id, answers, completed_at').eq('project_id', id).maybeSingle(),
    ]);
    setProject(projRes.data);
    setChapters(chapRes.data || []);
    setOnboarding(onbRes.data as Onboarding | null);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const answers: OnboardingAnswers = (onboarding?.answers as OnboardingAnswers) || {};

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

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projekt nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1 as any)}>Zurück</Button>
      </div>
    );
  }

  if (!onboarding || !onboarding.completed_at) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${project.client_id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Projekt-Onboarding</p>
          </div>
        </div>
        <OnboardingWizard
          projectId={project.id}
          onboardingId={onboarding?.id || ''}
          initialAnswers={((onboarding?.answers as OnboardingAnswers) || {})}
          onComplete={() => {
            setOnboarding(prev => prev ? { ...prev, completed_at: new Date().toISOString() } : prev);
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${project.client_id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{statusLabels[project.status || ''] || project.status}</Badge>
            <Badge variant="secondary">{workflowLabels[project.workflow_status || ''] || project.workflow_status}</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Kapitel der Verfahrensdokumentation</h2>
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
                                isActive
                                  ? 'hover:bg-muted/50 cursor-pointer'
                                  : 'opacity-60'
                              }`}
                              onClick={() => {
                                if (isActive) navigate(`/projects/${id}/chapters/${sc.key}`);
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
    </div>
  );
}
