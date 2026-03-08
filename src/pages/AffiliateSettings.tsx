import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Link2, Copy, Check, QrCode, ExternalLink, TrendingUp, MousePointer, Users, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BASE_URL = 'https://app.gaetanoficarra.de';
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
    .replace(/&/g, '-und-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

interface AffiliateLink {
  id: string;
  slug: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  is_active: boolean;
  previous_slugs: any;
}

interface ClickStats {
  date: string;
  clicks: number;
}

export default function AffiliateSettings() {
  const { tenantId: authTenantId, effectiveTenantId } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [link, setLink] = useState<AffiliateLink | null>(null);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [clicks, setClicks] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [tenantName, setTenantName] = useState('');

  const tenantId = profile?.tenant_id;

  useEffect(() => {
    if (!tenantId) return;
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    setLoading(true);
    const [linkRes, tenantRes] = await Promise.all([
      supabase.from('affiliate_links').select('*').eq('tenant_id', tenantId).maybeSingle(),
      supabase.from('tenants').select('name').eq('id', tenantId).single(),
    ]);

    if (tenantRes.data) setTenantName(tenantRes.data.name);

    if (linkRes.data) {
      setLink(linkRes.data as AffiliateLink);
      setSlug(linkRes.data.slug);
      setUtmSource(linkRes.data.utm_source || '');
      setUtmMedium(linkRes.data.utm_medium || '');
      setUtmCampaign(linkRes.data.utm_campaign || '');

      // Load clicks + conversions
      const [clicksRes, convRes] = await Promise.all([
        supabase.from('affiliate_clicks').select('*').eq('affiliate_link_id', linkRes.data.id).order('created_at', { ascending: false }),
        supabase.from('affiliate_conversions').select('*').eq('affiliate_link_id', linkRes.data.id).order('created_at', { ascending: false }),
      ]);
      setClicks(clicksRes.data || []);
      setConversions(convRes.data || []);
    } else {
      // Auto-generate slug from tenant name
      if (tenantRes.data) {
        setSlug(slugify(tenantRes.data.name));
      }
    }
    setLoading(false);
  };

  const validateSlug = async (val: string) => {
    if (val.length < 3) {
      setSlugError('Mindestens 3 Zeichen');
      return false;
    }
    if (!SLUG_REGEX.test(val)) {
      setSlugError('Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt');
      return false;
    }
    // Check uniqueness
    const { data } = await supabase.from('affiliate_links').select('id').eq('slug', val).maybeSingle();
    if (data && data.id !== link?.id) {
      setSlugError('Dieser Slug ist bereits vergeben');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleSave = async () => {
    if (!tenantId) return;
    const valid = await validateSlug(slug);
    if (!valid) return;

    setSaving(true);
    try {
      if (link) {
        // Update existing
        const previousSlugs = Array.isArray(link.previous_slugs) ? link.previous_slugs : [];
        const updatedPreviousSlugs = link.slug !== slug
          ? [...previousSlugs, { slug: link.slug, expired_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }]
          : previousSlugs;

        const { error } = await supabase.from('affiliate_links').update({
          slug,
          previous_slugs: updatedPreviousSlugs,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
        }).eq('id', link.id);

        if (error) throw error;
      } else {
        // Get default program
        const { data: program } = await supabase.from('affiliate_programs').select('id').eq('is_active', true).limit(1).single();
        
        const { error } = await supabase.from('affiliate_links').insert({
          tenant_id: tenantId,
          program_id: program?.id,
          slug,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
        });
        if (error) throw error;
      }

      toast({ title: 'Affiliate-Link gespeichert' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Fehler beim Speichern', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  const fullUrl = useMemo(() => {
    let url = `${BASE_URL}?ref=${slug}`;
    const params: string[] = [];
    if (utmSource) params.push(`utm_source=${encodeURIComponent(utmSource)}`);
    if (utmMedium) params.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
    if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
    if (params.length) url += '&' + params.join('&');
    return url;
  }, [slug, utmSource, utmMedium, utmCampaign]);

  const linkVariants = useMemo(() => [
    { label: 'Hauptseite', url: `${BASE_URL}?ref=${slug}` },
    { label: 'Preisseite', url: `${BASE_URL}/pricing?ref=${slug}` },
    { label: 'Demo-Anfrage', url: `${BASE_URL}/demo?ref=${slug}` },
  ], [slug]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Click stats for chart (last 30 days)
  const clickChartData = useMemo<ClickStats[]>(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    clicks.forEach(c => {
      const day = c.created_at?.slice(0, 10);
      if (day && days[day] !== undefined) days[day]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date: date.slice(5), clicks: count }));
  }, [clicks]);

  const conversionRate = clicks.length > 0 ? ((conversions.length / clicks.length) * 100).toFixed(1) : '0.0';
  
  const pendingCommission = conversions.filter(c => c.status === 'pending').reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);
  const confirmedCommission = conversions.filter(c => c.status === 'confirmed').reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);
  const paidCommission = conversions.filter(c => c.status === 'paid').reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);

  const topReferrers = useMemo(() => {
    const counts: Record<string, number> = {};
    clicks.forEach(c => {
      if (c.referrer_url) {
        try {
          const host = new URL(c.referrer_url).hostname;
          counts[host] = (counts[host] || 0) + 1;
        } catch { /* ignore */ }
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [clicks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Link2 className="h-6 w-6" />
          Affiliate-Programm
        </h1>
        <p className="text-muted-foreground">Verwalten Sie Ihren personalisierten Empfehlungslink</p>
      </div>

      <Tabs defaultValue="link" className="space-y-4">
        <TabsList>
          <TabsTrigger value="link">Mein Link</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="commission">Provisionen</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          {/* Slug Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Persönlicher Link-Slug</CardTitle>
              <CardDescription>
                Wählen Sie einen einzigartigen Slug für Ihren Empfehlungslink
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{BASE_URL}?ref=</span>
                  <Input
                    value={slug}
                    onChange={e => {
                      const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setSlug(v);
                      setSlugError('');
                    }}
                    placeholder="ihr-slug"
                    className="max-w-xs"
                  />
                </div>
                {slugError && <p className="text-sm text-destructive">{slugError}</p>}
                {link && link.slug !== slug && (
                  <p className="text-xs text-muted-foreground">
                    Der alte Slug „{link.slug}" wird für 30 Tage weitergeleitet.
                  </p>
                )}
              </div>

              {/* UTM Parameters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">UTM-Parameter (optional)</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">utm_source</Label>
                    <Input value={utmSource} onChange={e => setUtmSource(e.target.value)} placeholder="z.B. website" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">utm_medium</Label>
                    <Input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} placeholder="z.B. banner" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">utm_campaign</Label>
                    <Input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} placeholder="z.B. herbst-2024" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving || !slug}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {link ? 'Änderungen speichern' : 'Affiliate-Link erstellen'}
              </Button>
            </CardContent>
          </Card>

          {/* Link Preview & Copy */}
          {link && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ihre Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main link */}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
                  <code className="flex-1 text-sm truncate text-foreground">{fullUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(fullUrl)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowQr(!showQr)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>

                {showQr && (
                  <div className="flex justify-center p-4 bg-white rounded-lg border border-border">
                    <QRCodeSVG value={fullUrl} size={200} />
                  </div>
                )}

                {/* Link variants */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Vorgefertigte Varianten</Label>
                  {linkVariants.map(v => (
                    <div key={v.label} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="shrink-0">{v.label}</Badge>
                      <code className="flex-1 truncate text-muted-foreground">{v.url}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard(v.url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Stats overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Klicks gesamt</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{clicks.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Conversions</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{conversions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Conversion-Rate</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{conversionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Verdient</span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">{(confirmedCommission + paidCommission).toFixed(2)} €</p>
              </CardContent>
            </Card>
          </div>

          {/* Clicks chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Klicks – Letzte 30 Tage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clickChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line type="monotone" dataKey="clicks" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top-Referrer</CardTitle>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Referrer-Daten vorhanden.</p>
              ) : (
                <div className="space-y-2">
                  {topReferrers.map(([host, count]) => (
                    <div key={host} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-foreground">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        {host}
                      </span>
                      <Badge variant="secondary">{count} Klicks</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCommission.toFixed(2)} €</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Bestätigt</p>
                <p className="text-2xl font-bold text-green-600">{confirmedCommission.toFixed(2)} €</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Ausgezahlt</p>
                <p className="text-2xl font-bold text-foreground">{paidCommission.toFixed(2)} €</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Provisionshistorie</CardTitle>
            </CardHeader>
            <CardContent>
              {conversions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Conversions vorhanden.</p>
              ) : (
                <div className="space-y-3">
                  {conversions.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                      <div>
                        <p className="text-foreground">
                          {new Date(c.created_at).toLocaleDateString('de-DE')}
                          {c.is_manual && <Badge variant="outline" className="ml-2 text-xs">Manuell</Badge>}
                        </p>
                        {c.admin_comment && <p className="text-xs text-muted-foreground">{c.admin_comment}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          c.status === 'paid' ? 'default' :
                          c.status === 'confirmed' ? 'secondary' :
                          c.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {c.status === 'pending' ? 'Ausstehend' :
                           c.status === 'confirmed' ? 'Bestätigt' :
                           c.status === 'rejected' ? 'Abgelehnt' : 'Ausgezahlt'}
                        </Badge>
                        <span className="font-medium text-foreground">{parseFloat(c.commission_amount || 0).toFixed(2)} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
