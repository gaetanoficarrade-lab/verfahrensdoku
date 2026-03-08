import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Loader2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface AuditEntry {
  id: string;
  tenant_id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

const AuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setEntries(data || []);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.action.toLowerCase().includes(s) ||
      (e.entity_type || '').toLowerCase().includes(s) ||
      JSON.stringify(e.details).toLowerCase().includes(s)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit-Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unveränderliches Protokoll aller Systemaktivitäten
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen nach Aktion, Typ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Keine Einträge gefunden.
              </p>
            )}
            {filtered.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                className="flex items-start gap-4 p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">
                      {entry.action}
                    </Badge>
                    {entry.entity_type && (
                      <Badge variant="secondary" className="text-xs">
                        {entry.entity_type}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  {entry.entity_id && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      ID: {entry.entity_id}
                    </p>
                  )}
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <pre className="mt-2 text-xs text-muted-foreground bg-muted rounded p-2 overflow-x-auto font-mono">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
