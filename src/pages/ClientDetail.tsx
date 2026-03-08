import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FolderOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Client {
  id: string;
  company: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  legal_form: string | null;
  founding_year: number | null;
  onboarding_status: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  created_at: string;
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !effectiveTenantId) return;
    const fetch = async () => {
      setLoading(true);
      const [clientRes, projRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', id).eq('tenant_id', effectiveTenantId).single(),
        supabase.from('projects').select('id, name, status, workflow_status, created_at').eq('client_id', id).eq('tenant_id', effectiveTenantId).order('created_at', { ascending: false }),
      ]);
      setClient(clientRes.data);
      setProjects(projRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [id, effectiveTenantId]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mandant nicht gefunden.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>Zurück</Button>
      </div>
    );
  }

  const infoRows = [
    { label: 'Branche', value: client.industry },
    { label: 'Ansprechpartner', value: client.contact_name },
    { label: 'E-Mail', value: client.contact_email },
    { label: 'Rechtsform', value: client.legal_form },
    { label: 'Gründungsjahr', value: client.founding_year },
    { label: 'Erstellt am', value: new Date(client.created_at).toLocaleDateString('de-DE') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{client.company}</h1>
          <p className="text-sm text-muted-foreground mt-1">Mandantendetails und Projekte</p>
        </div>
        <Badge variant="secondary">{client.onboarding_status || 'pending'}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Stammdaten</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {infoRows.map((r) => (
              <div key={r.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-foreground font-medium">{r.value || '–'}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              Projekte ({projects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">Noch keine Projekte vorhanden.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell><Badge variant="secondary">{p.status || 'draft'}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString('de-DE')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
