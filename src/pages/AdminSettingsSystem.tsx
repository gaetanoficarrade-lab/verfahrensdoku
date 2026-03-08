import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, Users, FolderOpen, UserCheck, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  tenants: number;
  clients: number;
  projects: number;
  users: number;
}

export default function AdminSettingsSystem() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({ tenants: 0, clients: 0, projects: 0, users: 0 });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [tenantsRes, clientsRes, projectsRes, usersRes] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        tenants: tenantsRes.count || 0,
        clients: clientsRes.count || 0,
        projects: projectsRes.count || 0,
        users: usersRes.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <AdminSettingsLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminSettingsLayout>
    );
  }

  const statCards = [
    { label: 'Lizenznehmer', value: stats.tenants, icon: Building2 },
    { label: 'Mandanten', value: stats.clients, icon: Users },
    { label: 'Projekte', value: stats.projects, icon: FolderOpen },
    { label: 'Benutzer', value: stats.users, icon: UserCheck },
  ];

  return (
    <AdminSettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System-Informationen
          </h2>
          <p className="text-sm text-muted-foreground">Übersicht über die Plattformnutzung</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {statCards.map((stat) => (
            <Card key={stat.label}>
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
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Systemdetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plattform</span>
              <span className="font-medium text-foreground">GoBD-Suite</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span className="font-medium text-foreground">Supabase (Lovable Cloud)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frontend</span>
              <span className="font-medium text-foreground">React + Vite + TypeScript</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stand</span>
              <span className="font-medium text-foreground">
                {new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSettingsLayout>
  );
}
