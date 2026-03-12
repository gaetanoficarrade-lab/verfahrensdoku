import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, Loader2, Eye, RotateCcw, Upload, ImageIcon, X, FileText, ChevronDown, Info } from 'lucide-react';
import { toast } from 'sonner';

export interface EmailTemplate {
  subject: string;
  heading: string;
  body: string;
  buttonText: string;
  footerNote?: string;
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
  const [placeholdersOpen, setPlaceholdersOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof EmailTemplate, value: string) => {
    onChange({
      ...templates,
      [activeTemplate]: { ...templates[activeTemplate], [field]: value },
    });
  };

  const resetTemplate = () => {
    if (defaultTemplates[activeTemplate]) {
      onChange({ ...templates, [activeTemplate]: defaultTemplates[activeTemplate] });
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
    if (!file.type.startsWith('image/')) { toast.error('Bitte nur Bilddateien hochladen'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Maximale Dateigröße: 2 MB'); return; }
    try {
      await onLogoUpload(file);
      toast.success('Logo hochgeladen');
    } catch (err: any) {
      toast.error('Upload fehlgeschlagen: ' + err.message);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Row 1: Logo + Template selector side by side */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Logo */}
        {onLogoUpload && (
          <div className="flex items-center gap-3 rounded-lg border border-input bg-card px-4 py-3">
            {logoUrl ? (
              <div className="relative shrink-0">
                <img src={logoUrl} alt="Logo" className="h-10 max-w-[140px] object-contain rounded border border-input p-0.5 bg-white" />
                {onLogoRemove && (
                  <button onClick={onLogoRemove} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-10 w-24 rounded border border-dashed border-input flex items-center justify-center text-xs text-muted-foreground shrink-0">
                <ImageIcon className="h-4 w-4 mr-1" /> Kein Logo
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={logoUploading}>
              {logoUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
              {logoUrl ? 'Ändern' : 'Hochladen'}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}

        {/* Template selector */}
        <div className="flex items-center gap-3 flex-1">
          <Label className="text-sm font-medium whitespace-nowrap">Vorlage:</Label>
          <Select value={activeTemplate} onValueChange={setActiveTemplate}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectGroup key={cat.label}>
                  <SelectLabel>{cat.label}</SelectLabel>
                  {cat.templates.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={resetTemplate} title="Auf Standard zurücksetzen">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" onClick={() => onSave(templates)} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
              Speichern
            </Button>
          </div>
        </div>
      </div>

      {/* Row 2: Editor / Preview */}
      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Bearbeiten
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Vorschau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{activeInfo?.icon} {activeInfo?.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Betreff</Label>
                  <Input value={currentTemplate.subject} onChange={(e) => updateField('subject', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Überschrift</Label>
                  <Input value={currentTemplate.heading} onChange={(e) => updateField('heading', e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Nachricht</Label>
                <Textarea
                  value={currentTemplate.body}
                  onChange={(e) => updateField('body', e.target.value)}
                  className="min-h-[120px] resize-y"
                  placeholder="Jede Zeile wird als eigener Absatz dargestellt"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Button-Text</Label>
                  <Input value={currentTemplate.buttonText} onChange={(e) => updateField('buttonText', e.target.value)} placeholder="z.B. Zugang einrichten" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Hinweis <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input value={currentTemplate.footerNote || ''} onChange={(e) => updateField('footerNote', e.target.value)} placeholder="z.B. Der Link ist 7 Tage gültig." />
                </div>
              </div>

              {/* Collapsible placeholders */}
              <Collapsible open={placeholdersOpen} onOpenChange={setPlaceholdersOpen}>
                <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                  Verfügbare Platzhalter
                  <ChevronDown className={`h-3 w-3 transition-transform ${placeholdersOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {currentPlaceholders.map((p) => (
                      <Badge
                        key={p.key}
                        variant="secondary"
                        className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => { navigator.clipboard.writeText(p.key); toast.info(`${p.key} kopiert`); }}
                        title={p.desc}
                      >
                        {p.key}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="rounded-lg border border-input bg-white overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b border-input">
              <p className="text-xs text-muted-foreground">
                <strong>Betreff:</strong>{' '}
                {(() => {
                  let s = currentTemplate.subject;
                  for (const p of currentPlaceholders) s = s.split(p.key).join(p.example);
                  return s;
                })()}
              </p>
            </div>
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;}</style></head><body>${previewHtml}</body></html>`}
              className="w-full min-h-[400px] border-0"
              title="E-Mail Vorschau"
              sandbox=""
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { buildHtml };
