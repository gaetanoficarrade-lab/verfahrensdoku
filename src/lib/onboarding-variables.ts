/**
 * Onboarding variable keys and the logic to derive which of the 30 subchapters
 * should be active based on the wizard answers.
 */

export interface OnboardingAnswers {
  // 1. Unternehmen
  company_name?: string;
  legal_form?: string;
  industry?: string;
  founding_year?: string;

  // 2. Beteiligte Personen
  HAS_EMPLOYEES?: boolean;
  HAS_TAX_ADVISOR?: boolean;
  ACCOUNTING_CONTACT?: string;

  // 3. Buchhaltung
  BOOKKEEPING_BY?: 'self' | 'tax_advisor' | 'shared';
  document_transfer_method?: string;

  // 4. Einnahmen & Rechnungen
  INVOICE_CREATION_TYPE?: string;
  HAS_CASH?: boolean;
  USES_PAYMENT_PROVIDER?: boolean;
  USES_MARKETPLACE?: boolean;
  HAS_E_INVOICING?: 'yes' | 'no' | 'unknown';

  // 5. Software & Systeme
  SOFTWARE_LIST?: string;
  USES_CLOUD?: 'yes' | 'no' | 'partial';

  // 6. Bank & Zahlungsverkehr
  HAS_BUSINESS_ACCOUNT?: boolean;
  USES_ONLINE_BANKING?: boolean;
  HAS_AUTO_BANK_IMPORT?: 'yes' | 'no' | 'unknown';

  // 7. Dokumente & Belege
  DOCUMENT_TYPE?: 'digital' | 'paper' | 'mixed';
  HAS_SCAN_PROCESS?: boolean;

  [key: string]: unknown;
}

export const LEGAL_FORMS = [
  'GmbH',
  'UG (haftungsbeschränkt)',
  'GbR',
  'Einzelunternehmen',
  'Freiberufler',
  'AG',
  'OHG',
  'KG',
  'GmbH & Co. KG',
  'PartG',
  'e.K.',
  'e.V.',
  'eG',
] as const;

export const ONBOARDING_SECTIONS = [
  { key: 'company', title: 'Unternehmen', description: 'Grundlegende Unternehmensdaten' },
  { key: 'people', title: 'Beteiligte Personen', description: 'Mitarbeiter, Berater und Ansprechpartner' },
  { key: 'accounting', title: 'Buchhaltung', description: 'Organisation der Buchführung' },
  { key: 'revenue', title: 'Einnahmen & Rechnungen', description: 'Rechnungsstellung und Zahlungswege' },
  { key: 'software', title: 'Software & Systeme', description: 'Eingesetzte Programme und IT' },
  { key: 'banking', title: 'Bank & Zahlungsverkehr', description: 'Konten und Bankanbindung' },
  { key: 'documents', title: 'Dokumente & Belege', description: 'Belegwesen und Archivierung' },
] as const;

/**
 * 30 subchapter definitions across the 5 main GoBD chapters.
 * Each has an `isActive` predicate that receives the onboarding answers.
 */
interface SubChapter {
  id: string;
  chapter: string;
  title: string;
  isActive: (a: OnboardingAnswers) => boolean;
}

const always = () => true;

