import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, Scale, FileText, Shield, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LegalForm {
  imprint_text: string;
  imprint_url: string;
  privacy_text: string;
  privacy_url: string;
  terms_text: string;
  terms_url: string;
}

export default function AdminSettingsLegal() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LegalForm>({
    imprint_text: '',
    imprint_url: '',
    privacy_text: '',
    privacy_url: '',
    terms_text: '',
    terms_url: '',
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'legal')
        .maybeSingle();
      if (data?.value) {
        const val = data.value as Record<string, string>;
        setForm({
          imprint_text: val.imprint_text || '',
          imprint_url: val.imprint_url || '',
          privacy_text: val.privacy_text || '',
          privacy_url: val.privacy_url || '',
          terms_text: val.terms_text || '',
          terms_url: val.terms_url || '',
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
        .upsert({ key: 'legal', value: form }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Rechtliche Einstellungen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof LegalForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
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

  const sections = [
    {
      title: 'Impressum',
      icon: FileText,
      textField: 'imprint_text' as const,
      urlField: 'imprint_url' as const,
      textPlaceholder: 'Impressum-Text eingeben...',
      urlPlaceholder: 'https://www.example.de/impressum',
    },
    {
      title: 'Datenschutzerklärung',
      icon: Shield,
      textField: 'privacy_text' as const,
      urlField: 'privacy_url' as const,
      textPlaceholder: 'Datenschutztext eingeben...',
      urlPlaceholder: 'https://www.example.de/datenschutz',
    },
    {
      title: 'Allgemeine Geschäftsbedingungen',
      icon: BookOpen,
      textField: 'terms_text' as const,
      urlField: 'terms_url' as const,
      textPlaceholder: 'AGB-Text eingeben...',
      urlPlaceholder: 'https://www.example.de/agb',
    },
  ];

  return (
    <AdminSettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Rechtliches
            </CardTitle>
            <CardDescription>
              Diese Texte erscheinen im Footer für alle Nutzer. Hinterlegen Sie jeweils einen Text und/oder eine URL.
              Bei hinterlegter URL wird ein externer Link angezeigt, bei reinem Text ein Modal.
            </CardDescription>
          </CardHeader>
        </Card>

        {sections.map((section, i) => (
          <Card key={section.textField}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="h-4 w-4" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea
                  value={form[section.textField]}
                  onChange={(e) => handleChange(section.textField, e.target.value)}
                  placeholder={section.textPlaceholder}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={form[section.urlField]}
                  onChange={(e) => handleChange(section.urlField, e.target.value)}
                  placeholder={section.urlPlaceholder}
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Wenn eine URL angegeben ist, wird im Footer ein externer Link angezeigt.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        <Separator />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Speichern
          </Button>
        </div>
      </div>
    </AdminSettingsLayout>
  );
}
