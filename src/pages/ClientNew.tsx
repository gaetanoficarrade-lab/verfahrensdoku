import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/auditLog';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function ClientNew() {
  const { effectiveTenantId } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company: '',
    industry: '',
    contact_name: '',
    contact_email: '',
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast({ title: 'Fehler', description: 'Firmenname ist erforderlich.', variant: 'destructive' });
      return;
    }
    if (!effectiveTenantId) {
      toast({ title: 'Fehler', description: 'Kein Lizenznehmer zugewiesen.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from('clients')
      .insert({
        tenant_id: effectiveTenantId,
        company: form.company.trim(),
        industry: form.industry.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim() || null,
      })
      .select('id')
      .single();

    setSaving(false);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Mandant erstellt', description: `${form.company} wurde erfolgreich angelegt.` });
    navigate(`/clients/${data.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Neuer Mandant</h1>
          <p className="text-sm text-muted-foreground mt-1">Mandant anlegen und später zum Onboarding einladen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stammdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Firmenname *</Label>
              <Input id="company" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Mustermann GmbH" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Branche</Label>
              <Input id="industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} placeholder="z.B. Handwerk, IT, Gastronomie" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Ansprechpartner</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)} placeholder="Max Mustermann" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-Mail</Label>
                <Input id="contact_email" type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} placeholder="max@beispiel.de" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Mandant anlegen
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Abbrechen</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
