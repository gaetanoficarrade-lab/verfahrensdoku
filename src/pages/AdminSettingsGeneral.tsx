import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Settings, Clock, Link2, Mail, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HelpTooltip } from '@/components/HelpTooltip';

interface Plan {
  id: string;
  name: string;
}

interface PlatformSetting {
  key: string;
  value: string;
  description: string;
}

export default function AdminSettingsGeneral() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({
    support_email: '',
    default_plan_id: '',
  });
  const [platformSettings, setPlatformSettings] = useState<Record<string, string>>({
    trial_enabled: 'true',
    trial_days: '14',
    session_timeout_minutes: '30',
    session_warning_minutes: '5',
    affiliate_cookie_days: '30',
    affiliate_default_commission: '20',
    invite_expiry_days: '7',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [settingsRes, plansRes, platformRes] = await Promise.all([
        supabase.from('platform_settings').select('*').eq('key', 'general').maybeSingle(),
        supabase.from('plans').select('id, name').order('name'),
        supabase.from('platform_settings').select('key, value').in('key', [
          'trial_enabled', 'trial_days', 'session_timeout_minutes', 'session_warning_minutes',
          'affiliate_cookie_days', 'affiliate_default_commission', 'invite_expiry_days',
        ]),
      ]);

      if (settingsRes.data?.value) {
        const val = settingsRes.data.value as Record<string, string>;
        setForm({
          platform_name: val.platform_name || 'GoBD-Suite',
          support_email: val.support_email || '',
          default_plan_id: val.default_plan_id || '',
        });
      }
      setPlans(plansRes.data || []);

      if (platformRes.data) {
        const map: Record<string, string> = { ...platformSettings };
        platformRes.data.forEach((d: any) => {
          map[d.key] = typeof d.value === 'string' ? d.value : JSON.stringify(d.value);
        });
        setPlatformSettings(map);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save general settings
      const { error: genError } = await supabase
        .from('platform_settings')
        .upsert({ key: 'general', value: form }, { onConflict: 'key' });
      if (genError) throw genError;

      // Save platform settings
      const entries = Object.entries(platformSettings);
      for (const [key, value] of entries) {
        await supabase
          .from('platform_settings')
          .upsert({ key, value, description: getDescription(key) }, { onConflict: 'key' });
      }

      toast.success('Einstellungen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getDescription = (key: string): string => {
    const map: Record<string, string> = {
      trial_enabled: 'Testphase für neue Lizenznehmer aktivieren',
      trial_days: 'Dauer der Testphase in Tagen',
      session_timeout_minutes: 'Inaktivitäts-Timeout in Minuten',
      session_warning_minutes: 'Warnung vor Logout in Minuten',
      affiliate_cookie_days: 'Cookie-Laufzeit für Affiliate-Tracking',
      affiliate_default_commission: 'Standard-Provision in Prozent',
      invite_expiry_days: 'Ablaufzeit für Einladungslinks in Tagen',
    };
    return map[key] || '';
  };

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
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Allgemeine Einstellungen
            </CardTitle>
            <CardDescription>Grundlegende Plattformkonfiguration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Plattformname</Label>
              <Input
                value={form.platform_name}
                onChange={(e) => setForm((p) => ({ ...p, platform_name: e.target.value }))}
                placeholder="GoBD-Suite"
              />
            </div>

            <div className="space-y-2">
              <Label>Support-E-Mail</Label>
              <Input
                value={form.support_email}
                onChange={(e) => setForm((p) => ({ ...p, support_email: e.target.value }))}
                placeholder="support@gobd-suite.de"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <Label>Standard-Plan für neue Lizenznehmer</Label>
              <Select
                value={form.default_plan_id}
                onValueChange={(v) => setForm((p) => ({ ...p, default_plan_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Plan auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trial Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Testphase
              <HelpTooltip textKey="trial_period" />
            </CardTitle>
            <CardDescription>Konfiguration der kostenlosen Testphase für neue Lizenznehmer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Testphase aktivieren</Label>
                <p className="text-xs text-muted-foreground">Gilt für alle neu angelegten Lizenznehmer</p>
              </div>
              <Switch
                checked={platformSettings.trial_enabled === 'true'}
                onCheckedChange={(v) => setPlatformSettings(p => ({ ...p, trial_enabled: v ? 'true' : 'false' }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Dauer in Tagen</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={platformSettings.trial_days}
                onChange={(e) => setPlatformSettings(p => ({ ...p, trial_days: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Timeout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session-Timeout
              <HelpTooltip textKey="session_timeout" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Inaktivitäts-Timeout (Minuten)</Label>
              <Input
                type="number"
                min={5}
                max={480}
                value={platformSettings.session_timeout_minutes}
                onChange={(e) => setPlatformSettings(p => ({ ...p, session_timeout_minutes: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Vorwarn-Zeitraum (Minuten)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={platformSettings.session_warning_minutes}
                onChange={(e) => setPlatformSettings(p => ({ ...p, session_warning_minutes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Affiliate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cookie-Laufzeit (Tage)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={platformSettings.affiliate_cookie_days}
                onChange={(e) => setPlatformSettings(p => ({ ...p, affiliate_cookie_days: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Standard-Provision (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={platformSettings.affiliate_default_commission}
                onChange={(e) => setPlatformSettings(p => ({ ...p, affiliate_default_commission: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Invitation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Einladungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Ablaufzeit für Einladungslinks (Tage)</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={platformSettings.invite_expiry_days}
                onChange={(e) => setPlatformSettings(p => ({ ...p, invite_expiry_days: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
