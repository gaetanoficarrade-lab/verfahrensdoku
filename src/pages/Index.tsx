import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users, FolderOpen, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading } = useAuth();
  const { roles, profileLoading, isSuperAdmin, impersonation, effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, openProjects: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) { navigate('/auth'); return; }
    if (isSuperAdmin && !impersonation.isImpersonating) { navigate('/admin'); return; }
    if (roles.includes('client')) { navigate('/client'); return; }
  }, [user, loading, roles, profileLoading, isSuperAdmin, impersonation, navigate]);

  useEffect(() => {
    if (!effectiveTenantId) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [clientsRes, projectsRes, activityRes] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId).neq('status', 'finalized'),
          supabase.from('audit_log').select('*').eq('tenant_id', effectiveTenantId).order('created_at', { ascending: false }).limit(10),
        ]);
        setStats({ clients: clientsRes.count || 0, openProjects: projectsRes.count || 0 });
        setRecentActivity(activityRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [effectiveTenantId]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    { label: 'Mandanten', value: stats.clients, icon: Users, color: 'text-primary' },
    { label: 'Offene Projekte', value: stats.openProjects, icon: FolderOpen, color: 'text-accent-foreground' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Willkommen in der GoBD-Suite</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : s.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Letzte Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Noch keine Aktivitäten vorhanden.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex items-start justify-between rounded-md border border-border p-3 text-sm">
                  <div>
                    <span className="font-medium text-foreground">{a.action}</span>
                    {a.entity_type && <span className="text-muted-foreground ml-2">({a.entity_type})</span>}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(a.created_at).toLocaleString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
