import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug, referrer_url, user_agent, landing_page } = await req.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find affiliate link by slug (or previous slug)
    let { data: link } = await supabase
      .from('affiliate_links')
      .select('id, slug, previous_slugs')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    // Check previous slugs if not found
    if (!link) {
      const { data: allLinks } = await supabase
        .from('affiliate_links')
        .select('id, slug, previous_slugs')
        .eq('is_active', true);

      if (allLinks) {
        const now = new Date();
        for (const l of allLinks) {
          const prev = Array.isArray(l.previous_slugs) ? l.previous_slugs : [];
          const match = prev.find(
            (p: any) => p.slug === slug && new Date(p.expired_at) > now
          );
          if (match) {
            link = l;
            break;
          }
        }
      }
    }

    if (!link) {
      return new Response(JSON.stringify({ error: 'Affiliate link not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Anonymize IP via hash
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + new Date().toISOString().slice(0, 10)); // daily salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

    // Determine device category
    const ua = (user_agent || '').toLowerCase();
    let category = 'desktop';
    if (/mobile|android|iphone|ipod/.test(ua)) category = 'mobile';
    else if (/tablet|ipad/.test(ua)) category = 'tablet';

    // Rough country from IP (simplified: look at common German ISP patterns)
    // In production, use a GeoIP service. For now, default to 'DE'.
    const countryCode = 'DE';

    // Insert click
    const { error } = await supabase.from('affiliate_clicks').insert({
      affiliate_link_id: link.id,
      ip_hash: ipHash,
      referrer_url: referrer_url || null,
      user_agent_category: category,
      country_code: countryCode,
      landing_page: landing_page || null,
    });

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      affiliate_slug: link.slug,
      redirect_slug: link.slug !== slug ? link.slug : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
