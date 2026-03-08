import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, FolderOpen, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Tenant {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  plan_id: string | null;
  created_at: string;
}

interface Stats {
  tenants: number;
  clients: number;
  projects: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ tenants: 0, clients: 0, projects: 0 });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const { startImpersonation } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tenantsRes, clientsRes, projectsRes] = await Promise.all([
        supabase.from('tenants').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
      ]);

      setTenants(tenantsRes.data || []);
      setStats({
        tenants: tenantsRes.data?.length || 0,
        clients: clientsRes.count || 0,
        projects: projectsRes.count || 0,
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleImpersonate = (tenant: Tenant) => {
    startImpersonation(tenant.id, tenant.name);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Lizenznehmer', value: stats.tenants, icon: Building2 },
    { label: 'Mandanten', value: stats.clients, icon: Users },
    { label: 'Projekte', value: stats.projects, icon: FolderOpen },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Super-Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Systemübersicht und Verwaltung</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lizenznehmer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tenants.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Lizenznehmer vorhanden.
              </p>
            )}
            {tenants.map((tenant) => (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tenant.name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.contact_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tenant.is_active ? 'default' : 'secondary'}>
                    {tenant.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImpersonate(tenant)}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Impersonieren
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
