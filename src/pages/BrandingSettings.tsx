import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantSettings, useSaveTenantSettings, useUploadTenantLogo } from '@/hooks/useTenantSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Upload, Save, Palette, Building2, FileText, Shield, Loader2, Type, Code, RotateCcw, Download, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { logAudit } from '@/lib/auditLog';

const DEFAULTS = {
  brand_name: '',
  primary_color: '',
  button_text_color: '',
  menu_text_color: '',
  brand_text_color: '',
  sidebar_bg_color: '',
  menu_active_color: '',
  menu_active_text_color: '',
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
};

type FormState = typeof DEFAULTS;

const BRANDING_FIELDS: (keyof FormState)[] = [
  'primary_color', 'button_text_color', 'menu_text_color',
  'brand_text_color', 'sidebar_bg_color', 'menu_active_color',
  'menu_active_text_color', 'font_family', 'custom_css',
];

const PRESET_STORAGE_KEY = 'branding-presets';

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyLivePreview(form: FormState) {
  const root = document.documentElement;

  const applyOrRemove = (varName: string, hex: string) => {
    if (hex) {
      const hsl = hexToHSL(hex);
      if (hsl) root.style.setProperty(varName, hsl);
    } else {
      root.style.removeProperty(varName);
    }
  };

  applyOrRemove('--primary', form.primary_color);
  applyOrRemove('--ring', form.primary_color);
  applyOrRemove('--sidebar-primary', form.primary_color);
  applyOrRemove('--primary-foreground', form.button_text_color);
  applyOrRemove('--sidebar-primary-foreground', form.button_text_color);
  applyOrRemove('--sidebar-foreground', form.menu_text_color);
  applyOrRemove('--brand-foreground', form.brand_text_color);
  applyOrRemove('--sidebar-background', form.sidebar_bg_color);
  applyOrRemove('--sidebar-accent', form.menu_active_color);
  applyOrRemove('--sidebar-accent-foreground', form.menu_active_text_color);

  if (form.font_family) {
    root.style.fontFamily = `${form.font_family}, var(--font-sans, sans-serif)`;
  } else {
    root.style.fontFamily = '';
  }
}

// ColorField extracted outside to prevent remount on every render
function ColorField({ label, field, value, defaultVal, placeholder, onChange }: {
  label: string; field: string; value: string; defaultVal: string; placeholder: string;
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <input
          type="color"
          value={value || defaultVal}
          onChange={(e) => onChange(field, e.target.value)}
          className="h-10 w-14 rounded-md border border-input cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-48 font-mono"
        />
      </div>
    </div>
  );
}

