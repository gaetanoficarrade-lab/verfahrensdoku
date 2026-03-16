import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { HelpTooltip } from '@/components/HelpTooltip';
import PlanSelection from '@/components/PlanSelection';

interface TenantPlanInfo {
  planName: string;
  maxClients: number;
  maxProjects: number;
  priceMonthly: number;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  currentClients: number;
  currentProjects: number;
  isFree: boolean;
}

export default function BillingSettings() {
  const { effectiveTenantId } = useAuthContext();
  const { isTrialing, daysLeft, trialExpired } = useTrialRestrictions();
  const [loading, setLoading] = useState(true);
  const [tenantPlan, setTenantPlan] = useState<TenantPlanInfo | null>(null);

  useEffect(() => {
    if (!effectiveTenantId) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      const [tenantRes, clientsRes, projectsRes] = await Promise.all([
        supabase.from('tenants').select('plan_id, trial_ends_at, subscription_status, is_free, plans(name, max_clients, max_projects, price_monthly)').eq('id', effectiveTenantId).single(),
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
        subscriptionStatus: (tenantRes.data as any)?.subscription_status || null,
        currentClients: clientsRes.count || 0,
        currentProjects: projectsRes.count || 0,
        isFree: (tenantRes.data as any)?.is_free === true,
      });
      setLoading(false);
    };
    load();
  }, [effectiveTenantId]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const showUpgrade = !tenantPlan?.isFree && (isTrialing || trialExpired || tenantPlan?.subscriptionStatus === 'trialing');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Abrechnung & Plan
          <HelpTooltip textKey="billing" />
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Ihr aktueller Plan und Nutzung</p>
      </div>

      {/* Trial info */}
      {isTrialing && daysLeft !== null && daysLeft > 0 && (
        <Card className="border-accent">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Testmodus aktiv – noch {daysLeft} Tag{daysLeft !== 1 ? 'e' : ''}
              </p>
              <p className="text-xs text-muted-foreground">Wählen Sie einen Plan um alle Funktionen freizuschalten.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {trialExpired && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Testzugang abgelaufen</p>
              <p className="text-xs text-muted-foreground">Bitte wählen Sie einen Plan um fortzufahren.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current plan info (only if not trialing) */}
      {!showUpgrade && tenantPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Aktueller Plan: {tenantPlan.planName}</CardTitle>
            <CardDescription>
              {tenantPlan.isFree
                ? 'Kostenlos – keine Abrechnung'
                : tenantPlan.priceMonthly
                  ? `${tenantPlan.priceMonthly.toFixed(2)} € / Monat`
                  : 'Einmalzahlung'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kunden</span>
                {tenantPlan.maxClients >= 999 || tenantPlan.maxClients === 0 ? (
                  <span className="font-medium">{tenantPlan.currentClients} <span className="text-muted-foreground font-normal">(unbegrenzt)</span></span>
                ) : (
                  <span className="font-medium">{tenantPlan.currentClients} / {tenantPlan.maxClients}</span>
                )}
              </div>
              {tenantPlan.maxClients > 0 && tenantPlan.maxClients < 999 && (
                <Progress value={(tenantPlan.currentClients / tenantPlan.maxClients) * 100} className="h-2" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan selection for upgrade */}
      {showUpgrade && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Plan auswählen</h2>
          <PlanSelection currentPlan={tenantPlan?.planName} />
        </div>
      )}

      {/* Upgrade / billing cycle switch */}
      {!showUpgrade && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {tenantPlan?.planName?.toLowerCase() === 'agentur' ? 'Abrechnungszeitraum wechseln' : 'Upgrade'}
          </h2>
          <PlanSelection currentPlan={tenantPlan?.planName} />
        </div>
      )}
    </div>
  );
}
