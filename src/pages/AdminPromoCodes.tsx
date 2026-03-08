import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Loader2, Trash2, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminPromoCodes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: '', discount_percent: 10, max_uses: '', expires_at: '' });
  const [saving, setSaving] = useState(false);

  const loadCodes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setCodes((data || []) as PromoCode[]);
    setLoading(false);
  };

  useEffect(() => { loadCodes(); }, []);

  const handleCreate = async () => {
    setSaving(true);
    const { error } = await supabase.from('promo_codes').insert({
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
    });
    if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Rabatt-Code erstellt' }); setDialogOpen(false); setForm({ code: '', discount_percent: 10, max_uses: '', expires_at: '' }); }
    setSaving(false);
    loadCodes();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id);
    loadCodes();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id);
    toast({ title: 'Code gelöscht' });
    loadCodes();
  };

  return (
    <AdminSettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Rabatt-Codes
            </h2>
            <p className="text-sm text-muted-foreground">Promo-Codes für Plan-Upgrades verwalten</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Code
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : codes.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Keine Rabatt-Codes vorhanden.</CardContent></Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Rabatt</TableHead>
                  <TableHead>Nutzungen</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead>Aktiv</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell>{c.discount_percent}%</TableCell>
                    <TableCell>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</TableCell>
                    <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('de-DE') : '∞'}</TableCell>
                    <TableCell>
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c.id, c.is_active)} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuer Rabatt-Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="z.B. WINTER25" className="font-mono uppercase" />
              </div>
              <div>
                <Label>Rabatt (%)</Label>
                <Input type="number" min={1} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Max. Nutzungen (leer = unbegrenzt)</Label>
                <Input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} />
              </div>
              <div>
                <Label>Gültig bis (leer = unbegrenzt)</Label>
                <Input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} disabled={saving || !form.code.trim()} className="w-full">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSettingsLayout>
  );
}
