import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import OnboardingWizard from '@/components/OnboardingWizard';
import type { OnboardingAnswers } from '@/lib/onboarding-variables';

const CHAPTERS = [
  { key: 'general_info', title: 'Organisatorisches Umfeld', description: 'Unternehmensstruktur, Verantwortlichkeiten und Zuständigkeiten' },
  { key: 'it_systems', title: 'IT-Umfeld', description: 'IT-Systeme, Hardware, Software und Netzwerkinfrastruktur' },
  { key: 'processes', title: 'Geschäftsprozesse', description: 'Beschreibung der steuerrelevanten Geschäftsprozesse' },
  { key: 'archiving', title: 'Archivierung', description: 'Aufbewahrungsfristen, Speicherorte und Zugriffsrechte' },
  { key: 'controls', title: 'Internes Kontrollsystem', description: 'Kontrollmaßnahmen, Plausibilitätsprüfungen und Schutzmaßnahmen' },
];

const statusConfig: Record<string, { label: string; icon: typeof Circle; className: string }> = {
  empty: { label: 'Offen', icon: Circle, className: 'text-muted-foreground bg-muted' },
  client_draft: { label: 'Entwurf', icon: Clock, className: 'text-primary bg-primary/10' },
  client_submitted: { label: 'Eingereicht', icon: CheckCircle2, className: 'text-accent-foreground bg-accent/20' },
  advisor_review: { label: 'In Prüfung', icon: AlertCircle, className: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' },
  approved: { label: 'Freigegeben', icon: CheckCircle2, className: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
};

const workflowLabels: Record<string, string> = {
  onboarding: 'Onboarding',
  data_collection: 'Datenerfassung',
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

  const getChapterStatus = (key: string) => {
    const ch = chapters.find((c) => c.chapter_key === key);
    return ch?.status || 'empty';
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

  // Show onboarding wizard if not completed
  if (onboarding && !onboarding.completed_at) {
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
          onboardingId={onboarding.id}
          initialAnswers={(onboarding.answers || {}) as OnboardingAnswers}
          onComplete={loadData}
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
        <div className="grid gap-4">
          {CHAPTERS.map((ch, i) => {
            const status = getChapterStatus(ch.key);
            const config = statusConfig[status] || statusConfig.empty;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={ch.key}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${id}/chapters/${ch.key}`)}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{ch.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                    </div>
                    <Badge variant="secondary" className={`gap-1 ${config.className}`}>
                      <StatusIcon className="h-3 w-3" />
                      {config.label}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
