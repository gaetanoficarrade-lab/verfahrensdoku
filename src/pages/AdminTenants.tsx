import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Plus, Pencil, Trash2, Power, PowerOff, Eye, Send, Loader2, X, RefreshCw, Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: string;
  name: string;
  max_clients: number;
  max_projects: number;
  price_monthly: number;
}

interface Tenant {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  plan_id: string | null;
  created_at: string;
}

const AdminTenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', contact_name: '', contact_email: '', plan_id: '' });
  const { toast } = useToast();
  const { startImpersonation } = useAuthContext();
  const navigate = useNavigate();

  // Resend invite state
  const [showResendDialog, setShowResendDialog] = useState(false);
  const [resendTenant, setResendTenant] = useState<Tenant | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  const buildInviteHtml = (greeting: string, displayName: string, inviteLink: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Willkommen bei GoBD-Suite</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">${greeting}</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihr Unterkonto <strong>${displayName}</strong> wurde erstellt. 
    Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${inviteLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Passwort festlegen
    </a>
  </div>
  <p style="color: #999; font-size: 13px;">
    Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
    <a href="${inviteLink}" style="color: #999;">${inviteLink}</a>
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Der Link ist 24 Stunden gültig. Diese E-Mail wurde von GoBD-Suite versendet.</p>
</div>`;

  const sendTenantInvite = async (tenantId: string, email: string, tenantName?: string | null, contactName?: string | null) => {
    // Step 1: Create user + generate invite link via Edge Function
    const { data, error } = await supabase.functions.invoke('invite-tenant', {
      body: { tenant_id: tenantId, email },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const inviteLink = data?.invite_link;
    if (!inviteLink) throw new Error('Kein Einladungslink generiert');

    // Step 2: Send email via minimal Edge Function (no DB access)
    const displayName = tenantName || 'Ihr Unternehmen';
    const greeting = contactName ? `Hallo ${contactName},` : 'Sehr geehrte Damen und Herren,';

    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
      body: {
        to: email,
        subject: 'Willkommen bei GoBD-Suite – Ihr Zugang',
        html: buildInviteHtml(greeting, displayName, inviteLink),
      },
    });
    if (emailError) throw emailError;
    if (emailData?.error) throw new Error(emailData.error);
  };

  const fetchData = async () => {
    setLoading(true);
    const [tenantsRes, plansRes] = await Promise.all([
      supabase.from('tenants').select('*').order('created_at', { ascending: false }),
      supabase.from('plans').select('*').order('price_monthly'),
    ]);
    setTenants(tenantsRes.data || []);
    setPlans(plansRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingTenant(null);
    setForm({ name: '', contact_name: '', contact_email: '', plan_id: '' });
    setDialogOpen(true);
  };

  const openEdit = (t: Tenant) => {
    setEditingTenant(t);
    setForm({
      name: t.name,
      contact_name: t.contact_name || '',
      contact_email: t.contact_email || '',
      plan_id: t.plan_id || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ variant: 'destructive', title: 'Name ist erforderlich.' });
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      plan_id: form.plan_id || null,
    };

    if (editingTenant) {
      const { error } = await supabase.from('tenants').update(payload).eq('id', editingTenant.id);
      if (error) {
        toast({ variant: 'destructive', title: 'Fehler', description: error.message });
      } else {
        toast({ title: 'Unterkonto aktualisiert.' });
      }
    } else {
      // Create tenant
      const { data: newTenant, error } = await supabase.from('tenants').insert(payload).select('id').single();
      if (error) {
        toast({ variant: 'destructive', title: 'Fehler', description: error.message });
      } else {
        toast({ title: 'Unterkonto erstellt.' });

        // Auto-send invite email if contact_email is provided
        if (payload.contact_email && newTenant) {
          try {
            await sendTenantInvite(newTenant.id, payload.contact_email, payload.name, payload.contact_name);
            toast({ title: 'Einladungs-E-Mail versendet', description: `An ${payload.contact_email}` });
          } catch (err: any) {
            console.error('Failed to send tenant invite:', err);
            toast({ variant: 'destructive', title: 'Einladung konnte nicht gesendet werden', description: err.message });
          }
        }
      }
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleToggleActive = async (t: Tenant) => {
    const { error } = await supabase
      .from('tenants')
      .update({ is_active: !t.is_active })
      .eq('id', t.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      toast({ title: t.is_active ? 'Unterkonto deaktiviert.' : 'Unterkonto aktiviert.' });
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    const { error } = await supabase.from('tenants').delete().eq('id', deletingTenant.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: error.message });
    } else {
      toast({ title: 'Unterkonto gelöscht.' });
      fetchData();
    }
    setDeleteDialogOpen(false);
    setDeletingTenant(null);
  };

  const handleImpersonate = (t: Tenant) => {
    startImpersonation(t.id, t.name);
    navigate('/');
  };

  const handleResendInvite = async () => {
    if (!resendTenant || !resendEmail.trim()) return;
    setResending(true);
    try {
      await sendTenantInvite(resendTenant.id, resendEmail.trim(), resendTenant.name, resendTenant.contact_name);
      toast({ title: 'Einladung versendet', description: `An ${resendEmail.trim()}` });
      setShowResendDialog(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Fehler', description: err.message });
    } finally {
      setResending(false);
    }
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return '–';
    const plan = plans.find((p) => p.id === planId);
    return plan?.name || '–';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Unterkonten</h1>
          <p className="text-sm text-muted-foreground mt-1">Verwaltung aller Kanzleien und Berater</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Neu anlegen
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {tenants.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Noch keine Unterkonten vorhanden.
              </p>
            )}
            {tenants.map((tenant) => (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{tenant.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{tenant.contact_email || '–'}</span>
                      <span>·</span>
                      <span>{getPlanName(tenant.plan_id)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={tenant.is_active ? 'default' : 'secondary'} className="mr-2">
                    {tenant.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setResendTenant(tenant);
                      setResendEmail(tenant.contact_email || '');
                      setShowResendDialog(true);
                    }}
                    className="mr-1"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(tenant)} title="Bearbeiten">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(tenant)}
                    title={tenant.is_active ? 'Deaktivieren' : 'Aktivieren'}
                  >
                    {tenant.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleImpersonate(tenant)} title="Impersonieren">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setDeletingTenant(tenant); setDeleteDialogOpen(true); }}
                    title="Löschen"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTenant ? 'Lizenznehmer bearbeiten' : 'Neuer Lizenznehmer'}</DialogTitle>
            <DialogDescription>
              {editingTenant ? 'Daten des Lizenznehmers ändern.' : 'Neuen Lizenznehmer anlegen. Bei Angabe einer E-Mail wird automatisch eine Einladung versendet.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ansprechpartner</Label>
              <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={form.plan_id} onValueChange={(v) => setForm({ ...form, plan_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan wählen" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} – {p.price_monthly}€/Monat
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTenant ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lizenznehmer löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingTenant?.name}</strong> und alle zugehörigen Daten werden unwiderruflich gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resend Invite Dialog */}
      <Dialog open={showResendDialog} onOpenChange={setShowResendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Einladung senden</DialogTitle>
            <DialogDescription>
              Senden Sie eine Einladungs-E-Mail an <strong>{resendTenant?.name}</strong>.
              Der Empfänger erhält einen Link zur Registrierung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>E-Mail-Adresse</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="pl-10"
                  placeholder="kontakt@kanzlei.de"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResendDialog(false)}>Abbrechen</Button>
            <Button onClick={handleResendInvite} disabled={!resendEmail.trim() || resending}>
              {resending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Send className="h-4 w-4 mr-1" />
              Einladung senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTenants;
