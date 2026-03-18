import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

const BASE_URL = 'https://gobd-suite.de';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch published blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/fuer-selbststaendige', priority: '0.8', changefreq: 'weekly' },
      { url: '/fuer-dienstleister', priority: '0.8', changefreq: 'weekly' },
      { url: '/verfahrensdokumentation-erstellen', priority: '0.8', changefreq: 'weekly' },
      { url: '/partner', priority: '0.7', changefreq: 'weekly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
    ];

    const blogUrls = (posts || []).map((p: any) => ({
      url: `/blog/${p.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: p.updated_at || p.published_at,
    }));

    const allUrls = [...staticPages, ...blogUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${BASE_URL}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${(u as any).lastmod ? `\n    <lastmod>${new Date((u as any).lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, { headers: corsHeaders });
  } catch (error) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: corsHeaders,
    });
  }
});
