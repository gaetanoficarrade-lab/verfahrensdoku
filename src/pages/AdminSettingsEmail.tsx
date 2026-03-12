import { useState, useEffect, useMemo } from 'react';
import { AdminSettingsLayout } from '@/components/AdminSettingsLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Loader2, Mail, Info, Eye, Code, RotateCcw, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmailTemplate {
  subject: string;
  html: string;
}

interface AllEmailTemplates {
  tenant_invite: EmailTemplate;
  client_invite: EmailTemplate;
  team_invite: EmailTemplate;
  password_reset: EmailTemplate;
  notification_chapter_submitted: EmailTemplate;
  notification_chapter_approved: EmailTemplate;
  notification_document_finalized: EmailTemplate;
  notification_new_tenant: EmailTemplate;
}

const defaultBaseLayout = (content: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${content}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">
    Diese E-Mail wurde von {{brand_name}} versendet.
  </p>
</div>`;

const defaultTemplates: AllEmailTemplates = {
  tenant_invite: {
    subject: 'Willkommen bei {{plattform}} – Ihr Zugang',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Willkommen bei {{plattform}}</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    {{greeting}}
  </p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihr Lizenznehmer-Konto <strong>{{tenant_name}}</strong> wurde erstellt. 
    Bitte klicken Sie auf den folgenden Link, um Ihren persönlichen Zugang einzurichten:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Zugang einrichten
    </a>
  </div>
  <p style="color: #999; font-size: 13px;">
    Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
    <a href="{{link}}" style="color: #999;">{{link}}</a>
  </p>
  <p style="color: #999; font-size: 12px;">Der Link ist 7 Tage gültig.</p>`),
  },
  client_invite: {
    subject: 'Einladung zur Verfahrensdokumentation – {{brand_name}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Einladung zur Verfahrensdokumentation</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Sie wurden eingeladen, an einer Verfahrensdokumentation nach GoBD mitzuarbeiten.
  </p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Klicken Sie auf den folgenden Link, um sich zu registrieren und Ihre Daten einzugeben:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Registrierung starten
    </a>
  </div>
  <p style="color: #999; font-size: 13px;">
    Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
    <a href="{{link}}" style="color: #999;">{{link}}</a>
  </p>`),
  },
  team_invite: {
    subject: 'Teameinladung – {{brand_name}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Einladung zum Team</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Sie wurden als <strong>{{role_name}}</strong> in das Team von {{brand_name}} eingeladen.
  </p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Klicken Sie auf den folgenden Link, um sich zu registrieren:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Registrierung starten
    </a>
  </div>
  <p style="color: #999; font-size: 13px;">
    Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
    <a href="{{link}}" style="color: #999;">{{link}}</a>
  </p>`),
  },
  password_reset: {
    subject: 'Passwort zurücksetzen – {{plattform}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Passwort zurücksetzen</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Sie haben ein neues Passwort für Ihren {{plattform}}-Zugang angefordert.
  </p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Klicken Sie auf den folgenden Link, um Ihr Passwort zu ändern:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Passwort ändern
    </a>
  </div>
  <p style="color: #555; font-size: 14px; line-height: 1.6;">
    Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail ignorieren.
  </p>`),
  },
  notification_chapter_submitted: {
    subject: 'Kapitel eingereicht – {{brand_name}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Kapitel eingereicht</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Mandant "<strong>{{client_name}}</strong>" hat Kapitel "<strong>{{chapter_name}}</strong>" eingereicht.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Jetzt ansehen
    </a>
  </div>`),
  },
  notification_chapter_approved: {
    subject: 'Kapitel freigegeben – {{brand_name}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Kapitel freigegeben</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihr Kapitel "<strong>{{chapter_name}}</strong>" wurde freigegeben.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Jetzt ansehen
    </a>
  </div>`),
  },
  notification_document_finalized: {
    subject: 'Verfahrensdokumentation fertiggestellt – {{brand_name}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Verfahrensdokumentation fertig</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihre Verfahrensdokumentation "<strong>{{project_name}}</strong>" ist fertiggestellt.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Jetzt ansehen
    </a>
  </div>`),
  },
  notification_new_tenant: {
    subject: 'Neuer Lizenznehmer – {{plattform}}',
    html: defaultBaseLayout(`
  <h2 style="color: #1a1a1a;">Neuer Lizenznehmer</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Neuer Lizenznehmer "<strong>{{tenant_name}}</strong>" hat sich registriert.
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Jetzt ansehen
    </a>
  </div>`),
  },
};

