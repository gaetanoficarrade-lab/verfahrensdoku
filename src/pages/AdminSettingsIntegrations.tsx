import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Webhook, Key, Mail, ShieldCheck, Eye, EyeOff, Plus, Trash2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const SETTINGS_KEY = 'integrations';

interface IntegrationSettings {
  funnelpay_webhook_secret: string;
  funnelpay_product_solo: string;
  funnelpay_product_berater: string;
  funnelpay_product_agentur: string;
  resend_api_key: string;
  admin_email: string;
}

interface CustomEntry {
  id: string;
  name: string;
  type: 'api_key' | 'webhook_secret' | 'url' | 'other';
  value: string;
}

const DEFAULTS: IntegrationSettings = {
  funnelpay_webhook_secret: '',
  funnelpay_product_solo: '',
  funnelpay_product_berater: '',
  funnelpay_product_agentur: '',
  resend_api_key: '',
  admin_email: '',
};

const TYPE_LABELS: Record<CustomEntry['type'], string> = {
  api_key: 'API-Key',
  webhook_secret: 'Webhook-Secret',
  url: 'URL / Endpoint',
  other: 'Sonstiges',
};

export default function AdminSettingsIntegrations() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<IntegrationSettings>(DEFAULTS);
  const [customEntries, setCustomEntries] = useState<CustomEntry[]>([]);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', SETTINGS_KEY)
        .maybeSingle();

      if (data?.value && typeof data.value === 'object') {
        const val = data.value as Record<string, any>;
        const { custom_entries, ...rest } = val;
        setForm({ ...DEFAULTS, ...rest });
        if (Array.isArray(custom_entries)) {
          setCustomEntries(custom_entries);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        custom_entries: customEntries,
      };
      const { error } = await supabase
        .from('platform_settings')
        .upsert(
          { key: SETTINGS_KEY, value: payload as unknown as Record<string, unknown>, description: 'API & Webhook Integrationen' },
          { onConflict: 'key' }
        );

      if (error) throw error;
      toast.success('Integrationseinstellungen gespeichert');
    } catch (e: any) {
      toast.error('Fehler beim Speichern: ' + (e.message || 'Unbekannt'));
    } finally {
      setSaving(false);
    }
  };

  const toggleShow = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const addCustomEntry = () => {
    setCustomEntries((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', type: 'api_key', value: '' },
    ]);
  };

  const updateCustomEntry = (id: string, updates: Partial<CustomEntry>) => {
    setCustomEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const removeCustomEntry = (id: string) => {
    setCustomEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const renderSecretInput = (field: keyof IntegrationSettings, label: string, placeholder?: string) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="relative">
        <Input
          type={showSecrets[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
          placeholder={placeholder || '•••••••••'}
          className="pr-10 font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => toggleShow(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showSecrets[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminSettingsLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            API & Integrationen
          </h2>
          <p className="text-sm text-muted-foreground">
            Webhook-Secrets, API-Keys und Produkt-Zuordnungen für externe Dienste
          </p>
        </div>

        {/* Funnelpay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Funnelpay
            </CardTitle>
            <CardDescription>
              Webhook-Authentifizierung und Produkt-IDs für die automatische Kontoeröffnung nach Kauf
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderSecretInput('funnelpay_webhook_secret', 'Webhook-Secret', 'whsec_...')}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Produkt-ID Solo</Label>
                <Input
                  value={form.funnelpay_product_solo}
                  onChange={(e) => setForm({ ...form, funnelpay_product_solo: e.target.value })}
                  placeholder="prod_solo_..."
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Produkt-ID Berater</Label>
                <Input
                  value={form.funnelpay_product_berater}
                  onChange={(e) => setForm({ ...form, funnelpay_product_berater: e.target.value })}
                  placeholder="prod_berater_..."
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Produkt-ID Agentur</Label>
                <Input
                  value={form.funnelpay_product_agentur}
                  onChange={(e) => setForm({ ...form, funnelpay_product_agentur: e.target.value })}
                  placeholder="prod_agentur_..."
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E-Mail / Resend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-accent" />
              E-Mail (Resend)
            </CardTitle>
            <CardDescription>
              API-Key für den E-Mail-Versand (Willkommens-Mails, Benachrichtigungen etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SecretInput field="resend_api_key" label="Resend API-Key" placeholder="re_..." />
          </CardContent>
        </Card>

        {/* Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-accent" />
              Benachrichtigungen
            </CardTitle>
            <CardDescription>
              E-Mail-Adresse für System-Fehlerbenachrichtigungen und Alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Admin-E-Mail</Label>
              <Input
                type="email"
                value={form.admin_email}
                onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-accent" />
              Eigene Integrationen
            </CardTitle>
            <CardDescription>
              Beliebige API-Keys, Webhook-Secrets oder URLs für weitere Tools (z.B. Slack, OpenAI, Zapier etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customEntries.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Noch keine eigenen Integrationen hinzugefügt.
              </p>
            )}

            {customEntries.map((entry, idx) => (
              <div key={entry.id}>
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Name</Label>
                      <Input
                        value={entry.name}
                        onChange={(e) => updateCustomEntry(entry.id, { name: e.target.value })}
                        placeholder="z.B. Slack Webhook"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Typ</Label>
                      <select
                        value={entry.type}
                        onChange={(e) =>
                          updateCustomEntry(entry.id, { type: e.target.value as CustomEntry['type'] })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Wert</Label>
                      <div className="relative">
                        <Input
                          type={showSecrets[entry.id] ? 'text' : entry.type === 'url' ? 'url' : 'password'}
                          value={entry.value}
                          onChange={(e) => updateCustomEntry(entry.id, { value: e.target.value })}
                          placeholder={entry.type === 'url' ? 'https://...' : '•••••••••'}
                          className="pr-10 font-mono text-sm"
                        />
                        {entry.type !== 'url' && (
                          <button
                            type="button"
                            onClick={() => toggleShow(entry.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showSecrets[entry.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeCustomEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" className="gap-2" onClick={addCustomEntry}>
              <Plus className="h-4 w-4" />
              Integration hinzufügen
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
