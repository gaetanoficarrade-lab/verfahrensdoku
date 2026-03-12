import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Mail, Info, Eye, Code, RotateCcw, Upload, ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface EmailTemplate {
  subject: string;
  html: string;
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
  const [activeTemplate, setActiveTemplate] = useState<string>(
    categories[0]?.templates[0]?.key || ''
  );
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateTemplate = (field: keyof EmailTemplate, value: string) => {
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
    let html = current.html;
    const placeholders = placeholdersByTemplate[activeTemplate] || [];
    for (const p of placeholders) {
      html = html.split(p.key).join(p.example);
    }
    // Replace logo placeholder with actual logo
    if (logoUrl) {
      html = html.split('{{logo_url}}').join(logoUrl);
    } else {
      // Remove logo img tags if no logo
      html = html.replace(/<img[^>]*\{\{logo_url\}\}[^>]*>/g, '');
    }
    return html;
  }, [templates, activeTemplate, logoUrl, placeholdersByTemplate]);

  const currentPlaceholders = placeholdersByTemplate[activeTemplate] || [];
  const currentTemplate = templates[activeTemplate];
  const allTemplateInfo = categories.flatMap((c) => c.templates);
  const activeInfo = allTemplateInfo.find((t) => t.key === activeTemplate);

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

  return (
    <div className="space-y-4">
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
                  Nutze <Badge variant="secondary" className="font-mono text-xs">{'{{logo_url}}'}</Badge> im HTML um das Logo einzubinden.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-6 min-h-[600px]">
        {/* Template List Sidebar */}
        <div className="w-56 shrink-0 space-y-4">
          {categories.map((cat) => (
            <div key={cat.label}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {cat.label}
              </p>
              <div className="space-y-1">
                {cat.templates.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTemplate(t.key)}
                    className={cn(
                      'flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors text-left',
                      activeTemplate === t.key
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span>{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 space-y-4">
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
              <Button size="sm" onClick={() => onSave(templates)} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Speichern
              </Button>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-sm">Betreff</Label>
            <Input
              value={currentTemplate.subject}
              onChange={(e) => updateTemplate('subject', e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Placeholders */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Verfügbare Platzhalter
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {currentPlaceholders.map((p) => (
                  <div key={p.key} className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText(p.key);
                        toast.info(`${p.key} kopiert`);
                      }}
                    >
                      {p.key}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{p.desc}</span>
                  </div>
                ))}
                {onLogoUpload && (
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        navigator.clipboard.writeText('{{logo_url}}');
                        toast.info('{{logo_url}} kopiert');
                      }}
                    >
                      {'{{logo_url}}'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">URL des E-Mail-Logos</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Code / Preview Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'code' | 'preview')}>
            <TabsList>
              <TabsTrigger value="code" className="gap-1.5">
                <Code className="h-3.5 w-3.5" />
                HTML-Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Vorschau
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="mt-3">
              <textarea
                value={currentTemplate.html}
                onChange={(e) => updateTemplate('html', e.target.value)}
                className="w-full min-h-[400px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                spellCheck={false}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-3">
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
                  className="w-full min-h-[400px] border-0"
                  title="E-Mail Vorschau"
                  sandbox=""
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