const templateCategories = [
  {
    label: 'Einladungen',
    templates: [
      { key: 'tenant_invite' as const, label: 'Lizenznehmer-Einladung', icon: '🏢' },
      { key: 'client_invite' as const, label: 'Mandanten-Einladung', icon: '👤' },
      { key: 'team_invite' as const, label: 'Team-Einladung', icon: '👥' },
    ],
  },
  {
    label: 'Authentifizierung',
    templates: [
      { key: 'password_reset' as const, label: 'Passwort-Reset', icon: '🔑' },
    ],
  },
  {
    label: 'Benachrichtigungen',
    templates: [
      { key: 'notification_chapter_submitted' as const, label: 'Kapitel eingereicht', icon: '📝' },
      { key: 'notification_chapter_approved' as const, label: 'Kapitel freigegeben', icon: '✅' },
      { key: 'notification_document_finalized' as const, label: 'Dokument fertiggestellt', icon: '📄' },
      { key: 'notification_new_tenant' as const, label: 'Neuer Lizenznehmer', icon: '🆕' },
    ],
  },
];

const placeholdersByTemplate: Record<string, { key: string; desc: string; example: string }[]> = {
  tenant_invite: [
    { key: '{{greeting}}', desc: 'Persönliche Begrüßung', example: 'Hallo Max Mustermann,' },
    { key: '{{tenant_name}}', desc: 'Name des Lizenznehmers', example: 'Kanzlei Mustermann' },
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname (Tenant/Plattform)', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://vd.gaetanoficarra.de/register?token=abc' },
  ],
  client_invite: [
    { key: '{{brand_name}}', desc: 'Kanzleiname', example: 'Kanzlei Mustermann' },
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://vd.gaetanoficarra.de/client-register?token=abc' },
  ],
  team_invite: [
    { key: '{{role_name}}', desc: 'Rolle (Administrator/Mitarbeiter)', example: 'Mitarbeiter' },
    { key: '{{brand_name}}', desc: 'Kanzleiname', example: 'Kanzlei Mustermann' },
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://vd.gaetanoficarra.de/register?token=abc' },
  ],
  password_reset: [
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Reset-Link', example: 'https://vd.gaetanoficarra.de/set-password?token=abc' },
  ],
  notification_chapter_submitted: [
    { key: '{{client_name}}', desc: 'Mandantenname', example: 'Firma XYZ' },
    { key: '{{chapter_name}}', desc: 'Kapitelname', example: 'Kapitel 3: IT-Systeme' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Kapitel', example: 'https://vd.gaetanoficarra.de/projects/1/chapters/3' },
  ],
  notification_chapter_approved: [
    { key: '{{chapter_name}}', desc: 'Kapitelname', example: 'Kapitel 3: IT-Systeme' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Kapitel', example: 'https://vd.gaetanoficarra.de/client/projects/1/chapters/3' },
  ],
  notification_document_finalized: [
    { key: '{{project_name}}', desc: 'Projektname', example: 'VD Firma XYZ 2025' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Projekt', example: 'https://vd.gaetanoficarra.de/client/projects/1' },
  ],
  notification_new_tenant: [
    { key: '{{tenant_name}}', desc: 'Name des neuen Lizenznehmers', example: 'Kanzlei Neu GmbH' },
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zur Verwaltung', example: 'https://vd.gaetanoficarra.de/admin/tenants' },
  ],
};

export default function AdminSettingsEmail() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<AllEmailTemplates>(defaultTemplates);
  const [activeTemplate, setActiveTemplate] = useState<keyof AllEmailTemplates>('tenant_invite');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'email_templates_v2')
        .maybeSingle();
      if (data?.value) {
        const val = data.value as unknown as Partial<AllEmailTemplates>;
        const merged = { ...defaultTemplates };
        for (const key of Object.keys(defaultTemplates) as Array<keyof AllEmailTemplates>) {
          if (val[key]) {
            merged[key] = { ...defaultTemplates[key], ...val[key] };
          }
        }
        setTemplates(merged);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert(
          { key: 'email_templates_v2', value: templates as unknown as Record<string, unknown> },
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

  const updateTemplate = (field: keyof EmailTemplate, value: string) => {
    setTemplates((prev) => ({
      ...prev,
      [activeTemplate]: { ...prev[activeTemplate], [field]: value },
    }));
  };

  const resetTemplate = () => {
    setTemplates((prev) => ({
      ...prev,
      [activeTemplate]: defaultTemplates[activeTemplate],
    }));
    toast.info('Vorlage auf Standard zurückgesetzt');
  };

  const previewHtml = useMemo(() => {
    const current = templates[activeTemplate];
    let html = current.html;
    const placeholders = placeholdersByTemplate[activeTemplate] || [];
    for (const p of placeholders) {
      html = html.split(p.key).join(p.example);
    }
    return html;
  }, [templates, activeTemplate]);

  const currentPlaceholders = placeholdersByTemplate[activeTemplate] || [];
  const currentTemplate = templates[activeTemplate];
  const allTemplateInfo = templateCategories.flatMap(c => c.templates) as Array<{ key: string; label: string; icon: string }>;
  const activeInfo = allTemplateInfo.find(t => t.key === activeTemplate);

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
      <div className="space-y-4">
        <div className="flex gap-6 min-h-[600px]">
          {/* Template List Sidebar */}
          <div className="w-56 shrink-0 space-y-4">
            {templateCategories.map((cat) => (
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
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
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
                      <Badge variant="secondary" className="font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
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
    </AdminSettingsLayout>
  );
}
