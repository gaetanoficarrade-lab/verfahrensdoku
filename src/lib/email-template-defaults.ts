import { EmailTemplateMap } from '@/components/EmailTemplateEditor';

export const defaultTemplates: EmailTemplateMap = {
  tenant_invite: {
    subject: 'Willkommen bei {{plattform}} – Ihr Zugang',
    heading: 'Willkommen bei {{plattform}}',
    body: '{{greeting}}\nIhr Lizenznehmer-Konto <strong>{{tenant_name}}</strong> wurde erstellt.\nBitte klicken Sie auf den folgenden Button, um Ihren persönlichen Zugang einzurichten:',
    buttonText: 'Zugang einrichten',
    footerNote: 'Der Link ist 7 Tage gültig.',
  },
  client_invite: {
    subject: 'Einladung zur Verfahrensdokumentation – {{brand_name}}',
    heading: 'Einladung zur Verfahrensdokumentation',
    body: 'Sie wurden eingeladen, an einer Verfahrensdokumentation nach GoBD mitzuarbeiten.\nKlicken Sie auf den folgenden Button, um sich zu registrieren:',
    buttonText: 'Registrierung starten',
  },
  team_invite: {
    subject: 'Teameinladung – {{brand_name}}',
    heading: 'Einladung zum Team',
    body: 'Sie wurden als <strong>{{role_name}}</strong> in das Team von {{brand_name}} eingeladen.\nKlicken Sie auf den folgenden Button, um sich zu registrieren:',
    buttonText: 'Registrierung starten',
  },
  password_reset: {
    subject: 'Passwort zurücksetzen – {{plattform}}',
    heading: 'Passwort zurücksetzen',
    body: 'Sie haben ein neues Passwort für Ihren {{plattform}}-Zugang angefordert.\nKlicken Sie auf den folgenden Button, um Ihr Passwort zu ändern:',
    buttonText: 'Passwort ändern',
    footerNote: 'Wenn Sie diese Anforderung nicht gestellt haben, können Sie diese E-Mail ignorieren.',
  },
  notification_chapter_submitted: {
    subject: 'Kapitel eingereicht – {{brand_name}}',
    heading: 'Kapitel eingereicht',
    body: 'Kunde "<strong>{{client_name}}</strong>" hat Kapitel "<strong>{{chapter_name}}</strong>" eingereicht.',
    buttonText: 'Jetzt ansehen',
  },
  notification_chapter_approved: {
    subject: 'Kapitel freigegeben – {{brand_name}}',
    heading: 'Kapitel freigegeben',
    body: 'Ihr Kapitel "<strong>{{chapter_name}}</strong>" wurde freigegeben.',
    buttonText: 'Jetzt ansehen',
  },
  notification_document_finalized: {
    subject: 'Verfahrensdokumentation fertiggestellt – {{brand_name}}',
    heading: 'Verfahrensdokumentation fertig',
    body: 'Ihre Verfahrensdokumentation "<strong>{{project_name}}</strong>" ist fertiggestellt.',
    buttonText: 'Jetzt ansehen',
  },
  notification_new_tenant: {
    subject: 'Neuer Lizenznehmer – {{plattform}}',
    heading: 'Neuer Lizenznehmer',
    body: 'Neuer Lizenznehmer "<strong>{{tenant_name}}</strong>" hat sich registriert.',
    buttonText: 'Jetzt ansehen',
  },
};

export const adminCategories = [
  {
    label: 'Einladungen',
    templates: [
      { key: 'tenant_invite', label: 'Lizenznehmer-Einladung', icon: '🏢' },
      { key: 'client_invite', label: 'Kunden-Einladung', icon: '👤' },
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
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://gobd-suite.de/register?token=abc' },
  ],
  client_invite: [
    { key: '{{brand_name}}', desc: 'Kanzleiname', example: 'Kanzlei Mustermann' },
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://gobd-suite.de/client-register?token=abc' },
  ],
  team_invite: [
    { key: '{{role_name}}', desc: 'Rolle (Administrator/Mitarbeiter)', example: 'Mitarbeiter' },
    { key: '{{brand_name}}', desc: 'Kanzleiname', example: 'Kanzlei Mustermann' },
    { key: '{{link}}', desc: 'Registrierungslink', example: 'https://gobd-suite.de/register?token=abc' },
  ],
  password_reset: [
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Reset-Link', example: 'https://gobd-suite.de/set-password?token=abc' },
  ],
  notification_chapter_submitted: [
    { key: '{{client_name}}', desc: 'Mandantenname', example: 'Firma XYZ' },
    { key: '{{chapter_name}}', desc: 'Kapitelname', example: 'Kapitel 3: IT-Systeme' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Kapitel', example: 'https://gobd-suite.de/projects/1/chapters/3' },
  ],
  notification_chapter_approved: [
    { key: '{{chapter_name}}', desc: 'Kapitelname', example: 'Kapitel 3: IT-Systeme' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Kapitel', example: 'https://gobd-suite.de/client/projects/1/chapters/3' },
  ],
  notification_document_finalized: [
    { key: '{{project_name}}', desc: 'Projektname', example: 'VD Firma XYZ 2025' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zum Projekt', example: 'https://gobd-suite.de/client/projects/1' },
  ],
  notification_new_tenant: [
    { key: '{{tenant_name}}', desc: 'Name des neuen Lizenznehmers', example: 'Kanzlei Neu GmbH' },
    { key: '{{plattform}}', desc: 'Plattformname', example: 'GoBD-Suite' },
    { key: '{{brand_name}}', desc: 'Markenname', example: 'GoBD-Suite' },
    { key: '{{link}}', desc: 'Link zur Verwaltung', example: 'https://gobd-suite.de/admin/tenants' },
  ],
};
