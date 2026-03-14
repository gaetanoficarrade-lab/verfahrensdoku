import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Save, CreditCard, Pencil, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Plan {
  id: string;
  name: string;
  max_clients: number;
  max_projects: number;
  price_monthly: number;
  price_type: string;
  setup_fee: number;
  setup_fee_enabled: boolean;
  renewal_price: number;
  duration_months: number | null;
  trial_days: number;
  max_clients_unlimited: boolean;
  has_whitelabel: boolean;
  has_advisor_portal: boolean;
  has_ai_features: boolean;
  has_pdf_export: boolean;
  is_active: boolean;
  sort_order: number;
}

interface UpgradeRule {
  id: string;
  from_plan_id: string;
  to_plan_id: string;
  requires_setup_fee: boolean;
}

type PlanForm = Omit<Plan, 'id'>;

const emptyForm: PlanForm = {
  name: '',
  max_clients: 5,
  max_projects: 999,
  price_monthly: 0,
  price_type: 'monthly',
  setup_fee: 0,
  setup_fee_enabled: false,
  renewal_price: 0,
  duration_months: null,
  trial_days: 0,
  max_clients_unlimited: false,
  has_whitelabel: false,
  has_advisor_portal: false,
  has_ai_features: true,
  has_pdf_export: true,
  is_active: true,
  sort_order: 0,
};

function formatPrice(plan: Plan): string {
  const price = Number(plan.price_monthly);
  if (plan.price_type === 'one_time') return `${price.toLocaleString('de-DE')}€ einmalig`;
  if (plan.price_type === 'yearly') return `${price.toLocaleString('de-DE')}€/Jahr`;
  return `${price.toLocaleString('de-DE')}€/Monat`;
}

function formatClients(plan: Plan): string {
  if (plan.max_clients_unlimited) return 'Unbegrenzt';
  return String(plan.max_clients);
}

