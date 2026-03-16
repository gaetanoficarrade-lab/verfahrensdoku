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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, ScrollText, ShieldCheck, Info } from 'lucide-react';
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
  client_deleted: 'Mandant gelöscht',
  client_user_created: 'Mandanten-Zugang erstellt',
  client_invite_sent: 'Mandant eingeladen',
  project_created: 'Projekt erstellt',
  project_deleted: 'Projekt gelöscht',
  chapter_submitted: 'Kapitel eingereicht',
  chapter_approved: 'Kapitel freigegeben',
  text_generated: 'KI-Text generiert',
  pdf_created: 'PDF/VD erstellt',
  pdf_downloaded: 'PDF heruntergeladen',
  settings_updated: 'Einstellungen geändert',
  team_member_invited: 'Teammitglied eingeladen',
  team_member_removed: 'Teammitglied entfernt',
  user_login: 'Anmeldung',
  user_logout: 'Abmeldung',
};

const ACTION_COLORS: Record<string, string> = {
  client_created: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  client_deleted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  pdf_created: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  text_generated: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  settings_updated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const ALL_ACTIONS = Object.keys(ACTION_LABELS);

function formatDetails(details: Record<string, any>): string {
  if (!details || Object.keys(details).length === 0) return '';
  const parts: string[] = [];
  if (details.company) parts.push(`Firma: ${details.company}`);
  if (details.name) parts.push(`Name: ${details.name}`);
  if (details.email) parts.push(`E-Mail: ${details.email}`);
  if (details.chapter_key) parts.push(`Kapitel: ${details.chapter_key}`);
  if (details.version) parts.push(`Version: ${details.version}`);
  if (details.project_name) parts.push(`Projekt: ${details.project_name}`);
  if (details.new_role) parts.push(`Rolle: ${details.new_role}`);
  if (details.role) parts.push(`Rolle: ${details.role}`);
  if (details.action) parts.push(`Aktion: ${details.action}`);
  if (details.url) parts.push(`URL: ${details.url}`);
  if (details.type) parts.push(`Typ: ${details.type}`);
  // Fallback: show remaining keys
  const shown = new Set(['company', 'name', 'email', 'chapter_key', 'version', 'project_name', 'new_role', 'role', 'action', 'url', 'type']);
  for (const [k, v] of Object.entries(details)) {
    if (!shown.has(k) && v !== null && v !== undefined && v !== '') {
      parts.push(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
    }
  }
  return parts.join(' · ');
}

export default function ActivityLog() {
  const { effectiveTenantId } = useAuthContext();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!effectiveTenantId) { setLoading(false); return; }
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
      if (search) {
        const s = search.toLowerCase();
        const userName = e.user_id ? (profileMap[e.user_id] || '') : '';
        const detailsStr = formatDetails(e.details);
        const actionLabel = ACTION_LABELS[e.action] || e.action;
        if (
          !userName.toLowerCase().includes(s) &&
          !actionLabel.toLowerCase().includes(s) &&
          !detailsStr.toLowerCase().includes(s) &&
          !(e.entity_type || '').toLowerCase().includes(s)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [entries, actionFilter, dateFrom, dateTo, search, profileMap]);

  const handleExportCsv = () => {
    const header = 'Datum;Uhrzeit;Benutzer;Aktion;Typ;Details';
    const rows = filtered.map((e) => {
      const date = format(new Date(e.created_at), 'dd.MM.yyyy', { locale: de });
      const time = format(new Date(e.created_at), 'HH:mm:ss', { locale: de });
      const user = e.user_id ? (profileMap[e.user_id] || e.user_id) : '–';
      const action = ACTION_LABELS[e.action] || e.action;
      const details = formatDetails(e.details).replace(/;/g, ',');
      return `${date};${time};${user};${action};${e.entity_type || '–'};${details}`;
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
        <p className="text-muted-foreground mt-1">
          Lückenlose Dokumentation aller Aktionen – für Ihre Beweissicherung
        </p>
      </div>

      {/* Compliance Notice */}
      <Alert className="border-primary/20 bg-primary/5">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Revisionssichere Protokollierung:</strong> Alle Einträge werden automatisch mit Zeitstempel, 
          Benutzer und Aktion unveränderlich gespeichert. Dieses Log dient als Nachweis für Ihre 
          Sorgfaltspflicht und kann bei Bedarf als CSV exportiert werden.
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Suche</Label>
              <Input
                placeholder="Name, Aktion, Details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-52"
              />
            </div>
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
                <SelectTrigger className="w-52">
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
          <CardTitle className="text-base flex items-center justify-between">
            <span>{filtered.length} Einträge</span>
            <span className="text-xs font-normal text-muted-foreground">
              Zeitzone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
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
                  <TableHead className="w-44">Datum & Uhrzeit</TableHead>
                  <TableHead className="w-40">Benutzer</TableHead>
                  <TableHead className="w-44">Aktion</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => {
                  const detailsText = formatDetails(entry.details);
                  const colorClass = ACTION_COLORS[entry.action] || '';

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap font-mono">
                        {format(new Date(entry.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {entry.user_id ? (profileMap[entry.user_id] || '–') : 'System'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${colorClass}`}
                        >
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                        {detailsText || '–'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Footer hint */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground px-1">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>
          Alle Protokolleinträge sind unveränderlich und können nicht gelöscht oder bearbeitet werden. 
          Bei Bedarf können Sie den gesamten Log als CSV-Datei exportieren und für Ihre Unterlagen sichern.
        </p>
      </div>
    </div>
  );
}
