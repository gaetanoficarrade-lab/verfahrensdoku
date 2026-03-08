import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
}

export default function AdminSettingsGeneral() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({
    platform_name: 'GoBD-Suite',
    support_email: '',
    default_plan_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [settingsRes, plansRes] = await Promise.all([
        supabase.from('platform_settings').select('*').eq('key', 'general').maybeSingle(),
        supabase.from('plans').select('id, name').order('name'),
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
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'general', value: form }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Einstellungen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
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
              <p className="text-xs text-muted-foreground">
                Wird in der Navigation und E-Mails als Produktname verwendet.
              </p>
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
              <p className="text-xs text-muted-foreground">
                Wird beim Anlegen neuer Lizenznehmer als Vorauswahl verwendet.
              </p>
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