export default function AdminSettingsPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [upgradeRules, setUpgradeRules] = useState<UpgradeRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Upgrade rules dialog
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState<{ from_plan_id: string; to_plan_id: string; requires_setup_fee: boolean }>({
    from_plan_id: '',
    to_plan_id: '',
    requires_setup_fee: false,
  });

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, rulesRes] = await Promise.all([
      supabase.from('plans').select('*').order('sort_order', { ascending: true }),
      supabase.from('plan_upgrade_rules').select('*'),
    ]);
    setPlans((plansRes.data as Plan[]) || []);
    setUpgradeRules((rulesRes.data as UpgradeRule[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    const { id, ...rest } = plan;
    setForm(rest);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Bitte Plan-Namen eingeben.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        max_clients: form.max_clients_unlimited ? 999 : form.max_clients,
        duration_months: form.duration_months || null,
      };

      if (editingPlan) {
        const { error } = await supabase.from('plans').update(payload).eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('Plan aktualisiert');
      }
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    const { error } = await supabase.from('plans').update({ is_active: !plan.is_active }).eq('id', plan.id);
    if (error) {
      toast.error('Fehler: ' + error.message);
      return;
    }
    toast.success(plan.is_active ? 'Plan deaktiviert' : 'Plan aktiviert');
    await fetchData();
  };

  const handleDeleteUpgradeRule = async (ruleId: string) => {
    const { error } = await supabase.from('plan_upgrade_rules').delete().eq('id', ruleId);
    if (error) {
      toast.error('Fehler: ' + error.message);
      return;
    }
    toast.success('Upgrade-Regel entfernt');
    await fetchData();
  };

  const handleSaveUpgradeRule = async () => {
    if (!upgradeForm.from_plan_id || !upgradeForm.to_plan_id) {
      toast.error('Bitte beide Pläne auswählen.');
      return;
    }
    if (upgradeForm.from_plan_id === upgradeForm.to_plan_id) {
      toast.error('Von- und Ziel-Plan müssen unterschiedlich sein.');
      return;
    }
    const { error } = await supabase.from('plan_upgrade_rules').insert(upgradeForm);
    if (error) {
      toast.error('Fehler: ' + error.message);
      return;
    }
    toast.success('Upgrade-Regel erstellt');
    setUpgradeDialogOpen(false);
    await fetchData();
  };

  const getPlanName = (id: string) => plans.find((p) => p.id === id)?.name || '?';

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
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan-Verwaltung
          </h2>
          <p className="text-sm text-muted-foreground">
            Änderungen gelten nur für neue Kunden. Bestehende Abonnements bleiben unverändert.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Änderungen an Plänen wirken sich nur auf neue Abonnements aus. Bestehende Kunden behalten ihre aktuellen Konditionen bis zum nächsten Renewal.
          </AlertDescription>
        </Alert>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pläne</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Setup Fee</TableHead>
                  <TableHead>Mandanten</TableHead>
                  <TableHead>Testmodus</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} className={!plan.is_active ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatPrice(plan)}
                        {plan.renewal_price > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Renewal: {Number(plan.renewal_price).toLocaleString('de-DE')}€/Jahr
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.setup_fee_enabled ? (
                        <Badge variant="secondary">{Number(plan.setup_fee).toLocaleString('de-DE')}€</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatClients(plan)}</TableCell>
                    <TableCell>
                      {plan.trial_days > 0 ? (
                        <Badge variant="outline">{plan.trial_days} Tage</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.has_whitelabel && <Badge variant="secondary" className="text-xs">Whitelabel</Badge>}
                        {plan.has_advisor_portal && <Badge variant="secondary" className="text-xs">Berater-Portal</Badge>}
                        {plan.has_ai_features && <Badge variant="secondary" className="text-xs">KI</Badge>}
                        {plan.has_pdf_export && <Badge variant="secondary" className="text-xs">PDF</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'outline'}>
                        {plan.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upgrade Rules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upgrade-Regeln</CardTitle>
              <CardDescription>Definiert welche Plan-Upgrades möglich sind</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUpgradeForm({ from_plan_id: '', to_plan_id: '', requires_setup_fee: false });
                setUpgradeDialogOpen(true);
              }}
            >
              Regel hinzufügen
            </Button>
          </CardHeader>
          <CardContent>
            {upgradeRules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Keine Upgrade-Regeln definiert.</p>
            ) : (
              <div className="space-y-2">
                {upgradeRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{getPlanName(rule.from_plan_id)}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">{getPlanName(rule.to_plan_id)}</Badge>
                      {rule.requires_setup_fee ? (
                        <span className="text-xs text-muted-foreground ml-2">+ Setup Fee</span>
                      ) : (
                        <span className="text-xs text-primary ml-2">Keine erneute Setup Fee</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteUpgradeRule(rule.id)}>
                      Entfernen
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plan bearbeiten: {editingPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sortierung</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Preisgestaltung</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preis (€)</Label>
                  <Input
                    type="number"
                    value={form.price_monthly}
                    onChange={(e) => setForm((p) => ({ ...p, price_monthly: Number(e.target.value) }))}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abrechnungsart</Label>
                  <Select value={form.price_type} onValueChange={(v) => setForm((p) => ({ ...p, price_type: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                      <SelectItem value="one_time">Einmalig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.setup_fee_enabled}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, setup_fee_enabled: v }))}
                    />
                    <Label>Setup Fee</Label>
                  </div>
                  {form.setup_fee_enabled && (
                    <Input
                      type="number"
                      value={form.setup_fee}
                      onChange={(e) => setForm((p) => ({ ...p, setup_fee: Number(e.target.value) }))}
                      min={0}
                      step={0.01}
                      placeholder="Betrag in €"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Renewal-Preis (€/Jahr)</Label>
                  <Input
                    type="number"
                    value={form.renewal_price}
                    onChange={(e) => setForm((p) => ({ ...p, renewal_price: Number(e.target.value) }))}
                    min={0}
                    step={0.01}
                    placeholder="0 = kein Renewal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Laufzeit in Monaten</Label>
                  <Input
                    type="number"
                    value={form.duration_months ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, duration_months: e.target.value ? Number(e.target.value) : null }))}
                    placeholder="Leer = unbegrenzt"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Testmodus (Tage)</Label>
                  <Input
                    type="number"
                    value={form.trial_days}
                    onChange={(e) => setForm((p) => ({ ...p, trial_days: Number(e.target.value) }))}
                    min={0}
                    placeholder="0 = kein Testmodus"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Limits */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.max_clients_unlimited}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, max_clients_unlimited: v }))}
                    />
                    <Label>Unbegrenzte Mandanten</Label>
                  </div>
                  {!form.max_clients_unlimited && (
                    <Input
                      type="number"
                      value={form.max_clients}
                      onChange={(e) => setForm((p) => ({ ...p, max_clients: Number(e.target.value) }))}
                      min={1}
                      placeholder="Max. Mandanten"
                    />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.has_whitelabel}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, has_whitelabel: !!v }))}
                  />
                  <Label className="font-normal">Whitelabel</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.has_advisor_portal}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, has_advisor_portal: !!v }))}
                  />
                  <Label className="font-normal">Berater-Portal</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.has_ai_features}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, has_ai_features: !!v }))}
                  />
                  <Label className="font-normal">KI-Funktionen</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={form.has_pdf_export}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, has_pdf_export: !!v }))}
                  />
                  <Label className="font-normal">PDF-Export</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
              />
              <Label>Plan aktiv</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Aktualisieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Rule Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade-Regel hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Von Plan</Label>
              <Select value={upgradeForm.from_plan_id} onValueChange={(v) => setUpgradeForm((p) => ({ ...p, from_plan_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan wählen" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zu Plan</Label>
              <Select value={upgradeForm.to_plan_id} onValueChange={(v) => setUpgradeForm((p) => ({ ...p, to_plan_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan wählen" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={upgradeForm.requires_setup_fee}
                onCheckedChange={(v) => setUpgradeForm((p) => ({ ...p, requires_setup_fee: v }))}
              />
              <Label>Erneute Setup Fee erforderlich</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveUpgradeRule}>
              <Save className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSettingsLayout>
  );
}
