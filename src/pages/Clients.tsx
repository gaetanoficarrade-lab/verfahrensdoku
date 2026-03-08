import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';

interface Client {
  id: string;
  company: string;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  onboarding_status: string | null;
  created_at: string;
}

export default function Clients() {
  const { effectiveTenantId, isSuperAdmin } = useAuthContext();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('clients')
        .select('id, company, industry, contact_name, contact_email, onboarding_status, created_at')
        .order('created_at', { ascending: false });

      // Super-admin without impersonation sees all clients; otherwise filter by tenant
      if (effectiveTenantId) {
        query = query.eq('tenant_id', effectiveTenantId);
      } else if (!isSuperAdmin) {
        // No tenant and not super admin – nothing to show
        setClients([]);
        setLoading(false);
        return;
      }

      const { data } = await query;
      setClients(data || []);
      setLoading(false);
    };
    fetch();
  }, [effectiveTenantId, isSuperAdmin]);

  const filtered = clients.filter((c) =>
    [c.company, c.contact_name, c.contact_email, c.industry]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (status: string | null) => {
    const map: Record<string, string> = {
      pending: 'bg-muted text-muted-foreground',
      in_progress: 'bg-primary/10 text-primary',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return map[status || 'pending'] || map.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mandanten</h1>
          <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihre Mandanten</p>
        </div>
        <Button onClick={() => navigate('/clients/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Mandant
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} Mandant(en)</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {clients.length === 0 ? 'Noch keine Mandanten angelegt.' : 'Keine Treffer für Ihre Suche.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Branche</TableHead>
                  <TableHead>Ansprechpartner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erstellt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="cursor-pointer hover:bg-muted/50 border-b border-border"
                    onClick={() => navigate(`/clients/${c.id}`)}
                  >
                    <TableCell className="font-medium text-foreground">{c.company}</TableCell>
                    <TableCell className="text-muted-foreground">{c.industry || '–'}</TableCell>
                    <TableCell>
                      <div className="text-sm">{c.contact_name || '–'}</div>
                      {c.contact_email && <div className="text-xs text-muted-foreground">{c.contact_email}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusBadge(c.onboarding_status)}>
                        {c.onboarding_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
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
