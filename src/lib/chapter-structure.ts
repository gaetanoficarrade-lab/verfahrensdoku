/**
 * GoBD-konforme Kapitelstruktur mit 5 Hauptkapiteln und 30 Unterkapiteln.
 * Aktivierung wird über Onboarding-Variablen aus project_onboarding.answers gesteuert.
 */

import type { OnboardingAnswers } from './onboarding-variables';

export interface SubChapter {
  key: string;          // z.B. "1_1", "2_3"
  number: string;       // z.B. "1.1", "2.3"
  title: string;
  isActive: (a: OnboardingAnswers) => boolean;
  /** Negativvermerk wenn deaktiviert */
  inactiveText?: string;
}

export interface MainChapter {
  key: string;          // z.B. "1", "2"
  number: string;       // z.B. "1", "2"
  title: string;
  subChapters: SubChapter[];
}

const always = () => true;

export const GOBD_CHAPTERS: MainChapter[] = [
  // ── KAPITEL 1: Allgemeine Beschreibung ──
  {
    key: '1', number: '1', title: 'Allgemeine Beschreibung',
    subChapters: [
      { key: '1_1', number: '1.1', title: 'Unternehmensbeschreibung', isActive: always },
      { key: '1_2', number: '1.2', title: 'Organisatorischer Aufbau', isActive: always },
      { key: '1_3', number: '1.3', title: 'Zuständigkeiten & Verantwortlichkeiten', isActive: always },
      { key: '1_4', number: '1.4', title: 'Buchführungsgrundsätze', isActive: always },
      { key: '1_5', number: '1.5', title: 'Pflege der Verfahrensdokumentation', isActive: always },
    ],
  },

  // ── KAPITEL 2: Anwenderdokumentation ──
  {
    key: '2', number: '2', title: 'Anwenderdokumentation',
    subChapters: [
      {
        key: '2_1', number: '2.1', title: 'Rechnungsausgang / Debitoren',
        isActive: (a) => !!a.INVOICE_CREATION_TYPE && a.INVOICE_CREATION_TYPE !== 'none',
        inactiveText: 'Das Unternehmen erstellt keine eigenen Ausgangsrechnungen. Die Rechnungsstellung erfolgt nicht über interne Systeme, daher entfällt dieses Unterkapitel.',
      },
      {
        key: '2_2', number: '2.2', title: 'Rechnungseingang / Kreditoren',
        isActive: always,
      },
      {
        key: '2_3', number: '2.3', title: 'Kassenprozesse',
        isActive: (a) => !!a.HAS_CASH,
        inactiveText: 'Im Rahmen der Geschäftstätigkeit werden keine Bargeschäfte getätigt. Ein Kassensystem oder eine Registrierkasse wird nicht eingesetzt. Sämtliche Geschäftsvorfälle werden ausschließlich über den unbaren Zahlungsverkehr abgewickelt. Ein Kassenbuch wird daher nicht geführt. Die Dokumentationspflichten gemäß § 146 Abs. 1 AO für Kasseneinnahmen und -ausgaben entfallen entsprechend.',
      },
      {
        key: '2_4', number: '2.4', title: 'Zahlungsanbieter',
        isActive: (a) => !!a.USES_PAYMENT_PROVIDER,
        inactiveText: 'Im Rahmen der Geschäftstätigkeit werden keine externen Zahlungsdienstleister eingesetzt. Die Abwicklung aller Zahlungen erfolgt ausschließlich über das Geschäftskonto per Überweisung oder Lastschrift.',
      },
      {
        key: '2_5', number: '2.5', title: 'Marktplatz-/Plattformverkäufe',
        isActive: (a) => !!a.USES_MARKETPLACE,
        inactiveText: 'Das Unternehmen vertreibt keine Waren oder Dienstleistungen über Online-Marktplätze oder Plattformen. Dieses Unterkapitel entfällt.',
      },
      {
        key: '2_6', number: '2.6', title: 'Digitalisierung / Scanprozess',
        isActive: (a) => !!a.HAS_SCAN_PROCESS,
        inactiveText: 'Im Unternehmen fallen keine Papierbelege an, die digitalisiert werden müssen. Alle eingehenden Belege liegen bereits in digitaler Form vor.',
      },
      {
        key: '2_7', number: '2.7', title: 'Buchhaltungsverarbeitung',
        isActive: always,
      },
      {
        key: '2_8', number: '2.8', title: 'Zahlungsverkehr / Bank',
        isActive: (a) => !!a.HAS_BUSINESS_ACCOUNT || !!a.USES_ONLINE_BANKING,
        inactiveText: 'Das Unternehmen verfügt über kein gesondertes Geschäftskonto und nutzt kein Online-Banking. Der Zahlungsverkehr wird anderweitig abgewickelt. Eine Abstimmung von Bankkonten entfällt entsprechend.',
      },
      {
        key: '2_9', number: '2.9', title: 'Personal / Lohn',
        isActive: (a) => !!a.HAS_EMPLOYEES,
        inactiveText: 'Das Unternehmen beschäftigt keine Mitarbeiter. Sämtliche buchhalterischen und administrativen Tätigkeiten werden ausschließlich durch den Inhaber persönlich ausgeführt. Eine Lohn- und Gehaltsabrechnung wird nicht durchgeführt.',
      },
    ],
  },

  // ── KAPITEL 3: Technische Systemdokumentation ──
  {
    key: '3', number: '3', title: 'Technische Systemdokumentation',
    subChapters: [
      { key: '3_1', number: '3.1', title: 'Buchhaltungssoftware', isActive: always },
      { key: '3_2', number: '3.2', title: 'Schnittstellen', isActive: always },
      {
        key: '3_3', number: '3.3', title: 'E-Rechnungsprozesse',
        isActive: (a) => a.HAS_E_INVOICING === 'yes',
        inactiveText: 'Das Unternehmen empfängt und versendet derzeit keine elektronischen Rechnungen im Format ZUGFeRD oder XRechnung. Die Rechnungsstellung erfolgt ausschließlich im PDF-Format.',
      },
      {
        key: '3_4', number: '3.4', title: 'Cloud-Software / SaaS',
        isActive: (a) => a.USES_CLOUD === 'yes' || a.USES_CLOUD === 'partial',
        inactiveText: 'Das Unternehmen setzt keine cloudbasierten Softwarelösungen oder SaaS-Dienste ein. Alle Systeme werden lokal betrieben.',
      },
      {
        key: '3_5', number: '3.5', title: 'E-Mail-Systeme & Archivierung',
        isActive: always,
      },
      {
        key: '3_6', number: '3.6', title: 'Zahlungsplattformen',
        isActive: (a) => !!a.USES_PAYMENT_PROVIDER || !!a.USES_MARKETPLACE,
        inactiveText: 'Das Unternehmen nutzt keine Zahlungsplattformen oder Marktplätze. Dieses Unterkapitel entfällt.',
      },
    ],
  },

  // ── KAPITEL 4: Betriebsdokumentation ──
  {
    key: '4', number: '4', title: 'Betriebsdokumentation',
    subChapters: [
      { key: '4_1', number: '4.1', title: 'Datensicherung', isActive: always },
      { key: '4_2', number: '4.2', title: 'Wiederherstellung', isActive: always },
      { key: '4_3', number: '4.3', title: 'Systemänderungen & Updates', isActive: always },
      { key: '4_4', number: '4.4', title: 'Archivierung & Aufbewahrung', isActive: always },
      { key: '4_5', number: '4.5', title: 'Datenzugriff der Finanzverwaltung', isActive: always },
      { key: '4_6', number: '4.6', title: 'Änderungs- und Versionsmanagement', isActive: always },
      { key: '4_7', number: '4.7', title: 'Digitalisierung von Papierbelegen', isActive: always },
    ],
  },

  // ── KAPITEL 5: Internes Kontrollsystem ──
  {
    key: '5', number: '5', title: 'Internes Kontrollsystem',
    subChapters: [
      { key: '5_1', number: '5.1', title: 'Berechtigungen', isActive: always },
      { key: '5_2', number: '5.2', title: 'Freigaben', isActive: always },
      { key: '5_3', number: '5.3', title: 'Plausibilitätskontrollen', isActive: always },
      { key: '5_4', number: '5.4', title: 'Verantwortlichkeiten', isActive: always },
      { key: '5_5', number: '5.5', title: 'Umgang mit Fehlern', isActive: always },
    ],
  },
];

/** Flat list of all 30 subchapters */
export const ALL_SUB_CHAPTERS = GOBD_CHAPTERS.flatMap((ch) => ch.subChapters);

/** Build a map of chapter_key → title for all subchapters */
export const CHAPTER_TITLE_MAP: Record<string, string> = Object.fromEntries(
  ALL_SUB_CHAPTERS.map((sc) => [sc.key, `${sc.number} ${sc.title}`])
);

/** Get subchapters with their active/inactive state for given onboarding answers */
export function getSubChaptersWithState(answers: OnboardingAnswers) {
  return ALL_SUB_CHAPTERS.map((sc) => ({
    ...sc,
    active: sc.isActive(answers),
  }));
}
