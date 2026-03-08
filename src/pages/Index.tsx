import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users, FolderOpen, Clock, TrendingUp } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, loading, roles, profileLoading, isSuperAdmin, impersonation, effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clients: 0, openProjects: 0, maxClients: 0, maxProjects: 0, planName: '' });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || profileLoading) return;
    if (hasRedirected.current) return;
    if (!user) { navigate('/auth'); return; }
    if (isSuperAdmin && !impersonation.isImpersonating) { hasRedirected.current = true; navigate('/admin'); return; }
    if (roles.includes('client')) { hasRedirected.current = true; navigate('/client'); return; }
  }, [user, loading, roles, profileLoading, isSuperAdmin, impersonation, navigate]);

  useEffect(() => {
    if (!effectiveTenantId) return;
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [clientsRes, projectsRes, activityRes, tenantRes] = await Promise.all([
          supabase.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId).eq('is_deleted', false),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId).neq('status', 'finalized'),
          supabase.from('audit_log').select('*').eq('tenant_id', effectiveTenantId).order('created_at', { ascending: false }).limit(10),
          supabase.from('tenants').select('plan_id, plans(name, max_clients, max_projects)').eq('id', effectiveTenantId).single(),
        ]);
        
        const plan = (tenantRes.data as any)?.plans;
        setStats({
          clients: clientsRes.count || 0,
          openProjects: projectsRes.count || 0,
          maxClients: plan?.max_clients || 0,
          maxProjects: plan?.max_projects || 0,
          planName: plan?.name || 'Kein Plan',
        });
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

  const clientPercent = stats.maxClients > 0 ? Math.min((stats.clients / stats.maxClients) * 100, 100) : 0;
  const projectPercent = stats.maxProjects > 0 ? Math.min((stats.openProjects / stats.maxProjects) * 100, 100) : 0;
  const clientLimitReached = stats.maxClients > 0 && stats.clients >= stats.maxClients;
  const projectLimitReached = stats.maxProjects > 0 && stats.openProjects >= stats.maxProjects;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Willkommen in der GoBD-Suite</p>
        </div>
        {stats.planName && (
          <Badge variant="outline" className="text-sm">
            Plan: {stats.planName}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mandanten with limit */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className={clientLimitReached ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mandanten</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.clients}
                </span>
                {stats.maxClients > 0 && (
                  <span className={`text-sm ${clientLimitReached ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    / {stats.maxClients}
                  </span>
                )}
              </div>
              {stats.maxClients > 0 && !dataLoading && (
                <Progress
                  value={clientPercent}
                  className={`h-2 ${clientLimitReached ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
              {clientLimitReached && !dataLoading && (
                <p className="text-xs text-destructive font-medium">Limit erreicht – Plan upgraden</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Projekte with limit */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={projectLimitReached ? 'border-destructive/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Offene Projekte</CardTitle>
              <FolderOpen className="h-4 w-4 text-accent-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-foreground">
                  {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.openProjects}
                </span>
                {stats.maxProjects > 0 && (
                  <span className={`text-sm ${projectLimitReached ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                    / {stats.maxProjects}
                  </span>
                )}
              </div>
              {stats.maxProjects > 0 && !dataLoading && (
                <Progress
                  value={projectPercent}
                  className={`h-2 ${projectLimitReached ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
              {projectLimitReached && !dataLoading && (
                <p className="text-xs text-destructive font-medium">Limit erreicht – Plan upgraden</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan info */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ihr Plan</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dataLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats.planName}
              </div>
              {!dataLoading && stats.maxClients > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.maxClients} Mandanten · {stats.maxProjects} Projekte
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
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
