import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface TrialRestrictions {
  isTrialing: boolean;
  daysLeft: number | null;
  trialExpired: boolean;
  /** Only Muster GmbH visible, no new clients */
  canCreateClients: boolean;
  /** Max 2 chapters editable */
  maxEditableChapters: number | null;
  /** PDF watermark text (null = no watermark) */
  pdfWatermark: string | null;
  /** Show trial banner */
  showBanner: boolean;
  loading: boolean;
}

export function useTrialRestrictions(): TrialRestrictions {
  const { effectiveTenantId, isSuperAdmin } = useAuthContext();

  const { data, isLoading } = useQuery({
    queryKey: ['trial-restrictions', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return null;

      const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_status, trial_ends_at, is_free')
        .eq('id', effectiveTenantId)
        .single();

      return tenant;
    },
    enabled: !!effectiveTenantId,
  });

  // Super admins are never restricted
  if (isSuperAdmin) {
    return {
      isTrialing: false,
      daysLeft: null,
      trialExpired: false,
      canCreateClients: true,
      maxEditableChapters: null,
      pdfWatermark: null,
      showBanner: false,
      loading: false,
    };
  }

  const subscriptionStatus = data?.subscription_status ?? null;
  const isFree = data?.is_free ?? false;
  const isTrialing = subscriptionStatus === 'trialing';
  const trialEndsAt = data?.trial_ends_at;

  let daysLeft: number | null = null;
  let trialExpired = false;

  if (isTrialing && trialEndsAt) {
    const diff = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000);
    daysLeft = Math.max(0, diff);
    trialExpired = diff <= 0;
  }

  // Free accounts bypass all restrictions
  if (isFree) {
    return {
      isTrialing: false,
      daysLeft: null,
      trialExpired: false,
      canCreateClients: true,
      maxEditableChapters: null,
      pdfWatermark: null,
      showBanner: false,
      loading: isLoading,
    };
  }

  return {
    isTrialing,
    daysLeft,
    trialExpired,
    canCreateClients: !isTrialing,
    maxEditableChapters: isTrialing ? 2 : null,
    pdfWatermark: isTrialing ? 'MUSTER-VERFAHRENSDOKUMENTATION' : null,
    showBanner: isTrialing,
    loading: isLoading,
  };
}