export default function BrandingSettings() {
  const { effectiveTenantId } = useAuthContext();
  const { data: settings, isLoading } = useTenantSettings();
  const saveMutation = useSaveTenantSettings();
  const uploadMutation = useUploadTenantLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({ ...DEFAULTS });
  const [presets, setPresets] = useState<Record<string, Partial<FormState>>>({});
  const [presetName, setPresetName] = useState('');

  // Load presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PRESET_STORAGE_KEY);
      if (stored) setPresets(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (settings) {
      setForm({
        brand_name: settings.brand_name || '',
        primary_color: settings.primary_color || '#1e3a5f',
        button_text_color: (settings as any).button_text_color || '',
        menu_text_color: (settings as any).menu_text_color || '',
        brand_text_color: (settings as any).brand_text_color || '',
        sidebar_bg_color: (settings as any).sidebar_bg_color || '',
        menu_active_color: (settings as any).menu_active_color || '',
        menu_active_text_color: (settings as any).menu_active_text_color || '',
        font_family: (settings as any).font_family || '',
        custom_css: (settings as any).custom_css || '',
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

  // Live preview on every form change
  const handleChange = useCallback((field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Apply live preview for visual fields
      if (BRANDING_FIELDS.includes(field as keyof FormState)) {
        applyLivePreview(next);
      }
      return next;
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !effectiveTenantId) return;
    if (!file.type.startsWith('image/')) { toast.error('Bitte wählen Sie eine Bilddatei aus.'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Die Datei darf maximal 2 MB groß sein.'); return; }
    try {
      const url = await uploadMutation.mutateAsync({ file, tenantId: effectiveTenantId });
      setForm((prev) => ({ ...prev, logo_url: url + '?t=' + Date.now() }));
      toast.success('Logo hochgeladen');
    } catch (err: any) {
      toast.error('Fehler beim Hochladen: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoRemove = async () => {
    if (!effectiveTenantId) return;
    try {
      const { data: files } = await supabase.storage.from('tenant-assets').list(effectiveTenantId);
      if (files && files.length > 0) {
        const logoFiles = files.filter(f => f.name.startsWith('logo.'));
        if (logoFiles.length > 0) {
          await supabase.storage.from('tenant-assets').remove(logoFiles.map(f => `${effectiveTenantId}/${f.name}`));
        }
      }
    } catch {}
    setForm((prev) => ({ ...prev, logo_url: '' }));
    toast.success('Logo entfernt – bitte speichern Sie die Einstellungen.');
  };

  const handleSave = async () => {
    try {
      // Only send fields that exist in the DB to avoid schema cache errors
      const dbFields: (keyof FormState)[] = [
        'brand_name', 'logo_url', 'primary_color', 'button_text_color',
        'menu_text_color', 'brand_text_color', 'sidebar_bg_color',
        'menu_active_color', 'menu_active_text_color', 'font_family',
        'custom_css', 'address', 'phone', 'website', 'imprint',
        'imprint_url', 'privacy_text', 'privacy_url',
      ];
      const payload: Record<string, any> = {};
      dbFields.forEach(f => {
        if (form[f] !== undefined) payload[f] = form[f] || null;
      });
      await saveMutation.mutateAsync(payload);
      logAudit('settings_updated', 'tenant_settings', effectiveTenantId || undefined);
      toast.success('Einstellungen gespeichert');
    } catch (err: any) {
      console.error('BrandingSave error:', err, JSON.stringify(err));
      toast.error('Fehler beim Speichern: ' + err.message);
    }
  };

  const handleReset = () => {
    const resetForm = { ...form };
    BRANDING_FIELDS.forEach(f => { resetForm[f] = DEFAULTS[f]; });
    setForm(resetForm);
    applyLivePreview(resetForm);
    toast.info('Farben & Schrift auf Standard zurückgesetzt. Bitte speichern.');
  };

  const handleResetName = () => {
    setForm((prev) => ({ ...prev, brand_name: '' }));
    toast.info('Firmenname zurückgesetzt. Bitte speichern.');
  };

  const handleResetLogo = async () => {
    if (effectiveTenantId) {
      try {
        const { data: files } = await supabase.storage.from('tenant-assets').list(effectiveTenantId);
        if (files && files.length > 0) {
          const logoFiles = files.filter(f => f.name.startsWith('logo.'));
          if (logoFiles.length > 0) {
            await supabase.storage.from('tenant-assets').remove(logoFiles.map(f => `${effectiveTenantId}/${f.name}`));
          }
        }
      } catch {}
    }
    setForm((prev) => ({ ...prev, logo_url: '' }));
    toast.info('Logo zurückgesetzt. Bitte speichern.');
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) { toast.error('Bitte geben Sie einen Namen ein.'); return; }
    const preset: Partial<FormState> = {};
    BRANDING_FIELDS.forEach(f => { preset[f] = form[f]; });
    const updated = { ...presets, [presetName.trim()]: preset };
    setPresets(updated);
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
    setPresetName('');
    toast.success(`Preset „${presetName.trim()}" gespeichert`);
  };

  const handleLoadPreset = (name: string) => {
    const preset = presets[name];
    if (!preset) return;
    const newForm = { ...form, ...preset };
    setForm(newForm);
    applyLivePreview(newForm);
    toast.success(`Preset „${name}" geladen. Bitte speichern.`);
  };

  const handleDeletePreset = (name: string) => {
    const updated = { ...presets };
    delete updated[name];
    setPresets(updated);
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
    toast.success(`Preset „${name}" gelöscht`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }



  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branding & Einstellungen</h1>
          <p className="text-muted-foreground mt-1">
            Änderungen an Farben werden sofort als Vorschau angezeigt.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Speichern
        </Button>
      </div>

      <Tabs defaultValue="brand" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="brand" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Marke & Logo
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-1.5">
            <Palette className="h-4 w-4" /> Farben
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-1.5">
            <Type className="h-4 w-4" /> Schrift & CSS
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Kontakt
          </TabsTrigger>
          <TabsTrigger value="legal" className="gap-1.5">
            <Shield className="h-4 w-4" /> Rechtliches
          </TabsTrigger>
          <TabsTrigger value="presets" className="gap-1.5">
            <Download className="h-4 w-4" /> Presets
          </TabsTrigger>
        </TabsList>

        {/* Tab: Marke & Logo */}
        <TabsContent value="brand" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Ihr Logo wird in der Navigation, auf Login-Seiten und in E-Mails angezeigt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="h-12 w-12 rounded-lg object-contain border border-border bg-background" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        {form.logo_url ? 'Logo ersetzen' : 'Logo hochladen'}
                      </Button>
                      {form.logo_url && (
                        <Button variant="ghost" size="sm" onClick={handleResetLogo} title="Logo zurücksetzen">
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Zurücksetzen
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG – max. 2 MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Farben */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          {/* Button-Farben */}
          <Card>
            <CardHeader>
              <CardTitle>Button-Farben</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 items-start">
                <div className="flex-1 space-y-5">
                  <ColorField label="Buttonfarbe (Akzentfarbe)" field="primary_color" value={form.primary_color} placeholder="#1e3a5f" defaultVal="#1e3a5f" onChange={handleChange} />
                  <ColorField label="Button-Schriftfarbe" field="button_text_color" value={form.button_text_color} placeholder="#ffffff (Standard)" defaultVal="#ffffff" onChange={handleChange} />
                </div>
                <div className="w-48 shrink-0 pt-2">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Vorschau</div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" style={{ backgroundColor: form.primary_color, color: form.button_text_color || '#fff' }}>
                      Beispiel-Button
                    </Button>
                    <Button size="sm" variant="outline" style={{ borderColor: form.primary_color, color: form.primary_color }}>
                      Outline-Button
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seitenleiste */}
          <Card>
            <CardHeader>
              <CardTitle>Seitenleiste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 items-start">
                <div className="flex-1 space-y-5">
                  <ColorField label="Hintergrundfarbe" field="sidebar_bg_color" value={form.sidebar_bg_color} placeholder="#141414 (Standard)" defaultVal="#141414" onChange={handleChange} />
                  <ColorField label="Schriftfarbe" field="menu_text_color" value={form.menu_text_color} placeholder="#c7c7c7 (Standard)" defaultVal="#c7c7c7" onChange={handleChange} />
                  <ColorField label="Toolname-Schriftfarbe" field="brand_text_color" value={form.brand_text_color} placeholder="#ffffff (Standard)" defaultVal="#ffffff" onChange={handleChange} />
                </div>
                <div className="w-48 shrink-0 pt-2">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Vorschau</div>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <div className="p-3 space-y-1.5" style={{ backgroundColor: form.sidebar_bg_color || '#141414' }}>
                      <div className="text-xs font-bold truncate" style={{ color: form.brand_text_color || '#ffffff' }}>
                        {form.brand_name || 'GoBD-Suite'}
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{ color: form.menu_text_color || '#c7c7c7' }}>
                        ○ Menüpunkt
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{ color: form.menu_text_color || '#c7c7c7' }}>
                        ○ Menüpunkt
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aktiver Menüpunkt */}
          <Card>
            <CardHeader>
              <CardTitle>Aktiver Menüpunkt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8 items-start">
                <div className="flex-1 space-y-5">
                  <ColorField label="Hintergrundfarbe" field="menu_active_color" value={form.menu_active_color} placeholder="#262626 (Standard)" defaultVal="#262626" onChange={handleChange} />
                  <ColorField label="Schriftfarbe" field="menu_active_text_color" value={form.menu_active_text_color} placeholder="#d9d9d9 (Standard)" defaultVal="#d9d9d9" onChange={handleChange} />
                </div>
                <div className="w-48 shrink-0 pt-2">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Vorschau</div>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <div className="p-3 space-y-1.5" style={{ backgroundColor: form.sidebar_bg_color || '#141414' }}>
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{ color: form.menu_text_color || '#c7c7c7' }}>
                        ○ Menüpunkt
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{
                        backgroundColor: form.menu_active_color || '#262626',
                        color: form.menu_active_text_color || '#d9d9d9',
                      }}>
                        ● Aktiver Menüpunkt
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs" style={{ color: form.menu_text_color || '#c7c7c7' }}>
                        ○ Menüpunkt
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Schrift & CSS */}
        <TabsContent value="typography" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Schriftart</CardTitle>
              <CardDescription>Binden Sie die Schrift via Custom CSS mit @import ein</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Schriftart (Google Fonts Name)</Label>
                <Input value={form.font_family} onChange={(e) => handleChange('font_family', e.target.value)} placeholder="z.B. Inter, Roboto, Open Sans, Lato" />
              </div>
              {form.font_family && (
                <div className="p-3 rounded-md border border-border" style={{ fontFamily: form.font_family }}>
                  <p className="text-sm">Vorschau: Das ist ein Beispieltext in „{form.font_family}".</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Eigenes CSS</CardTitle>
              <CardDescription>CSS-Code für erweiterte Anpassungen. Wird nach dem Speichern aktiv.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.custom_css}
                onChange={(e) => handleChange('custom_css', e.target.value)}
                placeholder={`/* Google Font einbinden */\n@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');\n\n/* Sidebar-Hintergrund */\n[data-sidebar] {\n  background-color: #1a1a2e !important;\n}`}
                rows={10}
                className="font-mono text-xs"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Kontakt */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Musterstraße 1, 12345 Berlin" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+49 123 456789" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://www.example.de" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Rechtliches */}
        <TabsContent value="legal" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Impressum</CardTitle>
              <CardDescription>Impressumstext und/oder Link. Beides optional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Impressum-Text</Label>
                <Textarea value={form.imprint} onChange={(e) => handleChange('imprint', e.target.value)} placeholder="Impressum-Text eingeben..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Impressum-URL</Label>
                <Input value={form.imprint_url} onChange={(e) => handleChange('imprint_url', e.target.value)} placeholder="https://www.example.de/impressum" type="url" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Datenschutz</CardTitle>
              <CardDescription>Datenschutztext und/oder Link. Beides optional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Datenschutz-Text</Label>
                <Textarea value={form.privacy_text} onChange={(e) => handleChange('privacy_text', e.target.value)} placeholder="Datenschutzerklärung eingeben..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Datenschutz-URL</Label>
                <Input value={form.privacy_url} onChange={(e) => handleChange('privacy_url', e.target.value)} placeholder="https://www.example.de/datenschutz" type="url" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Presets */}
        <TabsContent value="presets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Design-Presets</CardTitle>
              <CardDescription>Speichern Sie Ihr Farbschema, laden Sie es jederzeit wieder oder setzen Sie alles zurück.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Preset-Name eingeben..." className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                  <Save className="h-4 w-4 mr-2" /> Speichern
                </Button>
              </div>

              {Object.keys(presets).length > 0 && (
                <div className="space-y-2">
                  <Label>Gespeicherte Presets</Label>
                  {Object.keys(presets).map(name => (
                    <div key={name} className="flex items-center gap-2 p-2 rounded-md border border-border">
                      <span className="flex-1 text-sm font-medium">{name}</span>
                      <Button variant="outline" size="sm" onClick={() => handleLoadPreset(name)}>
                        <FolderOpen className="h-3.5 w-3.5 mr-1" /> Laden
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeletePreset(name)}>
                        Löschen
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" /> Auf Standard zurücksetzen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
