import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Loader2, Save, CreditCard, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  max_clients: number;
  max_projects: number;
  price_monthly: number;
}

const emptyPlan: Omit<Plan, 'id'> = {
  name: '',
  max_clients: 5,
  max_projects: 10,
  price_monthly: 0,
};

export default function AdminSettingsPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true });
    setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openNew = () => {
    setEditingPlan(null);
    setForm(emptyPlan);
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      max_clients: plan.max_clients,
      max_projects: plan.max_projects,
      price_monthly: plan.price_monthly,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Bitte geben Sie einen Plan-Namen ein.');
      return;
    }
    setSaving(true);
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('plans')
          .update(form)
          .eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('Plan aktualisiert');
      } else {
        const { error } = await supabase.from('plans').insert(form);
        if (error) throw error;
        toast.success('Plan erstellt');
      }
      setDialogOpen(false);
      await fetchPlans();
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan-Verwaltung
            </h2>
            <p className="text-sm text-muted-foreground">Pläne für Unterkonten verwalten</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Neuer Plan
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Noch keine Pläne vorhanden.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Max. Mandanten</TableHead>
                    <TableHead className="text-right">Max. Projekte</TableHead>
                    <TableHead className="text-right">Preis / Monat</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell className="text-right">{plan.max_clients}</TableCell>
                      <TableCell className="text-right">{plan.max_projects}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {Number(plan.price_monthly).toFixed(2)} €
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Plan bearbeiten' : 'Neuen Plan erstellen'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="z.B. Professional"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max. Mandanten</Label>
                <Input
                  type="number"
                  value={form.max_clients}
                  onChange={(e) => setForm((p) => ({ ...p, max_clients: Number(e.target.value) }))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Max. Projekte</Label>
                <Input
                  type="number"
                  value={form.max_projects}
                  onChange={(e) => setForm((p) => ({ ...p, max_projects: Number(e.target.value) }))}
                  min={1}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preis pro Monat (€)</Label>
              <Input
                type="number"
                value={form.price_monthly}
                onChange={(e) => setForm((p) => ({ ...p, price_monthly: Number(e.target.value) }))}
                min={0}
                step={0.01}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {editingPlan ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSettingsLayout>
  );
}
