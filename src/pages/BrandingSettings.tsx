import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantSettings, useSaveTenantSettings, useUploadTenantLogo } from '@/hooks/useTenantSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Palette, Building2, FileText, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logAudit } from '@/lib/auditLog';

export default function BrandingSettings() {
  const { effectiveTenantId } = useAuthContext();
  const { data: settings, isLoading } = useTenantSettings();
  const saveMutation = useSaveTenantSettings();
  const uploadMutation = useUploadTenantLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand_name: '',
    primary_color: '#1e3a5f',
    button_text_color: '',
    menu_text_color: '',
    brand_text_color: '',
    font_family: '',
    custom_css: '',
    address: '',
    phone: '',
    website: '',
    imprint: '',
    imprint_url: '',
    privacy_text: '',
    privacy_url: '',
    logo_url: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        primary_color: settings.primary_color || '#1e3a5f',
        button_text_color: settings.button_text_color || '',
        menu_text_color: settings.menu_text_color || '',
        brand_text_color: settings.brand_text_color || '',
        font_family: settings.font_family || '',
        custom_css: settings.custom_css || '',
        address: settings.address || '',
        phone: settings.phone || '',
        website: settings.website || '',
        imprint: settings.imprint || '',
        imprint_url: settings.imprint_url || '',
        privacy_text: settings.privacy_text || '',
        privacy_url: settings.privacy_url || '',
        logo_url: settings.logo_url || '',
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveTenantId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wählen Sie eine Bilddatei aus.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Die Datei darf maximal 2 MB groß sein.');
      return;
    }

    try {
      const url = await uploadMutation.mutateAsync({ file, tenantId: effectiveTenantId });
      // Add cache buster to force browser to load the new image
      setForm((prev) => ({ ...prev, logo_url: url + '?t=' + Date.now() }));
      toast.success('Logo hochgeladen');
    } catch (err: any) {
      toast.error('Fehler beim Hochladen: ' + err.message);
    }
    // Reset file input so the same file or a new file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoRemove = async () => {
    if (!effectiveTenantId) return;
    try {
      // Try to remove old files from storage
      const { data: files } = await supabase.storage
        .from('tenant-assets')
        .list(effectiveTenantId);
      if (files && files.length > 0) {
        const logoFiles = files.filter(f => f.name.startsWith('logo.'));
        if (logoFiles.length > 0) {
          await supabase.storage
            .from('tenant-assets')
            .remove(logoFiles.map(f => `${effectiveTenantId}/${f.name}`));
        }
      }
    } catch {
      // ignore storage errors
    }
    setForm((prev) => ({ ...prev, logo_url: '' }));
    toast.success('Logo entfernt – bitte speichern Sie die Einstellungen.');
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(form);
      logAudit('settings_updated', 'tenant_settings', effectiveTenantId || undefined);
      toast.success('Einstellungen gespeichert');
    } catch (err: any) {
      toast.error('Fehler beim Speichern: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Branding & Einstellungen</h1>
        <p className="text-muted-foreground mt-1">
          Passen Sie Name, Logo und Farben an. Diese werden in der Navigation, auf Registrierungsseiten und in E-Mails angezeigt.
        </p>
      </div>

      {/* Logo & Brand Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Marke & Logo
          </CardTitle>
          <CardDescription>Logo und Firmenname ersetzen „GoBD-Suite" überall: Navigation, Registrierung, E-Mails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Firmenname</Label>
            <Input
              value={form.brand_name}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              placeholder="z.B. Musterkanzlei GmbH"
            />
            <p className="text-xs text-muted-foreground">
              Wird anstelle von "GoBD-Suite" in der Navigation angezeigt.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {form.logo_url ? (
                <img
                  src={form.logo_url}
                  alt="Logo"
                  className="h-12 w-12 rounded-lg object-contain border border-border bg-background"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {form.logo_url ? 'Logo ersetzen' : 'Logo hochladen'}
                  </Button>
                  {form.logo_url && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogoRemove}
                    >
                      Entfernen
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG – max. 2 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Primärfarbe
          </CardTitle>
          <CardDescription>Wird als Akzentfarbe im Interface verwendet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="h-10 w-14 rounded-md border border-input cursor-pointer"
            />
            <Input
              value={form.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              placeholder="#1e3a5f"
              className="w-32 font-mono"
            />
            <div
              className="h-10 flex-1 rounded-md border border-border"
              style={{ backgroundColor: form.primary_color }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Kontaktdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Adresse</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Musterstraße 1, 12345 Berlin"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+49 123 456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.example.de"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impressum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Impressum
          </CardTitle>
          <CardDescription>
            Hinterlegen Sie einen Impressumstext und/oder einen Link zu Ihrem Impressum.
            Beides ist optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Impressum-Text</Label>
            <Textarea
              value={form.imprint}
              onChange={(e) => handleChange('imprint', e.target.value)}
              placeholder="Impressum-Text eingeben..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Impressum-URL</Label>
            <Input
              value={form.imprint_url}
              onChange={(e) => handleChange('imprint_url', e.target.value)}
              placeholder="https://www.example.de/impressum"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Wenn eine URL angegeben ist, wird im Footer ein Link angezeigt. Ansonsten wird der Text in einem Modal dargestellt.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Datenschutz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutz
          </CardTitle>
          <CardDescription>
            Hinterlegen Sie einen Datenschutztext und/oder einen Link zu Ihrer Datenschutzerklärung.
            Beides ist optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Datenschutz-Text</Label>
            <Textarea
              value={form.privacy_text}
              onChange={(e) => handleChange('privacy_text', e.target.value)}
              placeholder="Datenschutzerklärung eingeben..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Datenschutz-URL</Label>
            <Input
              value={form.privacy_url}
              onChange={(e) => handleChange('privacy_url', e.target.value)}
              placeholder="https://www.example.de/datenschutz"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Wenn eine URL angegeben ist, wird im Footer ein Link angezeigt. Ansonsten wird der Text in einem Modal dargestellt.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saveMutation.isPending} size="lg">
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
