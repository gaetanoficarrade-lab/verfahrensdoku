import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  created_at: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      // Get client record for current user, then their projects
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

      setProjects(projectsData || []);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
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
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Erstellt am {new Date(p.created_at).toLocaleDateString('de-DE')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
