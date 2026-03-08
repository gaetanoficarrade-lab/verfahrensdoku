import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FolderOpen, BarChart3, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { GOBD_CHAPTERS } from '@/lib/chapter-structure';

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  created_at: string;
}

interface ChapterProgress {
  project_id: string;
  total: number;
  submitted: number;
  openChapters: string[];
}

export default function ClientDashboard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ChapterProgress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id);

      if (!clientData || clientData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const clientIds = clientData.map((c) => c.id);
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, status, workflow_status, created_at')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false });

      const projs = projectsData || [];
      setProjects(projs);

      // Fetch chapter progress for each project
      if (projs.length > 0) {
        const projectIds = projs.map(p => p.id);
        const { data: chapters } = await supabase
          .from('chapter_data')
          .select('project_id, chapter_key, status')
          .in('project_id', projectIds);

        const map: Record<string, ChapterProgress> = {};
        for (const p of projs) {
          const pChapters = (chapters || []).filter(c => c.project_id === p.id);
          const total = pChapters.length || GOBD_CHAPTERS.reduce((sum, ch) => sum + ch.subChapters.length, 0);
          const submitted = pChapters.filter(c =>
            c.status === 'client_submitted' || c.status === 'advisor_review' || c.status === 'approved' || c.status === 'advisor_approved'
          ).length;
          const openChapterKeys = pChapters
            .filter(c => c.status === 'empty' || c.status === 'client_draft')
            .map(c => c.chapter_key);
          map[p.id] = { project_id: p.id, total, submitted, openChapters: openChapterKeys };
        }
        setProgressMap(map);
      }

      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  const statusColor = (status: string | null) => {
    const map: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      in_progress: 'bg-primary/10 text-primary',
      submitted: 'bg-accent/20 text-accent-foreground',
      finalized: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[status || 'draft'] || map.draft;
  };

  const statusLabel = (status: string | null) => {
    const map: Record<string, string> = {
      draft: 'Entwurf',
      in_progress: 'In Bearbeitung',
      submitted: 'Eingereicht',
      finalized: 'Abgeschlossen',
    };
    return map[status || 'draft'] || status || 'Entwurf';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meine Projekte</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Übersicht Ihrer Verfahrensdokumentationen
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">
              Sie haben noch keine Projekte. Ihr Berater wird Ihnen ein Projekt zuweisen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((p, i) => {
            const progress = progressMap[p.id];
            const percent = progress && progress.total > 0 ? Math.round((progress.submitted / progress.total) * 100) : 0;

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate(`/client/projects/${p.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base text-foreground">{p.name}</CardTitle>
                      <Badge variant="secondary" className={statusColor(p.status)}>
                        {statusLabel(p.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Erstellt am {new Date(p.created_at).toLocaleDateString('de-DE')}
                    </p>

                    {progress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Fortschritt
                          </span>
                          <span className="font-medium text-foreground">
                            {progress.submitted} von {progress.total} Kapiteln eingereicht ({percent}%)
                          </span>
                        </div>
                        <Progress value={percent} className="h-2" />

                        {progress.openChapters.length > 0 && progress.openChapters.length <= 5 && (
                          <div className="flex items-start gap-2 mt-2">
                            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              Noch offen: {progress.openChapters.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
