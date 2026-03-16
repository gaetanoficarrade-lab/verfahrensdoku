import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailTemplateEditor, EmailTemplateMap } from '@/components/EmailTemplateEditor';
import {
  defaultTemplates,
  tenantCategories,
  placeholdersByTemplate,
} from '@/lib/email-template-defaults';

export default function TenantEmailSettings() {
  const { effectiveTenantId } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateMap>({});
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Only show tenant-relevant template keys
  const tenantTemplateKeys = tenantCategories.flatMap((c) => c.templates.map((t) => t.key));

  useEffect(() => {
    if (!effectiveTenantId) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .maybeSingle();

      // Build tenant templates - start from defaults, overlay with saved
      const base: EmailTemplateMap = {};
      for (const key of tenantTemplateKeys) {
        base[key] = { ...defaultTemplates[key] };
      }

      if (data) {
        const raw = data as any;
        if (raw.email_templates && typeof raw.email_templates === 'object') {
          for (const key of tenantTemplateKeys) {
            if (raw.email_templates[key]) {
              base[key] = { ...base[key], ...raw.email_templates[key] };
            }
          }
        }
        if (raw.email_logo_url) {
          setLogoUrl(raw.email_logo_url);
        }
      }
      setTemplates(base);
      setLoading(false);
    };
    fetchData();
  }, [effectiveTenantId]);

  const handleSave = async (t: EmailTemplateMap) => {
    if (!effectiveTenantId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenant_settings')
        .update({ email_templates: t as any })
        .eq('tenant_id', effectiveTenantId);
      if (error) throw error;
      toast.success('E-Mail-Vorlagen gespeichert');
    } catch (err: any) {
      toast.error('Fehler: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    if (!effectiveTenantId) throw new Error('Kein Tenant');
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${effectiveTenantId}/email-logo.${ext}`;
      const { error } = await supabase.storage
        .from('tenant-assets')
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('tenant-assets').getPublicUrl(path);
      const url = urlData.publicUrl;
      await supabase
        .from('tenant_settings')
        .update({ email_logo_url: url })
        .eq('tenant_id', effectiveTenantId);
      setLogoUrl(url);
      return url;
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!effectiveTenantId) return;
    await supabase
      .from('tenant_settings')
      .update({ email_logo_url: null })
      .eq('tenant_id', effectiveTenantId);
    setLogoUrl('');
    toast.info('Logo entfernt');
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
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-6 w-6" />
          E-Mail-Vorlagen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Passen Sie die E-Mail-Vorlagen für Ihre Mandanten und Ihr Team an.
        </p>
      </div>

      <EmailTemplateEditor
        templates={templates}
        defaultTemplates={defaultTemplates}
        categories={tenantCategories}
        placeholdersByTemplate={placeholdersByTemplate}
        saving={saving}
        onSave={handleSave}
        onChange={setTemplates}
        logoUrl={logoUrl}
        onLogoUpload={handleLogoUpload}
        onLogoRemove={handleLogoRemove}
        logoUploading={logoUploading}
      />
    </div>
  );
}
