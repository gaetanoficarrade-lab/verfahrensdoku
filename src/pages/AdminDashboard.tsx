import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, FolderOpen, Eye, Loader2, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { seedDemoData } from '@/lib/seedDemoData';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  const [seeding, setSeeding] = useState(false);
  const { startImpersonation } = useAuthContext();
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleImpersonate = (tenant: Tenant) => {
    startImpersonation(tenant.id, tenant.name);
    navigate('/clients');
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const result = await seedDemoData();
      
      const v = result.verification;
      toast.success('Demo-Daten erfolgreich angelegt!', {
        description: (
          <div className="space-y-1 text-xs mt-1">
            <div className="bg-muted/50 rounded p-2 font-mono space-y-0.5">
              <p>Unterkonto: {result.tenantId}</p>
              <p>Kunde: {result.clientId} {v.clientExists ? '✅' : '❌ FEHLT!'}</p>
              <p>Projekt: {result.projectId} {v.projectExists ? '✅' : '❌ FEHLT!'}</p>
              <p>Kapitel: {v.chapterCount} {v.chapterCount > 0 ? '✅' : '❌'}</p>
              <p>Onboarding: {v.onboardingExists ? '✅' : '❌'}</p>
            </div>
          </div>
        ),
        duration: 20000,
      });
      await fetchData();
      // Auto-impersonate and navigate to the demo project
      startImpersonation(result.tenantId, 'Musterkanzlei Müller & Partner');
      navigate(`/projects/${result.projectId}`);
    } catch (err: any) {
      toast.error('Fehler beim Anlegen der Demo-Daten', {
        description: err.message,
      });
    } finally {
      setSeeding(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: 'Unterkonten', value: stats.tenants, icon: Building2 },
    { label: 'Mandanten', value: stats.clients, icon: Users },
    { label: 'Projekte', value: stats.projects, icon: FolderOpen },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          
        </div>
        <div className="flex gap-2">
          {/* Demo-Daten laden Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2" disabled={seeding}>
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Demo-Daten laden
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Demo-Daten laden?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Folgende Daten werden neu angelegt:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li><strong>Unterkonto:</strong> Musterkanzlei Müller & Partner (Plan: Professional)</li>
                    <li><strong>Mandant:</strong> Beispiel GmbH (IT-Dienstleistungen, 3 Mitarbeiter)</li>
                    <li><strong>Projekt:</strong> Verfahrensdokumentation 2024 mit vollständigem Onboarding</li>
                    <li><strong>Kapitel:</strong> Alle 30 Unterkapitel mit realistischen Texten, vollständig freigegeben und PDF-bereit</li>
                    <li><strong>Dokumentversion:</strong> Finalisierte Version 1</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Nach dem Anlegen werden Sie automatisch als Musterkanzlei eingeloggt und zum Projekt weitergeleitet.
                    Die erstellten IDs werden in der Erfolgsmeldung angezeigt.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleSeedDemo}>
                  {seeding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Wird angelegt...
                    </>
                  ) : (
                    'Demo-Daten anlegen'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
          <CardTitle>Unterkonten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tenants.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Unterkonten vorhanden.
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
