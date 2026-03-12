import { useState, useEffect } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailTemplateEditor, EmailTemplateMap } from '@/components/EmailTemplateEditor';
import {
  defaultTemplates,
  adminCategories,
  placeholdersByTemplate,
} from '@/lib/email-template-defaults';

export default function AdminSettingsEmail() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateMap>({ ...defaultTemplates });
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [templatesRes, logoRes] = await Promise.all([
        supabase.from('platform_settings').select('*').eq('key', 'email_templates_v2').maybeSingle(),
        supabase.from('platform_settings').select('*').eq('key', 'email_logo_url').maybeSingle(),
      ]);
      if (templatesRes.data?.value) {
        const val = templatesRes.data.value as unknown as EmailTemplateMap;
        const merged = { ...defaultTemplates };
        for (const key of Object.keys(defaultTemplates)) {
          if (val[key]) {
            merged[key] = { ...defaultTemplates[key], ...val[key] };
          }
        }
        setTemplates(merged);
      }
      if (logoRes.data?.value) {
        const val = logoRes.data.value as unknown as { url: string };
        if (val.url) setLogoUrl(val.url);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async (t: EmailTemplateMap) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert(
          { key: 'email_templates_v2', value: t as unknown as Record<string, unknown> },
          { onConflict: 'key' }
        );
      if (error) throw error;
      toast.success('E-Mail-Vorlagen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `platform/email-logo.${ext}`;
      const { error } = await supabase.storage
        .from('tenant-assets')
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('tenant-assets').getPublicUrl(path);
      const url = urlData.publicUrl;
      // Save URL to platform_settings
      await supabase
        .from('platform_settings')
        .upsert(
          { key: 'email_logo_url', value: { url } as unknown as Record<string, unknown> },
          { onConflict: 'key' }
        );
      setLogoUrl(url);
      return url;
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    await supabase.from('platform_settings').delete().eq('key', 'email_logo_url');
    setLogoUrl('');
    toast.info('Logo entfernt');
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
      <EmailTemplateEditor
        templates={templates}
        defaultTemplates={defaultTemplates}
        categories={adminCategories}
        placeholdersByTemplate={placeholdersByTemplate}
        saving={saving}
        onSave={handleSave}
        onChange={setTemplates}
        logoUrl={logoUrl}
        onLogoUpload={handleLogoUpload}
        onLogoRemove={handleLogoRemove}
        logoUploading={logoUploading}
      />
    </AdminSettingsLayout>
  );
}
