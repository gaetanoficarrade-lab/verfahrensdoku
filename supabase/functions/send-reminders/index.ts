import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const results: string[] = [];

    // 1. Clients who haven't submitted in 7 days
    const { data: staleChapters } = await supabase
      .from('chapter_data')
      .select('project_id, projects(client_id, clients(company, user_id))')
      .lt('updated_at', sevenDaysAgo.toISOString())
      .in('status', ['empty', 'client_draft']);

    const notifiedClients = new Set<string>();
    for (const ch of staleChapters || []) {
      const userId = (ch as any)?.projects?.clients?.user_id;
      if (userId && !notifiedClients.has(userId)) {
        notifiedClients.add(userId);
        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Erinnerung',
          message: `Sie haben seit 7 Tagen nichts eingereicht. Bitte vervollständigen Sie Ihre Kapitel.`,
          link: '/client',
        });
        results.push(`Reminder sent to client ${userId}`);
      }
    }

    // 2. Trial expiring in 7 days
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);
    const { data: expiringTenants } = await supabase
      .from('tenants')
      .select('id, name, contact_email')
      .gt('trial_ends_at', now.toISOString())
      .lt('trial_ends_at', sevenDaysFromNow.toISOString());

    for (const tenant of expiringTenants || []) {
      // Notify tenant admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('tenant_id', tenant.id);
      
      for (const admin of admins || []) {
        await supabase.from('notifications').insert({
          user_id: admin.user_id,
          title: 'Testphase endet bald',
          message: `Ihre Testphase endet in weniger als 7 Tagen. Bitte wählen Sie einen Plan.`,
          link: '/settings/billing',
        });
      }
      results.push(`Trial expiry reminder for tenant ${tenant.name}`);
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
