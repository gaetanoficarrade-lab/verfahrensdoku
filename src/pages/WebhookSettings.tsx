import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/auditLog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Globe, Save, Loader2, Play, CheckCircle2, XCircle, Plus, Trash2, Key, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const EVENT_OPTIONS = [
  { value: 'projekt_erstellt', label: 'Projekt erstellt' },
  { value: 'kapitel_eingereicht', label: 'Kapitel eingereicht' },
  { value: 'dokument_finalisiert', label: 'Dokument finalisiert' },
  { value: 'mandant_eingeladen', label: 'Kunde eingeladen' },
];

interface Webhook {
  id: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function WebhookSettings() {
  const { effectiveTenantId } = useAuthContext();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // New/edit form
  const [editId, setEditId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    if (!effectiveTenantId) { setLoading(false); return; }
    setLoading(true);

    const [whRes, logRes, keyRes] = await Promise.all([
      supabase
        .from('tenant_webhooks')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false }),
      supabase
        .from('webhook_logs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('tenant_api_keys')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false }),
    ]);

    setWebhooks((whRes.data as Webhook[]) || []);
    setLogs((logRes.data as WebhookLog[]) || []);
    setApiKeys((keyRes.data as ApiKey[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [effectiveTenantId]);

  const resetForm = () => {
    setEditId(null);
    setUrl('');
    setSecret('');
    setEvents([]);
    setIsActive(true);
    setShowForm(false);
  };

  const handleEdit = (wh: Webhook) => {
    setEditId(wh.id);
    setUrl(wh.url);
    setSecret(wh.secret || '');
    setEvents(wh.events || []);
    setIsActive(wh.is_active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!effectiveTenantId || !url.trim()) return;
    setSaving(true);

    try {
      const payload = {
        tenant_id: effectiveTenantId,
        url: url.trim(),
        secret: secret.trim() || null,
        events,
        is_active: isActive,
      };

      if (editId) {
        const { error } = await supabase
          .from('tenant_webhooks')
          .update(payload)
          .eq('id', editId);
        if (error) throw error;
        toast.success('Webhook aktualisiert.');
      } else {
        const { error } = await supabase
          .from('tenant_webhooks')
          .insert(payload);
        if (error) throw error;
        toast.success('Webhook erstellt.');
      }
      logAudit('settings_updated', 'webhook', editId || undefined, { url: url.trim(), events });
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tenant_webhooks').delete().eq('id', id);
    if (error) {
      toast.error('Fehler beim Löschen.');
    } else {
      toast.success('Webhook gelöscht.');
      fetchData();
    }
  };

  const handleTest = async (webhookId: string) => {
    setTesting(webhookId);
    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { webhook_id: webhookId },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success(`Test erfolgreich (Status ${data.status_code})`);
      } else {
        toast.error(`Test fehlgeschlagen: ${data?.error || 'Unbekannter Fehler'}`);
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Test fehlgeschlagen.');
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (value: string) => {
    setEvents((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );
  };

  const handleCreateApiKey = async () => {
    if (!effectiveTenantId) return;
    setCreatingKey(true);
    try {
      const { error } = await supabase.from('tenant_api_keys').insert({
        tenant_id: effectiveTenantId,
        name: newKeyName.trim() || 'Standard',
      });
      if (error) throw error;
      toast.success('API-Key erstellt.');
      logAudit('settings_updated', 'api_key', undefined, { name: newKeyName.trim() || 'Standard' });
      setNewKeyName('');
      setShowNewKeyForm(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Fehler beim Erstellen.');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    const { error } = await supabase.from('tenant_api_keys').delete().eq('id', id);
    if (error) {
      toast.error('Fehler beim Löschen.');
    } else {
      toast.success('API-Key gelöscht.');
      fetchData();
    }
  };

  const handleToggleApiKey = async (id: string, active: boolean) => {
    const { error } = await supabase.from('tenant_api_keys').update({ is_active: active }).eq('id', id);
    if (error) {
      toast.error('Fehler beim Aktualisieren.');
    } else {
      toast.success(active ? 'API-Key aktiviert.' : 'API-Key deaktiviert.');
      fetchData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('In die Zwischenablage kopiert.');
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Webhook-Konfiguration
        </h1>
        <p className="text-muted-foreground mt-1">
          Erhalten Sie Benachrichtigungen über Events per HTTP-Webhook.
        </p>
      </div>

      {/* Webhook list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{webhooks.length} Webhooks</CardTitle>
            <CardDescription>Konfigurierte Endpunkte</CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" className="gap-1" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4" />
              Webhook hinzufügen
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {webhooks.length === 0 && !showForm ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Noch keine Webhooks konfiguriert.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {wh.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(wh.events || []).map((e) => (
                          <Badge key={e} variant="secondary" className="text-[10px]">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={wh.is_active ? 'default' : 'secondary'} className="text-xs">
                        {wh.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTest(wh.id)}
                          disabled={testing === wh.id}
                        >
                          {testing === wh.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(wh)}>
                          Bearbeiten
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(wh.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editId ? 'Webhook bearbeiten' : 'Neuen Webhook hinzufügen'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Key className="h-3 w-3" />
                Secret Key (HMAC-SHA256)
              </Label>
              <Input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Optionaler Secret Key für Signierung"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Wird als HMAC-SHA256 Signatur im Header X-Webhook-Signature mitgesendet.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-3">
                {EVENT_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={opt.value}
                      checked={events.includes(opt.value)}
                      onCheckedChange={() => toggleEvent(opt.value)}
                    />
                    <label htmlFor={opt.value} className="text-sm cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Webhook aktiv</Label>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving || !url.trim()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Speichern
              </Button>
              <Button variant="outline" onClick={resetForm}>Abbrechen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              API-Keys
            </CardTitle>
            <CardDescription>Generieren Sie API-Keys für externe Systeme</CardDescription>
          </div>
          {!showNewKeyForm && (
            <Button size="sm" className="gap-1" onClick={() => setShowNewKeyForm(true)}>
              <Plus className="h-4 w-4" />
              Neuer API-Key
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showNewKeyForm && (
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>Bezeichnung</Label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="z.B. Integration CRM"
                  className="text-sm"
                />
              </div>
              <Button onClick={handleCreateApiKey} disabled={creatingKey} size="sm">
                {creatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Erstellen
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowNewKeyForm(false); setNewKeyName(''); }}>
                Abbrechen
              </Button>
            </div>
          )}

          {apiKeys.length === 0 && !showNewKeyForm ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine API-Keys erstellt.
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{key.name}</span>
                      <Badge variant={key.is_active ? 'default' : 'secondary'} className="text-[10px]">
                        {key.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs text-muted-foreground font-mono">
                        {visibleKeys.has(key.id) ? key.api_key : `${key.api_key.slice(0, 8)}${'•'.repeat(24)}`}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleKeyVisibility(key.id)}>
                        {visibleKeys.has(key.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(key.api_key)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      Erstellt: {format(new Date(key.created_at), 'dd.MM.yyyy', { locale: de })}
                      {key.last_used_at && ` · Zuletzt verwendet: ${format(new Date(key.last_used_at), 'dd.MM.yyyy HH:mm', { locale: de })}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={key.is_active}
                      onCheckedChange={(checked) => handleToggleApiKey(key.id, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteApiKey(key.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Letzte Webhook-Aufrufe</CardTitle>
          <CardDescription>Die letzten 20 ausgehenden Webhook-Calls</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Noch keine Webhook-Aufrufe.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ergebnis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss', { locale: de })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{log.event}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.response_status || '–'}
                    </TableCell>
                    <TableCell>
                      {log.response_status && log.response_status >= 200 && log.response_status < 300 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
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
