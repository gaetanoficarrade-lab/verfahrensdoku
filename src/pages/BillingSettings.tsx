import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HelpTooltip } from '@/components/HelpTooltip';

interface TenantPlan {
  planName: string;
  maxClients: number;
  maxProjects: number;
  priceMonthly: number;
  trialEndsAt: string | null;
  currentClients: number;
  currentProjects: number;
}


export default function BillingSettings() {
  const { effectiveTenantId, user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tenantPlan, setTenantPlan] = useState<TenantPlan | null>(null);



  useEffect(() => {
    if (!effectiveTenantId) return;
    const load = async () => {
      setLoading(true);
      const [tenantRes, plansRes, clientsRes, projectsRes] = await Promise.all([
        supabase.from('tenants').select('plan_id, trial_ends_at, plans(name, max_clients, max_projects, price_monthly)').eq('id', effectiveTenantId).single(),
        supabase.from('plans').select('*').order('price_monthly'),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('tenant_id', effectiveTenantId),
      ]);
      const plan = (tenantRes.data as any)?.plans;
      setTenantPlan({
        planName: plan?.name || 'Kein Plan',
        maxClients: plan?.max_clients || 0,
        maxProjects: plan?.max_projects || 0,
        priceMonthly: plan?.price_monthly || 0,
        trialEndsAt: (tenantRes.data as any)?.trial_ends_at || null,
        currentClients: clientsRes.count || 0,
        currentProjects: projectsRes.count || 0,
      });
      setAllPlans((plansRes.data || []) as Plan[]);
      setLoading(false);
    };
    load();
  }, [effectiveTenantId]);

  const trialDaysLeft = tenantPlan?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(tenantPlan.trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const handleUpgradeRequest = async (planName: string) => {
    setRequesting(true);
    // Create notification for super_admin
    await supabase.from('notifications').insert({
      user_id: user?.id,
      title: 'Upgrade angefragt',
      message: `Lizenznehmer hat ein Upgrade auf "${planName}" angefragt.`,
      link: '/admin/tenants',
    });
    toast({ title: 'Upgrade angefragt', description: 'Der Administrator wurde benachrichtigt und wird sich bei Ihnen melden.' });
    setRequesting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Abrechnung & Plan
          <HelpTooltip textKey="billing" />
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ihr aktueller Plan und Nutzung</p>
      </div>

      {trialDaysLeft !== null && trialDaysLeft > 0 && (
        <Card className="border-accent">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Testphase: noch {trialDaysLeft} Tag{trialDaysLeft !== 1 ? 'e' : ''} verbleibend
              </p>
              <p className="text-xs text-muted-foreground">Nach Ablauf der Testphase benötigen Sie einen aktiven Plan.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {trialDaysLeft !== null && trialDaysLeft <= 0 && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Testphase abgelaufen</p>
              <p className="text-xs text-muted-foreground">Bitte wählen Sie einen Plan um fortzufahren.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aktueller Plan: {tenantPlan?.planName}</CardTitle>
          <CardDescription>{tenantPlan?.priceMonthly ? `${tenantPlan.priceMonthly.toFixed(2)} € / Monat` : 'Kostenlos'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mandanten</span>
              <span className="font-medium">{tenantPlan?.currentClients} / {tenantPlan?.maxClients}</span>
            </div>
            <Progress value={tenantPlan?.maxClients ? (tenantPlan.currentClients / tenantPlan.maxClients) * 100 : 0} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Projekte</span>
              <span className="font-medium">{tenantPlan?.currentProjects} / {tenantPlan?.maxProjects}</span>
            </div>
            <Progress value={tenantPlan?.maxProjects ? (tenantPlan.currentProjects / tenantPlan.maxProjects) * 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zahlungsmethode</CardTitle>
          <CardDescription>Wird in Kürze verfügbar sein</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>
            <CreditCard className="h-4 w-4 mr-2" />
            Zahlungsmethode hinterlegen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
