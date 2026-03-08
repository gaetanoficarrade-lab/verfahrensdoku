import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, Loader2, Mail, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailTemplate {
  subject: string;
  body: string;
}

interface EmailTemplates {
  tenant_invite: EmailTemplate;
  client_invite: EmailTemplate;
  password_reset: EmailTemplate;
}

const defaultTemplates: EmailTemplates = {
  tenant_invite: {
    subject: 'Einladung zur {{plattform}}',
    body: `Hallo {{name}},

Sie wurden als Lizenznehmer zur {{plattform}} eingeladen.

Klicken Sie auf den folgenden Link, um Ihr Konto einzurichten:
{{link}}

Bei Fragen wenden Sie sich an {{support_email}}.

Mit freundlichen Grüßen
{{plattform}} Team`,
  },
  client_invite: {
    subject: 'Einladung zur Verfahrensdokumentation - {{firma}}',
    body: `Hallo {{name}},

die Kanzlei {{firma}} hat Sie zur Mitarbeit an Ihrer Verfahrensdokumentation eingeladen.

Bitte klicken Sie auf den folgenden Link, um Ihr Konto einzurichten:
{{link}}

Bei Fragen wenden Sie sich an Ihre Kanzlei.

Mit freundlichen Grüßen
{{firma}}`,
  },
  password_reset: {
    subject: 'Passwort zurücksetzen - {{plattform}}',
    body: `Hallo {{name}},

Sie haben ein neues Passwort für Ihren {{plattform}}-Zugang angefordert.

Klicken Sie auf den folgenden Link, um Ihr Passwort zu ändern:
{{link}}

Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen
{{plattform}} Team`,
  },
};

const templateLabels: Record<string, string> = {
  tenant_invite: 'Lizenznehmer-Einladung',
  client_invite: 'Mandanten-Einladung',
  password_reset: 'Passwort-Reset',
};

const placeholders = [
  { key: '{{name}}', desc: 'Name des Empfängers' },
  { key: '{{link}}', desc: 'Aktions-Link (Einladung/Reset)' },
  { key: '{{firma}}', desc: 'Name der Kanzlei / des Lizenznehmers' },
  { key: '{{plattform}}', desc: 'Plattformname (z.B. GoBD-Suite)' },
  { key: '{{support_email}}', desc: 'Support-E-Mail-Adresse' },
];

export default function AdminSettingsEmail() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplates>(defaultTemplates);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'email_templates')
        .maybeSingle();
      if (data?.value) {
        const val = data.value as unknown as EmailTemplates;
        setTemplates({
          tenant_invite: { ...defaultTemplates.tenant_invite, ...val.tenant_invite },
          client_invite: { ...defaultTemplates.client_invite, ...val.client_invite },
          password_reset: { ...defaultTemplates.password_reset, ...val.password_reset },
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key: 'email_templates', value: templates as unknown as Record<string, unknown> }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('E-Mail-Vorlagen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = (key: keyof EmailTemplates, field: keyof EmailTemplate, value: string) => {
    setTemplates((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  if (loading) {
    return (
      <AdminSettingsLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AdminSettingsLayout>
    );
  }

  return (
    <AdminSettingsLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Placeholder reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Verfügbare Platzhalter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((p) => (
                <div key={p.key} className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {p.key}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{p.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {(Object.keys(templates) as Array<keyof EmailTemplates>).map((key) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                {templateLabels[key]}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Betreff</Label>
                <Input
                  value={templates[key].subject}
                  onChange={(e) => updateTemplate(key, 'subject', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea
                  value={templates[key].body}
                  onChange={(e) => updateTemplate(key, 'body', e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Vorlagen speichern
          </Button>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
