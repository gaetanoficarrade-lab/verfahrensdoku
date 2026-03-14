import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/auditLog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export default function ClientNew() {
  const { effectiveTenantId, isSuperAdmin } = useAuthContext();
  const { canCreateClients, isTrialing } = useTrialRestrictions();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Block trial users from creating clients
  useEffect(() => {
    if (!canCreateClients && isTrialing) {
      toast({ title: 'Testmodus', description: 'Im Testmodus können keine eigenen Mandanten angelegt werden.', variant: 'destructive' });
      navigate('/clients');
    }
  }, [canCreateClients, isTrialing]);
  const [saving, setSaving] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ current: number; max: number } | null>(null);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [form, setForm] = useState({
    company: '',
    industry: '',
    contact_name: '',
    contact_email: '',
  });

  useEffect(() => {
    if (!effectiveTenantId) return;
    const checkLimit = async () => {
      setLoadingLimit(true);
      const [countRes, tenantRes] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId),
        supabase.from('tenants').select('plan_id, plans(max_clients)').eq('id', effectiveTenantId).single(),
      ]);
      const current = countRes.count || 0;
      const max = (tenantRes.data as any)?.plans?.max_clients || 999;
      setLimitInfo({ current, max });
      setLoadingLimit(false);
    };
    checkLimit();
  }, [effectiveTenantId]);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const isLimitReached = limitInfo ? limitInfo.current >= limitInfo.max : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast({ title: 'Fehler', description: 'Firmenname ist erforderlich.', variant: 'destructive' });
      return;
    }
    if (!effectiveTenantId) {
      toast({ title: 'Fehler', description: 'Kein Lizenznehmer zugewiesen.', variant: 'destructive' });
      return;
    }
    if (isLimitReached && !isSuperAdmin) {
      toast({ title: 'Limit erreicht', description: 'Sie haben die maximale Anzahl an Mandanten für Ihren Plan erreicht. Bitte upgraden Sie Ihren Plan.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('clients')
      .insert({
        tenant_id: effectiveTenantId,
        company: form.company.trim(),
        industry: form.industry.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim() || null,
      })
      .select('id')
      .single();

    setSaving(false);
    if (error) {
      if (error.message.includes('row-level security') || error.message.includes('check_client_limit')) {
        toast({ title: 'Mandanten-Limit erreicht', description: 'Sie haben die maximale Anzahl an Mandanten für Ihren Plan erreicht.', variant: 'destructive' });
      } else {
        toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      }
      return;
    }
    toast({ title: 'Mandant erstellt', description: `${form.company} wurde erfolgreich angelegt.` });
    logAudit('client_created', 'client', data.id, { company: form.company });
    navigate(`/clients/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Neuer Mandant</h1>
          <p className="text-sm text-muted-foreground mt-1">Mandant anlegen und später zum Onboarding einladen</p>
        </div>
      </div>

      {/* Limit info */}
      {!loadingLimit && limitInfo && (
        <Card className={isLimitReached && !isSuperAdmin ? 'border-destructive' : ''}>
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mandanten-Kontingent</span>
              <span className={`font-medium ${isLimitReached ? 'text-destructive' : 'text-foreground'}`}>
                {limitInfo.current} / {limitInfo.max} genutzt
              </span>
            </div>
            <Progress
              value={(limitInfo.current / limitInfo.max) * 100}
              className={`h-2 ${isLimitReached ? '[&>div]:bg-destructive' : ''}`}
            />
            {isLimitReached && !isSuperAdmin && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Limit erreicht. Bitte kontaktieren Sie den Support für ein Upgrade.</span>
              </div>
            )}
            {isLimitReached && isSuperAdmin && (
              <p className="text-xs text-muted-foreground">Als Super-Admin können Sie das Limit überschreiben.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stammdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Firmenname *</Label>
              <Input id="company" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Mustermann GmbH" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Input id="industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="z.B. Handwerk, IT, Gastronomie" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Ansprechpartner</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Max Mustermann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-Mail</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} placeholder="max@beispiel.de" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving || (isLimitReached && !isSuperAdmin)}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Mandant anlegen
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Abbrechen</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
