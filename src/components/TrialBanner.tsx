import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export function TrialBanner() {
  const { effectiveTenantId, roles, isSuperAdmin } = useAuthContext();
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isTenant = roles.includes('tenant_admin') || roles.includes('tenant_user');

  useEffect(() => {
    if (!effectiveTenantId || !isTenant) return;
    const load = async () => {
      const { data } = await supabase
        .from('tenants')
        .select('trial_ends_at')
        .eq('id', effectiveTenantId)
        .single();
      if (data?.trial_ends_at) {
        const diff = Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86400000);
        setDaysLeft(diff);
      }
    };
    load();
  }, [effectiveTenantId, isTenant]);

  if (dismissed || daysLeft === null || daysLeft > 7 || daysLeft <= 0 || isSuperAdmin) return null;

  return (
    <div className="bg-accent/20 border-b border-accent/30 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-accent-foreground" />
        <span className="text-accent-foreground font-medium">
          Testphase endet in {daysLeft} Tag{daysLeft !== 1 ? 'en' : ''} –
        </span>
        <Button variant="link" className="h-auto p-0 text-sm font-semibold" onClick={() => navigate('/settings/billing')}>
          Jetzt upgraden
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
