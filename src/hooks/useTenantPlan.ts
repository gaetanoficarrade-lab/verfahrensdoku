import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface TenantPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_type: string | null;
  max_clients: number;
  max_clients_unlimited: boolean;
  has_whitelabel: boolean;
  has_advisor_portal: boolean;
  has_ai_features: boolean;
  has_pdf_export: boolean;
}

export interface TenantPlanInfo {
  plan: TenantPlan | null;
  isSolo: boolean;
  isBerater: boolean;
  isAgentur: boolean;
  isFree: boolean;
  trialActive: boolean;
  // Feature checks
  canBrand: boolean;
  canWhitelabel: boolean;
  canManageTeam: boolean;
  canUseWebhooks: boolean;
  canUseTemplates: boolean;
  canUseEmailTemplates: boolean;
  canUseAffiliate: boolean;
  canUseActivityLog: boolean;
}

export function useTenantPlan(): TenantPlanInfo & { loading: boolean } {
  const { effectiveTenantId } = useAuthContext();

  const { data, isLoading } = useQuery({
    queryKey: ['tenant-plan', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return null;

      // Fetch tenant with plan
      const { data: tenant, error: tErr } = await supabase
        .from('tenants')
        .select('plan_id, is_free, trial_active')
        .eq('id', effectiveTenantId)
        .maybeSingle();

      if (tErr || !tenant?.plan_id) return { plan: null, is_free: tenant?.is_free ?? false, trial_active: tenant?.trial_active ?? false };

      const { data: plan, error: pErr } = await supabase
        .from('plans')
        .select('*')
        .eq('id', tenant.plan_id)
        .maybeSingle();

      if (pErr) return { plan: null, is_free: tenant.is_free ?? false, trial_active: tenant.trial_active ?? false };
      return { plan, is_free: tenant.is_free ?? false, trial_active: tenant.trial_active ?? false };
    },
    enabled: !!effectiveTenantId,
  });

  const plan = data?.plan ?? null;
  const planName = plan?.name?.toLowerCase() ?? '';
  const isSolo = planName === 'solo';
  const isBerater = planName === 'berater';
  const isAgentur = planName === 'agentur';
  const isFree = data?.is_free ?? false;
  const trialActive = data?.trial_active ?? false;

  return {
    plan,
    isSolo,
    isBerater,
    isAgentur,
    isFree,
    trialActive,
    loading: isLoading,
    // Solo: only VD creation, no settings at all
    // Berater: no branding/whitelabel
    // Agentur: everything
    canBrand: isAgentur,
    canWhitelabel: isAgentur,
    canManageTeam: !isSolo,
    canUseWebhooks: !isSolo,
    canUseTemplates: !isSolo,
    canUseEmailTemplates: !isSolo,
    canUseAffiliate: !isSolo,
    canUseActivityLog: !isSolo,
  };
}