export const SUB_CHAPTERS: SubChapter[] = [
  // ── general_info (Organisatorisches Umfeld) ──
  { id: 'gen_01', chapter: 'general_info', title: 'Unternehmensbeschreibung', isActive: always },
  { id: 'gen_02', chapter: 'general_info', title: 'Rechtsform & Branche', isActive: always },
  { id: 'gen_03', chapter: 'general_info', title: 'Organisationsstruktur', isActive: (a) => !!a.HAS_EMPLOYEES },
  { id: 'gen_04', chapter: 'general_info', title: 'Verantwortlichkeiten & Zuständigkeiten', isActive: always },
  { id: 'gen_05', chapter: 'general_info', title: 'Externe Dienstleister', isActive: (a) => !!a.HAS_TAX_ADVISOR },
  { id: 'gen_06', chapter: 'general_info', title: 'Steuerberater-Zusammenarbeit', isActive: (a) => !!a.HAS_TAX_ADVISOR },

  // ── it_systems (IT-Umfeld) ──
  { id: 'it_01', chapter: 'it_systems', title: 'Software-Übersicht', isActive: always },
  { id: 'it_02', chapter: 'it_systems', title: 'Cloud-Dienste', isActive: (a) => a.USES_CLOUD === 'yes' || a.USES_CLOUD === 'partial' },
  { id: 'it_03', chapter: 'it_systems', title: 'Zahlungsdienstleister', isActive: (a) => !!a.USES_PAYMENT_PROVIDER },
  { id: 'it_04', chapter: 'it_systems', title: 'Marktplatz-Anbindungen', isActive: (a) => !!a.USES_MARKETPLACE },
  { id: 'it_05', chapter: 'it_systems', title: 'E-Rechnungssysteme', isActive: (a) => a.HAS_E_INVOICING === 'yes' },
  { id: 'it_06', chapter: 'it_systems', title: 'Bankschnittstellen', isActive: (a) => a.HAS_AUTO_BANK_IMPORT === 'yes' },

  // ── processes (Geschäftsprozesse) ──
  { id: 'proc_01', chapter: 'processes', title: 'Rechnungseingang', isActive: always },
  { id: 'proc_02', chapter: 'processes', title: 'Rechnungsausgang', isActive: always },
  { id: 'proc_03', chapter: 'processes', title: 'Kassenbuchführung', isActive: (a) => !!a.HAS_CASH },
  { id: 'proc_04', chapter: 'processes', title: 'Zahlungsverkehr', isActive: always },
  { id: 'proc_05', chapter: 'processes', title: 'Bankkontenverwaltung', isActive: (a) => !!a.HAS_BUSINESS_ACCOUNT },
  { id: 'proc_06', chapter: 'processes', title: 'Lohn & Gehalt', isActive: (a) => !!a.HAS_EMPLOYEES },
  { id: 'proc_07', chapter: 'processes', title: 'Marktplatzprozesse', isActive: (a) => !!a.USES_MARKETPLACE },
  { id: 'proc_08', chapter: 'processes', title: 'E-Rechnungsprozesse', isActive: (a) => a.HAS_E_INVOICING === 'yes' },

  // ── archiving (Archivierung) ──
  { id: 'arch_01', chapter: 'archiving', title: 'Aufbewahrungsfristen', isActive: always },
  { id: 'arch_02', chapter: 'archiving', title: 'Digitale Archivierung', isActive: (a) => a.DOCUMENT_TYPE === 'digital' || a.DOCUMENT_TYPE === 'mixed' },
  { id: 'arch_03', chapter: 'archiving', title: 'Papierarchivierung', isActive: (a) => a.DOCUMENT_TYPE === 'paper' || a.DOCUMENT_TYPE === 'mixed' },
  { id: 'arch_04', chapter: 'archiving', title: 'Scanprozess & Ersetzend Scannen', isActive: (a) => !!a.HAS_SCAN_PROCESS },
  { id: 'arch_05', chapter: 'archiving', title: 'Zugriff & Lesbarkeit', isActive: always },
  { id: 'arch_06', chapter: 'archiving', title: 'Datensicherung', isActive: always },

  // ── controls (Internes Kontrollsystem) ──
  { id: 'iks_01', chapter: 'controls', title: 'Zugriffskontrollen', isActive: always },
  { id: 'iks_02', chapter: 'controls', title: 'Berechtigungskonzept', isActive: (a) => !!a.HAS_EMPLOYEES },
  { id: 'iks_03', chapter: 'controls', title: 'Plausibilitätsprüfungen', isActive: always },
  { id: 'iks_04', chapter: 'controls', title: 'Protokollierung & Nachvollziehbarkeit', isActive: always },
];

/**
 * Returns the list of active subchapter IDs based on onboarding answers.
 */
export function getActiveModulesFromVariables(answers: OnboardingAnswers): string[] {
  return SUB_CHAPTERS.filter((sc) => sc.isActive(answers)).map((sc) => sc.id);
}

/**
 * Returns active subchapters grouped by main chapter.
 */
export function getActiveModulesGrouped(answers: OnboardingAnswers) {
  const active = SUB_CHAPTERS.filter((sc) => sc.isActive(answers));
  const grouped: Record<string, SubChapter[]> = {};
  for (const sc of active) {
    if (!grouped[sc.chapter]) grouped[sc.chapter] = [];
    grouped[sc.chapter].push(sc);
  }
  return grouped;
}
