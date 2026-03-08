import { useState, useEffect } from 'react';
import { Loader2, FolderOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  status: string | null;
  workflow_status: string | null;
  created_at: string;
  clients: { company: string }[] | null;
}

export default function Projects() {
  const { effectiveTenantId } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!effectiveTenantId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, workflow_status, created_at, clients(company)')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };
    fetch();
  }, [effectiveTenantId]);

  const filtered = projects.filter((p) =>
    [p.name, p.clients?.[0]?.company, p.status].filter(Boolean).some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  );

  const statusColor = (status: string | null) => {
    const map: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      in_progress: 'bg-primary/10 text-primary',
      finalized: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[status || 'draft'] || map.draft;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projekte</h1>
        <p className="text-sm text-muted-foreground mt-1">Alle Verfahrensdokumentationen Ihres Lizenznehmers</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} Projekt(e)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {projects.length === 0 ? 'Noch keine Projekte vorhanden.' : 'Keine Treffer.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projekt</TableHead>
                  <TableHead>Mandant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border"
                  >
                    <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.clients?.[0]?.company || '–'}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColor(p.status)}>{p.status || 'draft'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(p.created_at).toLocaleDateString('de-DE')}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
