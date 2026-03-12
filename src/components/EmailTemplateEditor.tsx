import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Mail, Info, Eye, RotateCcw, Upload, ImageIcon, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface EmailTemplate {
  subject: string;
  heading: string;
  body: string;
  buttonText: string;
  footerNote?: string;
  // Legacy support: if html exists, we migrate from it
  html?: string;
}

export interface EmailTemplateMap {
  [key: string]: EmailTemplate;
}

interface TemplateCategoryItem {
  key: string;
  label: string;
  icon: string;
}

interface TemplateCategory {
  label: string;
  templates: TemplateCategoryItem[];
}

interface PlaceholderInfo {
  key: string;
  desc: string;
  example: string;
}

interface EmailTemplateEditorProps {
  templates: EmailTemplateMap;
  defaultTemplates: EmailTemplateMap;
  categories: TemplateCategory[];
  placeholdersByTemplate: Record<string, PlaceholderInfo[]>;
  saving: boolean;
  onSave: (templates: EmailTemplateMap) => void;
  logoUrl?: string;
  onLogoUpload?: (file: File) => Promise<string>;
  onLogoRemove?: () => void;
  logoUploading?: boolean;
  onChange: (templates: EmailTemplateMap) => void;
}

/** Generate HTML from structured fields */
function buildHtml(t: EmailTemplate, logoUrl?: string): string {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="max-height: 48px; margin-bottom: 20px;" />`
    : '';

  const bodyParagraphs = t.body
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<p style="color: #555; font-size: 16px; line-height: 1.6;">${line}</p>`)
    .join('\n  ');

  const buttonHtml = t.buttonText
    ? `<div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">${t.buttonText}</a>
  </div>
  <p style="color: #999; font-size: 13px;">Falls der Button nicht funktioniert:<br/><a href="{{link}}" style="color: #999;">{{link}}</a></p>`
    : '';

  const footerHtml = t.footerNote
    ? `<p style="color: #999; font-size: 12px;">${t.footerNote}</p>`
    : '';

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${logoHtml}
  <h2 style="color: #1a1a1a;">${t.heading}</h2>
  ${bodyParagraphs}
  ${buttonHtml}
  ${footerHtml}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`;
}

export function EmailTemplateEditor({
  templates,
  defaultTemplates,
  categories,
  placeholdersByTemplate,
  saving,
  onSave,
  logoUrl,
  onLogoUpload,
  onLogoRemove,
  logoUploading,
  onChange,
}: EmailTemplateEditorProps) {
  const allTemplates = categories.flatMap((c) => c.templates);
  const [activeTemplate, setActiveTemplate] = useState<string>(allTemplates[0]?.key || '');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof EmailTemplate, value: string) => {
    onChange({
      ...templates,
      [activeTemplate]: { ...templates[activeTemplate], [field]: value },
    });
  };

  const resetTemplate = () => {
    if (defaultTemplates[activeTemplate]) {
      onChange({
        ...templates,
        [activeTemplate]: defaultTemplates[activeTemplate],
      });
      toast.info('Vorlage auf Standard zurückgesetzt');
    }
  };

  const previewHtml = useMemo(() => {
    const current = templates[activeTemplate];
    if (!current) return '';
    let html = buildHtml(current, logoUrl);
    const placeholders = placeholdersByTemplate[activeTemplate] || [];
    for (const p of placeholders) {
      html = html.split(p.key).join(p.example);
    }
    return html;
  }, [templates, activeTemplate, logoUrl, placeholdersByTemplate]);

  const currentPlaceholders = placeholdersByTemplate[activeTemplate] || [];
  const currentTemplate = templates[activeTemplate];
  const activeInfo = allTemplates.find((t) => t.key === activeTemplate);

  if (!currentTemplate) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onLogoUpload) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte nur Bilddateien hochladen');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Maximale Dateigröße: 2 MB');
      return;
    }
    try {
      await onLogoUpload(file);
      toast.success('Logo hochgeladen');
    } catch (err: any) {
      toast.error('Upload fehlgeschlagen: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Build the save handler that converts to HTML before saving
  const handleSaveClick = () => {
    // Generate HTML for all templates before saving
    const withHtml: EmailTemplateMap = {};
    for (const key of Object.keys(templates)) {
      withHtml[key] = { ...templates[key] };
    }
    onSave(withHtml);
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      {onLogoUpload && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              E-Mail-Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="E-Mail Logo"
                    className="h-12 max-w-[200px] object-contain rounded border border-input p-1 bg-white"
                  />
                  {onLogoRemove && (
                    <button
                      onClick={onLogoRemove}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="h-12 w-32 rounded border border-dashed border-input flex items-center justify-center text-xs text-muted-foreground">
                  Kein Logo
                </div>
              )}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={logoUploading}
                >
                  {logoUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Logo hochladen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Das Logo wird automatisch in alle E-Mails eingefügt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horizontal Template Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
              {cat.label}:
            </span>
            {cat.templates.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTemplate(t.key); setViewMode('edit'); }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                  activeTemplate === t.key
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-2 last:hidden" />
          </div>
        ))}
      </div>

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {activeInfo?.icon} {activeInfo?.label}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetTemplate}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Zurücksetzen
          </Button>
          <Button size="sm" onClick={handleSaveClick} disabled={saving}>
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="h-3.5 w-3.5 mr-1.5" />
            )}
            Speichern
          </Button>
        </div>
      </div>

      {/* Edit / Preview Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'edit' | 'preview')}>
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Bearbeiten
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4 space-y-4">
          {/* Placeholders */}
          <Card>
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <Info className="h-3.5 w-3.5" />
                Verfügbare Platzhalter (zum Kopieren klicken)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {currentPlaceholders.map((p) => (
                  <Badge
                    key={p.key}
                    variant="secondary"
                    className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => {
                      navigator.clipboard.writeText(p.key);
                      toast.info(`${p.key} kopiert`);
                    }}
                    title={p.desc}
                  >
                    {p.key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simple form fields */}
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Betreff</Label>
              <Input
                value={currentTemplate.subject}
                onChange={(e) => updateField('subject', e.target.value)}
                placeholder="E-Mail-Betreff"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Überschrift</Label>
              <Input
                value={currentTemplate.heading}
                onChange={(e) => updateField('heading', e.target.value)}
                placeholder="Überschrift der E-Mail"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nachricht</Label>
              <Textarea
                value={currentTemplate.body}
                onChange={(e) => updateField('body', e.target.value)}
                placeholder="Nachrichtentext (jede Zeile wird als eigener Absatz dargestellt)"
                className="min-h-[150px] resize-y"
              />
              <p className="text-xs text-muted-foreground">Jede Zeile wird als eigener Absatz dargestellt. Platzhalter können im Text verwendet werden.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Button-Text</Label>
              <Input
                value={currentTemplate.buttonText}
                onChange={(e) => updateField('buttonText', e.target.value)}
                placeholder="z.B. Zugang einrichten"
              />
              <p className="text-xs text-muted-foreground">Der Button verlinkt automatisch auf {'{{link}}'}. Leer lassen um keinen Button anzuzeigen.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Hinweis (optional)</Label>
              <Input
                value={currentTemplate.footerNote || ''}
                onChange={(e) => updateField('footerNote', e.target.value)}
                placeholder="z.B. Der Link ist 7 Tage gültig."
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="rounded-md border border-input bg-white overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b border-input">
              <p className="text-xs text-muted-foreground">
                <strong>Betreff:</strong>{' '}
                {(() => {
                  let s = currentTemplate.subject;
                  for (const p of currentPlaceholders) {
                    s = s.split(p.key).join(p.example);
                  }
                  return s;
                })()}
              </p>
            </div>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;}</style></head><body>${previewHtml}</body></html>`}
              className="w-full min-h-[450px] border-0"
              title="E-Mail Vorschau"
              sandbox=""
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Export buildHtml for use in edge functions */
export { buildHtml };
