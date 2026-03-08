import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, ScrollText } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface AuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  client_created: 'Mandant erstellt',
  client_updated: 'Mandant bearbeitet',
  client_user_created: 'Zugang erstellt',
  project_created: 'Projekt erstellt',
  chapter_submitted: 'Kapitel eingereicht',
  text_generated: 'Text generiert',
  pdf_created: 'PDF erstellt',
  settings_updated: 'Einstellungen geändert',
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

export default function ActivityLog() {
  const { effectiveTenantId } = useAuthContext();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    if (!effectiveTenantId) return;
    const fetchData = async () => {
      setLoading(true);
      const [logRes, profileRes] = await Promise.all([
        supabase
          .from('audit_log')
          .select('*')
          .eq('tenant_id', effectiveTenantId)
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .eq('tenant_id', effectiveTenantId),
      ]);
      setEntries((logRes.data as AuditEntry[]) || []);
      setProfiles((profileRes.data as UserProfile[]) || []);
      setLoading(false);
    };
    fetchData();
  }, [effectiveTenantId]);

  const profileMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profiles) {
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
      map[p.user_id] = name || p.email || 'Unbekannt';
    }
    return map;
  }, [profiles]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (actionFilter !== 'all' && e.action !== actionFilter) return false;
      if (dateFrom && e.created_at < dateFrom) return false;
      if (dateTo) {
        const to = dateTo + 'T23:59:59';
        if (e.created_at > to) return false;
      }
      return true;
    });
  }, [entries, actionFilter, dateFrom, dateTo]);

  const handleExportCsv = () => {
    const header = 'Datum;Benutzer;Aktion;Typ;Objekt-ID;Details';
    const rows = filtered.map((e) => {
      const date = format(new Date(e.created_at), 'dd.MM.yyyy HH:mm', { locale: de });
      const user = e.user_id ? (profileMap[e.user_id] || e.user_id) : '–';
      const action = ACTION_LABELS[e.action] || e.action;
      const details = JSON.stringify(e.details || {});
      return `${date};${user};${action};${e.entity_type || '–'};${e.entity_id || '–'};${details}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aktivitaets-log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="h-6 w-6" />
          Aktivitäts-Log
        </h1>
        <p className="text-muted-foreground mt-1">Alle Aktionen Ihres Teams im Überblick</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Von</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bis</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aktionstyp</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktionen</SelectItem>
                  {ALL_ACTIONS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {ACTION_LABELS[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCsv}>
              <Download className="h-4 w-4" />
              CSV Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} Einträge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Keine Einträge gefunden.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Datum</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Objekt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.user_id ? (profileMap[entry.user_id] || '–') : '–'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {ACTION_LABELS[entry.action] || entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.entity_type || '–'}
                      {entry.entity_id && (
                        <span className="ml-1 font-mono text-xs opacity-60">
                          {entry.entity_id.slice(0, 8)}…
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
