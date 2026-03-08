import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantSettings, useSaveTenantSettings, useUploadTenantLogo } from '@/hooks/useTenantSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Palette, Building2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BrandingSettings() {
  const { effectiveTenantId } = useAuthContext();
  const { data: settings, isLoading } = useTenantSettings();
  const saveMutation = useSaveTenantSettings();
  const uploadMutation = useUploadTenantLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    brand_name: '',
    primary_color: '#1e3a5f',
    address: '',
    phone: '',
    website: '',
    imprint: '',
    logo_url: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        primary_color: settings.primary_color || '#1e3a5f',
        address: settings.address || '',
        phone: settings.phone || '',
        website: settings.website || '',
        imprint: settings.imprint || '',
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
      setForm((prev) => ({ ...prev, logo_url: url }));
      toast.success('Logo hochgeladen');
    } catch (err: any) {
      toast.error('Fehler beim Hochladen: ' + err.message);
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(form);
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
          Passen Sie das Erscheinungsbild Ihrer GoBD-Suite an.
        </p>
      </div>

      {/* Logo & Brand Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Marke & Logo
          </CardTitle>
          <CardDescription>Logo und Firmenname für die Anzeige in der Sidebar</CardDescription>
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
              <div>
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
                  Logo hochladen
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG – max. 2 MB</p>
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

      {/* Imprint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Impressum
          </CardTitle>
          <CardDescription>Wird im Footer / Impressums-Bereich angezeigt</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.imprint}
            onChange={(e) => handleChange('imprint', e.target.value)}
            placeholder="Impressum-Text eingeben..."
            rows={6}
          />
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
