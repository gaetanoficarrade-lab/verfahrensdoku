import { EmailTemplateMap } from '@/components/EmailTemplateEditor';

const defaultBaseLayout = (content: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  {{logo_url ? '<img src="{{logo_url}}" alt="Logo" style="max-height: 48px; margin-bottom: 20px;" />' : ''}}
  ${content}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">
    Diese E-Mail wurde von {{brand_name}} versendet.
  </p>
</div>`;

export const defaultTemplates: EmailTemplateMap = {
  tenant_invite: {
    subject: 'Willkommen bei {{plattform}} – Ihr Zugang',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Willkommen bei {{plattform}}</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">{{greeting}}</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihr Lizenznehmer-Konto <strong>{{tenant_name}}</strong> wurde erstellt. 
    Bitte klicken Sie auf den folgenden Link, um Ihren persönlichen Zugang einzurichten:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Zugang einrichten</a>
  </div>
  <p style="color: #999; font-size: 13px;">Falls der Button nicht funktioniert:<br/><a href="{{link}}" style="color: #999;">{{link}}</a></p>
  <p style="color: #999; font-size: 12px;">Der Link ist 7 Tage gültig.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  client_invite: {
    subject: 'Einladung zur Verfahrensdokumentation – {{brand_name}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Einladung zur Verfahrensdokumentation</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Sie wurden eingeladen, an einer Verfahrensdokumentation nach GoBD mitzuarbeiten.</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Klicken Sie auf den folgenden Link, um sich zu registrieren:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Registrierung starten</a>
  </div>
  <p style="color: #999; font-size: 13px;">Falls der Button nicht funktioniert:<br/><a href="{{link}}" style="color: #999;">{{link}}</a></p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  team_invite: {
    subject: 'Teameinladung – {{brand_name}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Einladung zum Team</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Sie wurden als <strong>{{role_name}}</strong> in das Team von {{brand_name}} eingeladen.</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Klicken Sie auf den folgenden Link, um sich zu registrieren:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Registrierung starten</a>
  </div>
  <p style="color: #999; font-size: 13px;">Falls der Button nicht funktioniert:<br/><a href="{{link}}" style="color: #999;">{{link}}</a></p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  password_reset: {
    subject: 'Passwort zurücksetzen – {{plattform}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Passwort zurücksetzen</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Sie haben ein neues Passwort für Ihren {{plattform}}-Zugang angefordert.</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Klicken Sie auf den folgenden Link, um Ihr Passwort zu ändern:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Passwort ändern</a>
  </div>
  <p style="color: #555; font-size: 14px;">Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail ignorieren.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  notification_chapter_submitted: {
    subject: 'Kapitel eingereicht – {{brand_name}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Kapitel eingereicht</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Mandant "<strong>{{client_name}}</strong>" hat Kapitel "<strong>{{chapter_name}}</strong>" eingereicht.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Jetzt ansehen</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  notification_chapter_approved: {
    subject: 'Kapitel freigegeben – {{brand_name}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Kapitel freigegeben</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Ihr Kapitel "<strong>{{chapter_name}}</strong>" wurde freigegeben.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Jetzt ansehen</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  notification_document_finalized: {
    subject: 'Verfahrensdokumentation fertiggestellt – {{brand_name}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Verfahrensdokumentation fertig</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Ihre Verfahrensdokumentation "<strong>{{project_name}}</strong>" ist fertiggestellt.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Jetzt ansehen</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
  notification_new_tenant: {
    subject: 'Neuer Lizenznehmer – {{plattform}}',
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Neuer Lizenznehmer</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">Neuer Lizenznehmer "<strong>{{tenant_name}}</strong>" hat sich registriert.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">Jetzt ansehen</a>
  </div>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`,
  },
};

export const adminCategories = [
  {
    label: 'Einladungen',
    templates: [
      { key: 'tenant_invite', label: 'Lizenznehmer-Einladung', icon: '🏢' },
      { key: 'client_invite', label: 'Mandanten-Einladung', icon: '👤' },
      { key: 'team_invite', label: 'Team-Einladung', icon: '👥' },
    ],
  },
  {
    label: 'Authentifizierung',
    templates: [
      { key: 'password_reset', label: 'Passwort-Reset', icon: '🔑' },
    ],
  },
  {
    label: 'Benachrichtigungen',
    templates: [
      { key: 'notification_chapter_submitted', label: 'Kapitel eingereicht', icon: '📝' },
      { key: 'notification_chapter_approved', label: 'Kapitel freigegeben', icon: '✅' },
      { key: 'notification_document_finalized', label: 'Dokument fertiggestellt', icon: '📄' },
      { key: 'notification_new_tenant', label: 'Neuer Lizenznehmer', icon: '🆕' },
    ],
  },
];

// Tenant-level: only templates relevant to tenant (no tenant_invite, no new_tenant)
export const tenantCategories = [
  {
    label: 'Einladungen',
    templates: [
      { key: 'client_invite', label: 'Mandanten-Einladung', icon: '👤' },
      { key: 'team_invite', label: 'Team-Einladung', icon: '👥' },
    ],
  },
  {
    label: 'Benachrichtigungen',
    templates: [
      { key: 'notification_chapter_submitted', label: 'Kapitel eingereicht', icon: '📝' },
      { key: 'notification_chapter_approved', label: 'Kapitel freigegeben', icon: '✅' },
      { key: 'notification_document_finalized', label: 'Dokument fertiggestellt', icon: '📄' },
    ],
  },
];

export const placeholdersByTemplate: Record<string, { key: string; desc: string; example: string }[]> = {
  tenant_invite: [
    { key: '{{greeting}}', desc: 'Persönliche Begrüßung', example: 'Hallo Max Mustermann,' },
    { key: '{{tenant_name}}', desc: 'Name des Lizenznehmers', example: 'Kanzlei Mustermann' },
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
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
