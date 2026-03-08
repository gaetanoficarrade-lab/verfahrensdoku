import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Loader2, Link2, MousePointer, Users, TrendingUp, DollarSign,
  Download, Plus, CheckCircle, XCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliateRow {
  id: string;
  slug: string;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  tenants?: { name: string };
  click_count?: number;
  conversion_count?: number;
}

export default function AdminAffiliates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<AffiliateRow[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLinkId, setManualLinkId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualComment, setManualComment] = useState('');
  const [savingManual, setSavingManual] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [linksRes, clicksRes, convRes] = await Promise.all([
      supabase.from('affiliate_links').select('*, tenants(name)').order('created_at', { ascending: false }),
      supabase.from('affiliate_clicks').select('*').order('created_at', { ascending: false }),
      supabase.from('affiliate_conversions').select('*').order('created_at', { ascending: false }),
    ]);

    const linksData = (linksRes.data || []) as any[];
    const clicksData = clicksRes.data || [];
    const convsData = convRes.data || [];

    // Enrich links with counts
    const enriched = linksData.map((l: any) => ({
      ...l,
      click_count: clicksData.filter(c => c.affiliate_link_id === l.id).length,
      conversion_count: convsData.filter(c => c.affiliate_link_id === l.id).length,
    }));

    setLinks(enriched);
    setClicks(clicksData);
    setConversions(convsData);
    setLoading(false);
  };

  const totalClicks = clicks.length;
  const totalConversions = conversions.length;
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0.0';
  const totalCommission = conversions.reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);

  const handleStatusChange = async (conversionId: string, newStatus: string, comment?: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();
    if (comment) updates.admin_comment = comment;

    const { error } = await supabase.from('affiliate_conversions').update(updates).eq('id', conversionId);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status aktualisiert' });
      loadData();
    }
  };

  const handleManualConversion = async () => {
    if (!manualLinkId || !manualAmount) return;
    setSavingManual(true);
    const { error } = await supabase.from('affiliate_conversions').insert({
      affiliate_link_id: manualLinkId,
      commission_amount: parseFloat(manualAmount),
      admin_comment: manualComment || 'Manuell angelegt',
      is_manual: true,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Manuelle Conversion angelegt' });
      setManualOpen(false);
      setManualLinkId('');
      setManualAmount('');
      setManualComment('');
      loadData();
    }
    setSavingManual(false);
  };

  const exportCSV = () => {
    const rows = conversions.map(c => {
      const link = links.find(l => l.id === c.affiliate_link_id);
      return {
        Datum: new Date(c.created_at).toLocaleDateString('de-DE'),
        Affiliate: link?.tenants?.name || link?.slug || '',
        Status: c.status,
        Betrag: parseFloat(c.commission_amount || 0).toFixed(2),
        Manuell: c.is_manual ? 'Ja' : 'Nein',
        Kommentar: c.admin_comment || '',
      };
    });
    const header = Object.keys(rows[0] || {}).join(';');
    const csv = [header, ...rows.map(r => Object.values(r).join(';'))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Link2 className="h-6 w-6" />
            Affiliate-Verwaltung
          </h1>
          <p className="text-muted-foreground">Alle Affiliate-Links, Klicks und Conversions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={manualOpen} onOpenChange={setManualOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Manuelle Conversion</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manuelle Conversion anlegen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Affiliate</Label>
                  <Select value={manualLinkId} onValueChange={setManualLinkId}>
                    <SelectTrigger><SelectValue placeholder="Affiliate wählen" /></SelectTrigger>
                    <SelectContent>
                      {links.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          {(l as any).tenants?.name || l.slug}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Provisionsbetrag (€)</Label>
                  <Input type="number" step="0.01" value={manualAmount} onChange={e => setManualAmount(e.target.value)} />
                </div>
                <div>
                  <Label>Kommentar</Label>
                  <Textarea value={manualComment} onChange={e => setManualComment(e.target.value)} placeholder="z.B. Offline-Deal Messe München" />
                </div>
                <Button onClick={handleManualConversion} disabled={savingManual || !manualLinkId || !manualAmount}>
                  {savingManual && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Conversion anlegen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportCSV} disabled={conversions.length === 0}>
            <Download className="h-4 w-4 mr-2" />CSV-Export
          </Button>
        </div>
      </div>

      {/* Funnel stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><MousePointer className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Klicks gesamt</span></div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Registrierungen</span></div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Conversion-Rate</span></div>
            <p className="text-2xl font-bold text-foreground mt-1">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Provisionen gesamt</span></div>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCommission.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversion-Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
              <p className="text-xs text-muted-foreground">Klicks</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold text-foreground">{totalConversions}</p>
              <p className="text-xs text-muted-foreground">Registrierungen</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-3xl font-bold text-foreground">
                {conversions.filter(c => c.status === 'confirmed' || c.status === 'paid').length}
              </p>
              <p className="text-xs text-muted-foreground">Aktive Lizenznehmer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All affiliate links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alle Affiliate-Links</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lizenznehmer</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Klicks</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erstellt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map(l => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{(l as any).tenants?.name || '–'}</TableCell>
                  <TableCell><code className="text-xs">{l.slug}</code></TableCell>
                  <TableCell className="text-right">{l.click_count}</TableCell>
                  <TableCell className="text-right">{l.conversion_count}</TableCell>
                  <TableCell>
                    <Badge variant={l.is_active ? 'default' : 'secondary'}>
                      {l.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(l.created_at).toLocaleDateString('de-DE')}
                  </TableCell>
                </TableRow>
              ))}
              {links.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Noch keine Affiliate-Links vorhanden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Conversions with actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversions verwalten</CardTitle>
          <CardDescription>Provisionen bestätigen, ablehnen oder als ausgezahlt markieren</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kommentar</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.map(c => {
                const link = links.find(l => l.id === c.affiliate_link_id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>{(link as any)?.tenants?.name || link?.slug || '–'}</TableCell>
                    <TableCell className="font-medium">{parseFloat(c.commission_amount || 0).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge variant={
                        c.status === 'paid' ? 'default' :
                        c.status === 'confirmed' ? 'secondary' :
                        c.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {c.status === 'pending' ? 'Ausstehend' :
                         c.status === 'confirmed' ? 'Bestätigt' :
                         c.status === 'rejected' ? 'Abgelehnt' : 'Ausgezahlt'}
                      </Badge>
                      {c.is_manual && <Badge variant="outline" className="ml-1 text-xs">Manuell</Badge>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.admin_comment || '–'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.status === 'pending' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(c.id, 'confirmed')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(c.id, 'rejected')}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                        {c.status === 'confirmed' && (
                          <Button size="sm" variant="ghost" onClick={() => handleStatusChange(c.id, 'paid')}>
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {conversions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Noch keine Conversions vorhanden.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
