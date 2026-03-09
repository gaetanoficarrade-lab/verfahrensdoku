// Leitfragen für alle Unterkapitel der GoBD-Verfahrensdokumentation
// Überarbeitete Version mit verständlichen, praxisnahen Fragen
// Dynamische Steuerung über hideIf / prefillFrom basierend auf Onboarding-Variablen

import { OnboardingAnswers } from './onboarding-variables';

export interface Leitfrage {
  question: string;
  hideIf?: (variables: OnboardingAnswers) => boolean;
  prefillFrom?: (variables: OnboardingAnswers) => string;
}

export interface LeitfragenBlock {
  label: string;
  fragen: string[];
  /** New structured format with conditional logic */
  leitfragen?: Leitfrage[];
}

/** Helper: hide entire chapter when a flag is false */
const hideAll = (flag: keyof OnboardingAnswers, falseValue?: any) =>
  (v: OnboardingAnswers) => {
    if (falseValue !== undefined) return v[flag] === falseValue;
    return v[flag] === false;
  };

const hideIfNoEmployees = (v: OnboardingAnswers) => v.HAS_EMPLOYEES === false;
const hideIfNoCash = (v: OnboardingAnswers) => v.HAS_CASH === false;
const hideIfNoPaymentProvider = (v: OnboardingAnswers) => v.USES_PAYMENT_PROVIDER === false;
const hideIfNoMarketplace = (v: OnboardingAnswers) => v.USES_MARKETPLACE === false;
const hideIfNoScanProcess = (v: OnboardingAnswers) => v.HAS_SCAN_PROCESS === false;
const hideIfNoEInvoicing = (v: OnboardingAnswers) => v.HAS_E_INVOICING === 'no';
const hideIfNoCloud = (v: OnboardingAnswers) => v.USES_CLOUD === 'no';
const hideIfManualInvoice = (v: OnboardingAnswers) => v.INVOICE_CREATION_TYPE === 'manual';

export const CHAPTER_LEITFRAGEN_BLOCKS: Record<string, LeitfragenBlock[]> = {
  // ── KAPITEL 1: Allgemeine Beschreibung ──
  "1_1": [
    { label: "Frage 1", fragen: ["Was macht Ihr Unternehmen? Beschreiben Sie kurz womit Sie Geld verdienen."],
      leitfragen: [{ question: "Was macht Ihr Unternehmen? Beschreiben Sie kurz womit Sie Geld verdienen." }] },
    { label: "Frage 2", fragen: ["Wie läuft ein typischer Auftrag ab? Von der ersten Anfrage eines Kunden bis zur fertigen Rechnung."],
      leitfragen: [{ question: "Wie läuft ein typischer Auftrag ab? Von der ersten Anfrage eines Kunden bis zur fertigen Rechnung." }] },
    { label: "Frage 3", fragen: ["Welche Dokumente entstehen dabei? (z. B. Angebote, Verträge, Lieferscheine, Rechnungen)"],
      leitfragen: [{ question: "Welche Dokumente entstehen dabei? (z. B. Angebote, Verträge, Lieferscheine, Rechnungen)" }] },
    { label: "Frage 4", fragen: ["Wo bewahren Sie diese Dokumente auf und wie lange?"],
      leitfragen: [{ question: "Wo bewahren Sie diese Dokumente auf und wie lange?" }] },
    { label: "Frage 5", fragen: ["Welche Rechtsform hat Ihr Unternehmen (z. B. GmbH, UG, Einzelunternehmen) und seit wann gibt es es?"],
      leitfragen: [{ question: "Welche Rechtsform hat Ihr Unternehmen (z. B. GmbH, UG, Einzelunternehmen) und seit wann gibt es es?",
        prefillFrom: (v) => {
          const parts: string[] = [];
          if (v.legal_form) parts.push(`Rechtsform: ${v.legal_form}`);
          if (v.founding_year) parts.push(`Gründungsjahr: ${v.founding_year}`);
          return parts.join(', ');
        }
      }] },
  ],
  "1_2": [
    { label: "Frage 1", fragen: ["Wie viele Personen arbeiten in Ihrem Unternehmen und was sind ihre Aufgaben?"],
      leitfragen: [{ question: "Wie viele Personen arbeiten in Ihrem Unternehmen und was sind ihre Aufgaben?",
        hideIf: hideIfNoEmployees,
        prefillFrom: (v) => v.HAS_EMPLOYEES ? "Unternehmen hat Mitarbeiter" : ""
      }] },
    { label: "Frage 2", fragen: ["Wer ist für was zuständig? (z. B. Wer kümmert sich um Rechnungen, wer um IT, wer um Einkauf?)"],
      leitfragen: [{ question: "Wer ist für was zuständig? (z. B. Wer kümmert sich um Rechnungen, wer um IT, wer um Einkauf?)" }] },
    { label: "Frage 3", fragen: ["Gibt es eine schriftliche Übersicht wer welche Aufgaben hat? Wenn ja, wo liegt diese?"],
      leitfragen: [{ question: "Gibt es eine schriftliche Übersicht wer welche Aufgaben hat? Wenn ja, wo liegt diese?" }] },
    { label: "Frage 4", fragen: ["Wo ist festgehalten wer im Unternehmen welche Rolle hat?"],
      leitfragen: [{ question: "Wo ist festgehalten wer im Unternehmen welche Rolle hat?" }] },
    { label: "Frage 5", fragen: ["Wie oft prüfen Sie ob diese Aufgabenverteilung noch aktuell ist?"],
      leitfragen: [{ question: "Wie oft prüfen Sie ob diese Aufgabenverteilung noch aktuell ist?" }] },
  ],
  "1_3": [
    { label: "Frage 1", fragen: ["Wer ist in Ihrem Unternehmen für die Buchhaltung verantwortlich? (Name und Position)"],
      leitfragen: [{ question: "Wer ist in Ihrem Unternehmen für die Buchhaltung verantwortlich? (Name und Position)" }] },
    { label: "Frage 2", fragen: ["Wer übernimmt die Buchhaltungsaufgaben wenn diese Person krank oder im Urlaub ist?"],
      leitfragen: [{ question: "Wer übernimmt die Buchhaltungsaufgaben wenn diese Person krank oder im Urlaub ist?",
        hideIf: hideIfNoEmployees
      }] },
    { label: "Frage 3", fragen: ["Wer darf auf Ihre Buchhaltungssoftware, Ihr Online-Banking und Ihre Steuerdaten zugreifen?"],
      leitfragen: [{ question: "Wer darf auf Ihre Buchhaltungssoftware, Ihr Online-Banking und Ihre Steuerdaten zugreifen?",
        prefillFrom: (v) => v.INVOICE_CREATION_TYPE ? `Buchhaltungssoftware: ${v.INVOICE_CREATION_TYPE}` : ""
      }] },
    { label: "Frage 4", fragen: ["Wo ist schriftlich festgehalten wer welche Zugriffsrechte hat?"],
      leitfragen: [{ question: "Wo ist schriftlich festgehalten wer welche Zugriffsrechte hat?" }] },
    { label: "Frage 5", fragen: ["Wer ist der Ansprechpartner für Ihren Steuerberater?"],
      leitfragen: [{ question: "Wer ist der Ansprechpartner für Ihren Steuerberater?" }] },
  ],
  "1_4": [
    { label: "Frage 1", fragen: ["Wann stellen Sie Ihren Kunden Rechnungen? Sofort nach der Leistung oder erst wenn Sie bezahlt werden? (Das bestimmt ob Sie Soll- oder Ist-Versteuerung nutzen)"],
      leitfragen: [{ question: "Wann stellen Sie Ihren Kunden Rechnungen? Sofort nach der Leistung oder erst wenn Sie bezahlt werden? (Das bestimmt ob Sie Soll- oder Ist-Versteuerung nutzen)" }] },
    { label: "Frage 2", fragen: ["Führen Sie die Buchhaltung selbst oder macht das Ihr Steuerberater?"],
      leitfragen: [{ question: "Führen Sie die Buchhaltung selbst oder macht das Ihr Steuerberater?",
        prefillFrom: (v) => {
          if (v.BOOKKEEPING_BY === 'self') return "Buchhaltung wird selbst geführt";
          if (v.BOOKKEEPING_BY === 'tax_advisor') return "Buchhaltung wird vom Steuerberater erledigt";
          if (v.BOOKKEEPING_BY === 'shared') return "Buchhaltung wird gemeinsam mit dem Steuerberater erledigt";
          return "";
        }
      }] },
    { label: "Frage 3", fragen: ["Welche Software nutzen Sie für die Buchhaltung? (z. B. DATEV, Lexoffice, sevDesk)"],
      leitfragen: [{ question: "Welche Software nutzen Sie für die Buchhaltung? (z. B. DATEV, Lexoffice, sevDesk)",
        prefillFrom: (v) => v.INVOICE_CREATION_TYPE && v.INVOICE_CREATION_TYPE !== 'manual' ? `Software: ${v.INVOICE_CREATION_TYPE}` : ""
      }] },
    { label: "Frage 4", fragen: ["Wie oft werden Belege an den Steuerberater übergeben? (täglich, wöchentlich, monatlich)"],
      leitfragen: [{ question: "Wie oft werden Belege an den Steuerberater übergeben? (täglich, wöchentlich, monatlich)" }] },
    { label: "Frage 5", fragen: ["Was passiert wenn eine Buchung falsch ist? Wie wird das korrigiert?"],
      leitfragen: [{ question: "Was passiert wenn eine Buchung falsch ist? Wie wird das korrigiert?" }] },
  ],
  "1_5": [
    { label: "Frage 1", fragen: ["Wer ist dafür verantwortlich dass dieses Dokument aktuell bleibt?"],
      leitfragen: [{ question: "Wer ist dafür verantwortlich dass dieses Dokument aktuell bleibt?" }] },
    { label: "Frage 2", fragen: ["Wie oft wird dieses Dokument überprüft und aktualisiert? (z. B. einmal pro Jahr)"],
      leitfragen: [{ question: "Wie oft wird dieses Dokument überprüft und aktualisiert? (z. B. einmal pro Jahr)" }] },
    { label: "Frage 3", fragen: ["In welchen Situationen muss dieses Dokument sofort aktualisiert werden? (z. B. neue Software, neue Mitarbeiter)"],
      leitfragen: [{ question: "In welchen Situationen muss dieses Dokument sofort aktualisiert werden? (z. B. neue Software, neue Mitarbeiter)" }] },
    { label: "Frage 4", fragen: ["Wo wird dieses Dokument aufbewahrt?"],
      leitfragen: [{ question: "Wo wird dieses Dokument aufbewahrt?" }] },
    { label: "Frage 5", fragen: ["Werden alte Versionen dieses Dokuments aufbewahrt? Wo?"],
      leitfragen: [{ question: "Werden alte Versionen dieses Dokuments aufbewahrt? Wo?" }] },
  ],

  // ── KAPITEL 2: Anwenderdokumentation ──
  "2_1": [
    { label: "Frage 1", fragen: ["Welche Software nutzen Sie um Rechnungen zu schreiben? (z. B. Lexoffice, sevDesk, Word)"],
      leitfragen: [{ question: "Welche Software nutzen Sie um Rechnungen zu schreiben? (z. B. Lexoffice, sevDesk, Word)",
        prefillFrom: (v) => v.INVOICE_CREATION_TYPE ? `Software: ${v.INVOICE_CREATION_TYPE}` : ""
      }] },
    { label: "Frage 2", fragen: ["Wie werden Rechnungsnummern vergeben? (automatisch durch die Software oder manuell)"],
      leitfragen: [{ question: "Wie werden Rechnungsnummern vergeben? (automatisch durch die Software oder manuell)" }] },
    { label: "Frage 3", fragen: ["Wie versenden Sie Rechnungen an Ihre Kunden? (per E-Mail als PDF, per Post, über ein Portal)"],
      leitfragen: [{ question: "Wie versenden Sie Rechnungen an Ihre Kunden? (per E-Mail als PDF, per Post, über ein Portal)" }] },
    { label: "Frage 4", fragen: ["Wo werden Ihre ausgestellten Rechnungen gespeichert und wie lange?"],
      leitfragen: [{ question: "Wo werden Ihre ausgestellten Rechnungen gespeichert und wie lange?" }] },
    { label: "Frage 5", fragen: ["Was machen Sie wenn eine Rechnung falsch war und korrigiert werden muss?"],
      leitfragen: [{ question: "Was machen Sie wenn eine Rechnung falsch war und korrigiert werden muss?" }] },
  ],
  "2_2": [
    { label: "Frage 1", fragen: ["Wie erhalten Sie Rechnungen von Ihren Lieferanten? (per E-Mail, per Post, über ein Online-Portal)"],
      leitfragen: [{ question: "Wie erhalten Sie Rechnungen von Ihren Lieferanten? (per E-Mail, per Post, über ein Online-Portal)" }] },
    { label: "Frage 2", fragen: ["Was passiert wenn eine Rechnung ankommt? Wer prüft sie und wer gibt sie frei?"],
      leitfragen: [{ question: "Was passiert wenn eine Rechnung ankommt? Wer prüft sie und wer gibt sie frei?" }] },
    { label: "Frage 3", fragen: ["Wie dokumentieren Sie dass eine Rechnung geprüft und freigegeben wurde?"],
      leitfragen: [{ question: "Wie dokumentieren Sie dass eine Rechnung geprüft und freigegeben wurde?" }] },
    { label: "Frage 4", fragen: ["Wo werden Ihre Eingangsrechnungen abgelegt? (Ordner, Cloud, Buchhaltungssoftware)"],
      leitfragen: [{ question: "Wo werden Ihre Eingangsrechnungen abgelegt? (Ordner, Cloud, Buchhaltungssoftware)" }] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn Sie eine Rechnung erhalten die Sie nicht nachvollziehen können oder die falsch ist?"],
      leitfragen: [{ question: "Was tun Sie wenn Sie eine Rechnung erhalten die Sie nicht nachvollziehen können oder die falsch ist?" }] },
  ],
  "2_3": [
    { label: "Frage 1", fragen: ["Welches Kassensystem nutzen Sie? (Name und Modell des Geräts oder der Software)"],
      leitfragen: [{ question: "Welches Kassensystem nutzen Sie? (Name und Modell des Geräts oder der Software)", hideIf: hideIfNoCash }] },
    { label: "Frage 2", fragen: ["Wie läuft ein Kassiervorgang bei Ihnen ab?"],
      leitfragen: [{ question: "Wie läuft ein Kassiervorgang bei Ihnen ab?", hideIf: hideIfNoCash }] },
    { label: "Frage 3", fragen: ["Wie machen Sie den Tagesabschluss an der Kasse und wo werden die Tagesberichte gespeichert?"],
      leitfragen: [{ question: "Wie machen Sie den Tagesabschluss an der Kasse und wo werden die Tagesberichte gespeichert?", hideIf: hideIfNoCash }] },
    { label: "Frage 4", fragen: ["Wie gelangen die Kassendaten in Ihre Buchhaltung?"],
      leitfragen: [{ question: "Wie gelangen die Kassendaten in Ihre Buchhaltung?", hideIf: hideIfNoCash }] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn die Kasse nicht stimmt - also wenn mehr oder weniger Geld in der Kasse ist als sie sein sollte?"],
      leitfragen: [{ question: "Was tun Sie wenn die Kasse nicht stimmt - also wenn mehr oder weniger Geld in der Kasse ist als sie sein sollte?", hideIf: hideIfNoCash }] },
  ],
  "2_4": [
    { label: "Frage 1", fragen: ["Welche Zahlungsdienste nutzen Sie? (z. B. PayPal, Stripe, Klarna, SumUp)"],
      leitfragen: [{ question: "Welche Zahlungsdienste nutzen Sie? (z. B. PayPal, Stripe, Klarna, SumUp)", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 2", fragen: ["Wie werden Zahlungseingänge über diese Dienste in Ihrer Buchhaltung erfasst?"],
      leitfragen: [{ question: "Wie werden Zahlungseingänge über diese Dienste in Ihrer Buchhaltung erfasst?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass keine Zahlung vergessen wird?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass keine Zahlung vergessen wird?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 4", fragen: ["Wo werden die Abrechnungen und Belege dieser Zahlungsdienste gespeichert?"],
      leitfragen: [{ question: "Wo werden die Abrechnungen und Belege dieser Zahlungsdienste gespeichert?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 5", fragen: ["Was passiert wenn ein Kunde eine Zahlung zurückbucht (Chargeback)?"],
      leitfragen: [{ question: "Was passiert wenn ein Kunde eine Zahlung zurückbucht (Chargeback)?", hideIf: hideIfNoPaymentProvider }] },
  ],
  "2_5": [
    { label: "Frage 1", fragen: ["Über welche Plattformen verkaufen Sie? (z. B. Amazon, eBay, Etsy, eigener Onlineshop)"],
      leitfragen: [{ question: "Über welche Plattformen verkaufen Sie? (z. B. Amazon, eBay, Etsy, eigener Onlineshop)", hideIf: hideIfNoMarketplace }] },
    { label: "Frage 2", fragen: ["Wie werden Ihre Verkäufe von der Plattform in Ihre Buchhaltung übernommen?"],
      leitfragen: [{ question: "Wie werden Ihre Verkäufe von der Plattform in Ihre Buchhaltung übernommen?", hideIf: hideIfNoMarketplace }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass alle Umsätze vollständig erfasst sind?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass alle Umsätze vollständig erfasst sind?", hideIf: hideIfNoMarketplace }] },
    { label: "Frage 4", fragen: ["Wo werden die monatlichen Abrechnungen der Plattformen gespeichert?"],
      leitfragen: [{ question: "Wo werden die monatlichen Abrechnungen der Plattformen gespeichert?", hideIf: hideIfNoMarketplace }] },
    { label: "Frage 5", fragen: ["Wie behandeln Sie Retouren und Erstattungen buchhalterisch?"],
      leitfragen: [{ question: "Wie behandeln Sie Retouren und Erstattungen buchhalterisch?", hideIf: hideIfNoMarketplace }] },
  ],
  "2_6": [
    { label: "Frage 1", fragen: ["Welche Dokumente erhalten Sie noch auf Papier und müssen daher eingescannt werden?"],
      leitfragen: [{ question: "Welche Dokumente erhalten Sie noch auf Papier und müssen daher eingescannt werden?", hideIf: hideIfNoScanProcess }] },
    { label: "Frage 2", fragen: ["Womit scannen Sie diese Dokumente? (z. B. Smartphone-App, Scanner, Multifunktionsdrucker)"],
      leitfragen: [{ question: "Womit scannen Sie diese Dokumente? (z. B. Smartphone-App, Scanner, Multifunktionsdrucker)", hideIf: hideIfNoScanProcess }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass der Scan gut lesbar ist und dem Original entspricht?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass der Scan gut lesbar ist und dem Original entspricht?", hideIf: hideIfNoScanProcess }] },
    { label: "Frage 4", fragen: ["Was passiert mit dem Papieroriginal nachdem es eingescannt wurde? Wird es aufbewahrt oder vernichtet?"],
      leitfragen: [{ question: "Was passiert mit dem Papieroriginal nachdem es eingescannt wurde? Wird es aufbewahrt oder vernichtet?", hideIf: hideIfNoScanProcess }] },
    { label: "Frage 5", fragen: ["Gibt es eine interne Regel wie Dokumente gescannt und benannt werden müssen?"],
      leitfragen: [{ question: "Gibt es eine interne Regel wie Dokumente gescannt und benannt werden müssen?", hideIf: hideIfNoScanProcess }] },
  ],
  "2_7": [
    { label: "Frage 1", fragen: ["Wie gelangen Belege in Ihre Buchhaltung? (werden sie manuell eingetragen oder automatisch importiert)"],
      leitfragen: [{ question: "Wie gelangen Belege in Ihre Buchhaltung? (werden sie manuell eingetragen oder automatisch importiert)" }] },
    { label: "Frage 2", fragen: ["Wer bucht die Geschäftsvorfälle und wie oft? (täglich, wöchentlich, monatlich)"],
      leitfragen: [{ question: "Wer bucht die Geschäftsvorfälle und wie oft? (täglich, wöchentlich, monatlich)" }] },
    { label: "Frage 3", fragen: ["Wie wird kontrolliert ob Buchungen korrekt sind?"],
      leitfragen: [{ question: "Wie wird kontrolliert ob Buchungen korrekt sind?" }] },
    { label: "Frage 4", fragen: ["Wo werden Buchungsbelege und Journale aufbewahrt?"],
      leitfragen: [{ question: "Wo werden Buchungsbelege und Journale aufbewahrt?" }] },
    { label: "Frage 5", fragen: ["Wie werden regelmäßige Ausgaben behandelt die jeden Monat gleich sind? (z. B. Miete, Versicherungen)"],
      leitfragen: [{ question: "Wie werden regelmäßige Ausgaben behandelt die jeden Monat gleich sind? (z. B. Miete, Versicherungen)",
        prefillFrom: (v) => v.INVOICE_CREATION_TYPE ? `Buchhaltungssoftware: ${v.INVOICE_CREATION_TYPE}` : ""
      }] },
  ],
  "2_8": [
    { label: "Frage 1", fragen: ["Wie viele Geschäftskonten haben Sie und bei welcher Bank?"],
      leitfragen: [{ question: "Wie viele Geschäftskonten haben Sie und bei welcher Bank?",
        prefillFrom: (v) => {
          const parts: string[] = [];
          if (v.HAS_BUSINESS_ACCOUNT) parts.push("Geschäftskonto vorhanden");
          if (v.USES_ONLINE_BANKING) parts.push("Online-Banking wird genutzt");
          return parts.join(', ');
        }
      }] },
    { label: "Frage 2", fragen: ["Wie rufen Sie Ihre Kontoauszüge ab? (Online-Banking, automatischer Import in Buchhaltungssoftware)"],
      leitfragen: [{ question: "Wie rufen Sie Ihre Kontoauszüge ab? (Online-Banking, automatischer Import in Buchhaltungssoftware)",
        hideIf: (v) => v.USES_ONLINE_BANKING === false,
        prefillFrom: (v) => v.USES_ONLINE_BANKING ? "Online-Banking wird genutzt" : ""
      }] },
    { label: "Frage 3", fragen: ["Wie werden Zahlungseingänge und -ausgänge den richtigen Rechnungen zugeordnet?"],
      leitfragen: [{ question: "Wie werden Zahlungseingänge und -ausgänge den richtigen Rechnungen zugeordnet?" }] },
    { label: "Frage 4", fragen: ["Wo werden Kontoauszüge und Zahlungsbelege archiviert?"],
      leitfragen: [{ question: "Wo werden Kontoauszüge und Zahlungsbelege archiviert?" }] },
    { label: "Frage 5", fragen: ["Wie behalten Sie den Überblick über offene Rechnungen die noch nicht bezahlt wurden?"],
      leitfragen: [{ question: "Wie behalten Sie den Überblick über offene Rechnungen die noch nicht bezahlt wurden?" }] },
  ],
  "2_9": [
    { label: "Frage 1", fragen: ["Wie viele Mitarbeiter haben Sie und in welchen Beschäftigungsformen? (Vollzeit, Teilzeit, Minijob)"],
      leitfragen: [{ question: "Wie viele Mitarbeiter haben Sie und in welchen Beschäftigungsformen? (Vollzeit, Teilzeit, Minijob)", hideIf: hideIfNoEmployees }] },
    { label: "Frage 2", fragen: ["Wer erstellt die Lohn- und Gehaltsabrechnungen? (intern oder externer Dienstleister)"],
      leitfragen: [{ question: "Wer erstellt die Lohn- und Gehaltsabrechnungen? (intern oder externer Dienstleister)", hideIf: hideIfNoEmployees }] },
    { label: "Frage 3", fragen: ["Welche Software wird für die Lohnabrechnung genutzt?"],
      leitfragen: [{ question: "Welche Software wird für die Lohnabrechnung genutzt?", hideIf: hideIfNoEmployees }] },
    { label: "Frage 4", fragen: ["Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt?"],
      leitfragen: [{ question: "Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt?", hideIf: hideIfNoEmployees }] },
    { label: "Frage 5", fragen: ["Wie werden Spesen und Reisekosten der Mitarbeiter abgerechnet?"],
      leitfragen: [{ question: "Wie werden Spesen und Reisekosten der Mitarbeiter abgerechnet?", hideIf: hideIfNoEmployees }] },
  ],

  // ── KAPITEL 3: Technische Systemdokumentation ──
  "3_1": [
    { label: "Frage 1", fragen: ["Welche Buchhaltungssoftware nutzen Sie? (Name und aktuelle Version)"],
      leitfragen: [{ question: "Welche Buchhaltungssoftware nutzen Sie? (Name und aktuelle Version)",
        prefillFrom: (v) => v.INVOICE_CREATION_TYPE && v.INVOICE_CREATION_TYPE !== 'manual' ? `Software: ${v.INVOICE_CREATION_TYPE}` : ""
      }] },
    { label: "Frage 2", fragen: ["Wer hat Zugriff auf die Software und welche Rechte haben die einzelnen Personen?"],
      leitfragen: [{ question: "Wer hat Zugriff auf die Software und welche Rechte haben die einzelnen Personen?" }] },
    { label: "Frage 3", fragen: ["Wie werden Updates der Software durchgeführt und von wem?"],
      leitfragen: [{ question: "Wie werden Updates der Software durchgeführt und von wem?" }] },
    { label: "Frage 4", fragen: ["Wo sind die Lizenzdaten und Zugangsdaten der Software sicher hinterlegt?"],
      leitfragen: [{ question: "Wo sind die Lizenzdaten und Zugangsdaten der Software sicher hinterlegt?" }] },
    { label: "Frage 5", fragen: ["An wen wenden Sie sich wenn die Software nicht funktioniert?"],
      leitfragen: [{ question: "An wen wenden Sie sich wenn die Software nicht funktioniert?" }] },
  ],
  "3_2": [
    { label: "Frage 1", fragen: ["Welche Programme tauschen bei Ihnen automatisch Daten aus? (z. B. Onlineshop → Buchhaltung, Kasse → DATEV)"],
      leitfragen: [{ question: "Welche Programme tauschen bei Ihnen automatisch Daten aus? (z. B. Onlineshop → Buchhaltung, Kasse → DATEV)", hideIf: hideIfManualInvoice }] },
    { label: "Frage 2", fragen: ["Wie werden diese Daten übertragen? (automatisch im Hintergrund oder müssen Sie selbst einen Export/Import anstoßen)"],
      leitfragen: [{ question: "Wie werden diese Daten übertragen? (automatisch im Hintergrund oder müssen Sie selbst einen Export/Import anstoßen)", hideIf: hideIfManualInvoice }] },
    { label: "Frage 3", fragen: ["Wie merken Sie wenn bei einer Datenübertragung etwas schiefgelaufen ist?"],
      leitfragen: [{ question: "Wie merken Sie wenn bei einer Datenübertragung etwas schiefgelaufen ist?", hideIf: hideIfManualInvoice }] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wie diese Verbindungen zwischen den Programmen eingerichtet sind?"],
      leitfragen: [{ question: "Wo ist dokumentiert wie diese Verbindungen zwischen den Programmen eingerichtet sind?", hideIf: hideIfManualInvoice }] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn eine Übertragung fehlschlägt?"],
      leitfragen: [{ question: "Was tun Sie wenn eine Übertragung fehlschlägt?", hideIf: hideIfManualInvoice }] },
  ],
  "3_3": [
    { label: "Frage 1", fragen: ["Versenden oder empfangen Sie elektronische Rechnungen in einem strukturierten Format? (z. B. XRechnung, ZUGFeRD - das sind Rechnungen die maschinenlesbare Daten enthalten)"],
      leitfragen: [{ question: "Versenden oder empfangen Sie elektronische Rechnungen in einem strukturierten Format? (z. B. XRechnung, ZUGFeRD - das sind Rechnungen die maschinenlesbare Daten enthalten)", hideIf: hideIfNoEInvoicing }] },
    { label: "Frage 2", fragen: ["Welche Software nutzen Sie dafür?"],
      leitfragen: [{ question: "Welche Software nutzen Sie dafür?", hideIf: hideIfNoEInvoicing }] },
    { label: "Frage 3", fragen: ["Wie wird geprüft ob eine empfangene E-Rechnung korrekt und vollständig ist?"],
      leitfragen: [{ question: "Wie wird geprüft ob eine empfangene E-Rechnung korrekt und vollständig ist?", hideIf: hideIfNoEInvoicing }] },
    { label: "Frage 4", fragen: ["Wo werden E-Rechnungen im Originalformat gespeichert? (sie dürfen nicht in ein anderes Format umgewandelt werden)"],
      leitfragen: [{ question: "Wo werden E-Rechnungen im Originalformat gespeichert? (sie dürfen nicht in ein anderes Format umgewandelt werden)", hideIf: hideIfNoEInvoicing }] },
    { label: "Frage 5", fragen: ["Was passiert wenn eine E-Rechnung fehlerhaft ist?"],
      leitfragen: [{ question: "Was passiert wenn eine E-Rechnung fehlerhaft ist?", hideIf: hideIfNoEInvoicing }] },
  ],
  "3_4": [
    { label: "Frage 1", fragen: ["Welche Online-Programme nutzen Sie für steuerrelevante Daten? (z. B. Google Drive, Dropbox, OneDrive, Cloud-Buchhaltung)"],
      leitfragen: [{ question: "Welche Online-Programme nutzen Sie für steuerrelevante Daten? (z. B. Google Drive, Dropbox, OneDrive, Cloud-Buchhaltung)", hideIf: hideIfNoCloud }] },
    { label: "Frage 2", fragen: ["Wer hat Zugriff auf diese Programme und wie ist der Zugang gesichert? (z. B. Passwort + SMS-Code)"],
      leitfragen: [{ question: "Wer hat Zugriff auf diese Programme und wie ist der Zugang gesichert? (z. B. Passwort + SMS-Code)", hideIf: hideIfNoCloud }] },
    { label: "Frage 3", fragen: ["Wo werden Ihre Daten bei diesen Anbietern gespeichert? (möglichst in Deutschland oder der EU)"],
      leitfragen: [{ question: "Wo werden Ihre Daten bei diesen Anbietern gespeichert? (möglichst in Deutschland oder der EU)", hideIf: hideIfNoCloud }] },
    { label: "Frage 4", fragen: ["Was passiert mit Ihren Daten wenn Sie den Anbieter wechseln oder kündigen?"],
      leitfragen: [{ question: "Was passiert mit Ihren Daten wenn Sie den Anbieter wechseln oder kündigen?", hideIf: hideIfNoCloud }] },
    { label: "Frage 5", fragen: ["Haben Sie mit diesen Anbietern einen Vertrag zum Datenschutz abgeschlossen? (Auftragsverarbeitungsvertrag)"],
      leitfragen: [{ question: "Haben Sie mit diesen Anbietern einen Vertrag zum Datenschutz abgeschlossen? (Auftragsverarbeitungsvertrag)", hideIf: hideIfNoCloud }] },
  ],
  "3_5": [
    { label: "Frage 1", fragen: ["Welches E-Mail-Programm nutzen Sie geschäftlich? (z. B. Outlook, Gmail, Apple Mail)"],
      leitfragen: [{ question: "Welches E-Mail-Programm nutzen Sie geschäftlich? (z. B. Outlook, Gmail, Apple Mail)" }] },
    { label: "Frage 2", fragen: ["Wie gehen Sie mit Rechnungen und Verträgen um die per E-Mail ankommen?"],
      leitfragen: [{ question: "Wie gehen Sie mit Rechnungen und Verträgen um die per E-Mail ankommen?" }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass wichtige geschäftliche E-Mails nicht verloren gehen und für 10 Jahre abrufbar sind?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass wichtige geschäftliche E-Mails nicht verloren gehen und für 10 Jahre abrufbar sind?" }] },
    { label: "Frage 4", fragen: ["Wo werden archivierte E-Mails gespeichert?"],
      leitfragen: [{ question: "Wo werden archivierte E-Mails gespeichert?" }] },
    { label: "Frage 5", fragen: ["Wie wird verhindert dass archivierte E-Mails nachträglich verändert oder gelöscht werden können?"],
      leitfragen: [{ question: "Wie wird verhindert dass archivierte E-Mails nachträglich verändert oder gelöscht werden können?" }] },
  ],
  "3_6": [
    { label: "Frage 1", fragen: ["Welche Zahlungsplattformen sind technisch in Ihre Systeme eingebunden? (z. B. PayPal-API, Stripe-Integration)"],
      leitfragen: [{ question: "Welche Zahlungsplattformen sind technisch in Ihre Systeme eingebunden? (z. B. PayPal-API, Stripe-Integration)", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 2", fragen: ["Wie werden Transaktionsdaten von diesen Plattformen automatisch in Ihre Buchhaltung übernommen?"],
      leitfragen: [{ question: "Wie werden Transaktionsdaten von diesen Plattformen automatisch in Ihre Buchhaltung übernommen?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass alle Transaktionen vollständig und korrekt übertragen wurden?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass alle Transaktionen vollständig und korrekt übertragen wurden?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 4", fragen: ["Wo werden die technischen Protokolle und Transaktionsaufzeichnungen gespeichert?"],
      leitfragen: [{ question: "Wo werden die technischen Protokolle und Transaktionsaufzeichnungen gespeichert?", hideIf: hideIfNoPaymentProvider }] },
    { label: "Frage 5", fragen: ["Wie erkennen Sie wenn Daten zwischen der Plattform und Ihrer Buchhaltung nicht übereinstimmen?"],
      leitfragen: [{ question: "Wie erkennen Sie wenn Daten zwischen der Plattform und Ihrer Buchhaltung nicht übereinstimmen?", hideIf: hideIfNoPaymentProvider }] },
  ],

  // ── KAPITEL 4: Betriebsdokumentation ──
  "4_1": [
    { label: "Frage 1", fragen: ["Wie oft werden Ihre geschäftlichen Daten gesichert? (täglich, wöchentlich)"],
      leitfragen: [{ question: "Wie oft werden Ihre geschäftlichen Daten gesichert? (täglich, wöchentlich)" }] },
    { label: "Frage 2", fragen: ["Was genau wird gesichert? (Buchhaltungsdaten, E-Mails, Dokumente)"],
      leitfragen: [{ question: "Was genau wird gesichert? (Buchhaltungsdaten, E-Mails, Dokumente)" }] },
    { label: "Frage 3", fragen: ["Wer ist dafür verantwortlich dass die Datensicherung regelmäßig durchgeführt wird?"],
      leitfragen: [{ question: "Wer ist dafür verantwortlich dass die Datensicherung regelmäßig durchgeführt wird?" }] },
    { label: "Frage 4", fragen: ["Wo werden die Sicherungskopien aufbewahrt? (externe Festplatte, Cloud, zweiter Standort)"],
      leitfragen: [{ question: "Wo werden die Sicherungskopien aufbewahrt? (externe Festplatte, Cloud, zweiter Standort)" }] },
    { label: "Frage 5", fragen: ["Werden die Sicherungen regelmäßig getestet ob sie im Notfall auch wirklich funktionieren?"],
      leitfragen: [{ question: "Werden die Sicherungen regelmäßig getestet ob sie im Notfall auch wirklich funktionieren?" }] },
  ],
  "4_2": [
    { label: "Frage 1", fragen: ["Was würden Sie tun wenn Ihr Computer oder Server komplett ausfällt? Haben Sie einen Plan?"],
      leitfragen: [{ question: "Was würden Sie tun wenn Ihr Computer oder Server komplett ausfällt? Haben Sie einen Plan?" }] },
    { label: "Frage 2", fragen: ["Wie lange würde es dauern bis Ihr Betrieb nach einem Totalausfall wieder läuft?"],
      leitfragen: [{ question: "Wie lange würde es dauern bis Ihr Betrieb nach einem Totalausfall wieder läuft?" }] },
    { label: "Frage 3", fragen: ["Wer ist verantwortlich wenn Daten wiederhergestellt werden müssen?"],
      leitfragen: [{ question: "Wer ist verantwortlich wenn Daten wiederhergestellt werden müssen?" }] },
    { label: "Frage 4", fragen: ["Wo ist beschrieben wie die Datenwiederherstellung Schritt für Schritt funktioniert?"],
      leitfragen: [{ question: "Wo ist beschrieben wie die Datenwiederherstellung Schritt für Schritt funktioniert?" }] },
    { label: "Frage 5", fragen: ["Haben Sie die Wiederherstellung schon einmal probeweise getestet?"],
      leitfragen: [{ question: "Haben Sie die Wiederherstellung schon einmal probeweise getestet?" }] },
  ],
  "4_3": [
    { label: "Frage 1", fragen: ["Wie werden Updates Ihrer Programme durchgeführt? (automatisch oder manuell)"],
      leitfragen: [{ question: "Wie werden Updates Ihrer Programme durchgeführt? (automatisch oder manuell)" }] },
    { label: "Frage 2", fragen: ["Wer entscheidet wann ein größeres Update oder ein Programm-Wechsel durchgeführt wird?"],
      leitfragen: [{ question: "Wer entscheidet wann ein größeres Update oder ein Programm-Wechsel durchgeführt wird?" }] },
    { label: "Frage 3", fragen: ["Wie dokumentieren Sie welche Programme in welcher Version eingesetzt werden?"],
      leitfragen: [{ question: "Wie dokumentieren Sie welche Programme in welcher Version eingesetzt werden?" }] },
    { label: "Frage 4", fragen: ["Wie stellen Sie sicher dass nach einem Update alle Daten noch korrekt sind?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass nach einem Update alle Daten noch korrekt sind?" }] },
    { label: "Frage 5", fragen: ["Testen Sie größere Updates zuerst bevor Sie sie produktiv einsetzen?"],
      leitfragen: [{ question: "Testen Sie größere Updates zuerst bevor Sie sie produktiv einsetzen?" }] },
  ],
  "4_4": [
    { label: "Frage 1", fragen: ["Wissen Sie welche Unterlagen Sie wie lange aufbewahren müssen? (Rechnungen 10 Jahre, Geschäftsbriefe 6 Jahre)"],
      leitfragen: [{ question: "Wissen Sie welche Unterlagen Sie wie lange aufbewahren müssen? (Rechnungen 10 Jahre, Geschäftsbriefe 6 Jahre)" }] },
    { label: "Frage 2", fragen: ["In welchem Format werden Ihre Unterlagen langfristig archiviert? (PDF, Original-Dateiformat)"],
      leitfragen: [{ question: "In welchem Format werden Ihre Unterlagen langfristig archiviert? (PDF, Original-Dateiformat)" }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass Sie in 10 Jahren noch auf archivierte Daten zugreifen können?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass Sie in 10 Jahren noch auf archivierte Daten zugreifen können?" }] },
    { label: "Frage 4", fragen: ["Wo befinden sich Ihre Archive? (physisch und digital)"],
      leitfragen: [{ question: "Wo befinden sich Ihre Archive? (physisch und digital)" }] },
    { label: "Frage 5", fragen: ["Wie werden Dokumente vernichtet wenn die Aufbewahrungsfrist abgelaufen ist?"],
      leitfragen: [{ question: "Wie werden Dokumente vernichtet wenn die Aufbewahrungsfrist abgelaufen ist?" }] },
  ],
  "4_5": [
    { label: "Frage 1", fragen: ["Wenn das Finanzamt bei einer Prüfung Ihre Daten einsehen möchte: Wer ist Ihr Ansprechpartner dafür? (Name und Telefonnummer)"],
      leitfragen: [{ question: "Wenn das Finanzamt bei einer Prüfung Ihre Daten einsehen möchte: Wer ist Ihr Ansprechpartner dafür? (Name und Telefonnummer)" }] },
    { label: "Frage 2", fragen: ["Kann ein Betriebsprüfer direkt in Ihre Buchhaltungssoftware schauen? Oder müssen Sie Daten exportieren?"],
      leitfragen: [{ question: "Kann ein Betriebsprüfer direkt in Ihre Buchhaltungssoftware schauen? Oder müssen Sie Daten exportieren?" }] },
    { label: "Frage 3", fragen: ["Können Sie auf Anfrage alle Buchungsdaten in einer Datei exportieren die das Finanzamt einlesen kann?"],
      leitfragen: [{ question: "Können Sie auf Anfrage alle Buchungsdaten in einer Datei exportieren die das Finanzamt einlesen kann?" }] },
    { label: "Frage 4", fragen: ["Wie schnell können Sie angefragte Daten bereitstellen?"],
      leitfragen: [{ question: "Wie schnell können Sie angefragte Daten bereitstellen?" }] },
    { label: "Frage 5", fragen: ["Wer begleitet eine Betriebsprüfung in Ihrem Unternehmen?"],
      leitfragen: [{ question: "Wer begleitet eine Betriebsprüfung in Ihrem Unternehmen?" }] },
  ],
  "4_6": [
    { label: "Frage 1", fragen: ["Wie werden Änderungen an wichtigen Prozessen in Ihrem Unternehmen festgehalten?"],
      leitfragen: [{ question: "Wie werden Änderungen an wichtigen Prozessen in Ihrem Unternehmen festgehalten?" }] },
    { label: "Frage 2", fragen: ["Wer muss zustimmen bevor ein wichtiger Prozess oder ein IT-System geändert wird?"],
      leitfragen: [{ question: "Wer muss zustimmen bevor ein wichtiger Prozess oder ein IT-System geändert wird?" }] },
    { label: "Frage 3", fragen: ["Gibt es ein Protokoll in dem alle Änderungen mit Datum und Grund dokumentiert sind?"],
      leitfragen: [{ question: "Gibt es ein Protokoll in dem alle Änderungen mit Datum und Grund dokumentiert sind?" }] },
    { label: "Frage 4", fragen: ["Wo werden alte Versionen von Dokumenten und Prozessbeschreibungen aufbewahrt?"],
      leitfragen: [{ question: "Wo werden alte Versionen von Dokumenten und Prozessbeschreibungen aufbewahrt?" }] },
    { label: "Frage 5", fragen: ["Wie werden alle betroffenen Mitarbeiter über Änderungen informiert?"],
      leitfragen: [{ question: "Wie werden alle betroffenen Mitarbeiter über Änderungen informiert?" }] },
  ],
  "4_7": [
    { label: "Frage 1", fragen: ["Welche Papier-Dokumente scannen oder fotografieren Sie ein?"],
      leitfragen: [{ question: "Welche Papier-Dokumente scannen oder fotografieren Sie ein?" }] },
    { label: "Frage 2", fragen: ["Wie gehen Sie dabei vor? (Smartphone-App, Scanner, welches Gerät genau)"],
      leitfragen: [{ question: "Wie gehen Sie dabei vor? (Smartphone-App, Scanner, welches Gerät genau)" }] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass der Scan wirklich gut lesbar ist und alles drauf ist?"],
      leitfragen: [{ question: "Wie stellen Sie sicher dass der Scan wirklich gut lesbar ist und alles drauf ist?" }] },
    { label: "Frage 4", fragen: ["Bewahren Sie das Papier-Original nach dem Scannen noch auf oder vernichten Sie es?"],
      leitfragen: [{ question: "Bewahren Sie das Papier-Original nach dem Scannen noch auf oder vernichten Sie es?" }] },
    { label: "Frage 5", fragen: ["Gibt es bei Ihnen eine Regel wie Scans gespeichert und benannt werden müssen?"],
      leitfragen: [{ question: "Gibt es bei Ihnen eine Regel wie Scans gespeichert und benannt werden müssen?" }] },
  ],

  // ── KAPITEL 5: Internes Kontrollsystem ──
  "5_1": [
    { label: "Frage 1", fragen: ["Wer hat bei Ihnen Zugriff auf welche Programme und Daten? (Buchhaltung, Online-Banking, CRM)"],
      leitfragen: [{ question: "Wer hat bei Ihnen Zugriff auf welche Programme und Daten? (Buchhaltung, Online-Banking, CRM)" }] },
    { label: "Frage 2", fragen: ["Wie werden neue Zugänge eingerichtet und wie werden sie wieder gesperrt wenn jemand das Unternehmen verlässt?"],
      leitfragen: [{ question: "Wie werden neue Zugänge eingerichtet und wie werden sie wieder gesperrt wenn jemand das Unternehmen verlässt?" }] },
    { label: "Frage 3", fragen: ["Wird regelmäßig geprüft ob jeder noch die richtigen Zugriffsrechte hat?"],
      leitfragen: [{ question: "Wird regelmäßig geprüft ob jeder noch die richtigen Zugriffsrechte hat?" }] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wer welche Zugriffsrechte hat?"],
      leitfragen: [{ question: "Wo ist dokumentiert wer welche Zugriffsrechte hat?" }] },
    { label: "Frage 5", fragen: ["Gilt bei Ihnen das Prinzip dass jeder nur auf das zugreifen kann was er für seine Arbeit wirklich braucht?"],
      leitfragen: [{ question: "Gilt bei Ihnen das Prinzip dass jeder nur auf das zugreifen kann was er für seine Arbeit wirklich braucht?" }] },
  ],
  "5_2": [
    { label: "Frage 1", fragen: ["Welche Vorgänge müssen bei Ihnen von jemandem freigegeben werden? (z. B. Rechnungen bezahlen, Verträge unterschreiben)"],
      leitfragen: [{ question: "Welche Vorgänge müssen bei Ihnen von jemandem freigegeben werden? (z. B. Rechnungen bezahlen, Verträge unterschreiben)" }] },
    { label: "Frage 2", fragen: ["Wer darf was freigeben und gibt es Betragsgrenzen? (z. B. bis 1.000 € darf Mitarbeiter X freigeben)"],
      leitfragen: [{ question: "Wer darf was freigeben und gibt es Betragsgrenzen? (z. B. bis 1.000 € darf Mitarbeiter X freigeben)" }] },
    { label: "Frage 3", fragen: ["Wie wird dokumentiert dass eine Freigabe erteilt wurde?"],
      leitfragen: [{ question: "Wie wird dokumentiert dass eine Freigabe erteilt wurde?" }] },
    { label: "Frage 4", fragen: ["Wo werden Freigabe-Protokolle aufbewahrt?"],
      leitfragen: [{ question: "Wo werden Freigabe-Protokolle aufbewahrt?" }] },
    { label: "Frage 5", fragen: ["Bei welchen Vorgängen müssen immer zwei Personen zustimmen?"],
      leitfragen: [{ question: "Bei welchen Vorgängen müssen immer zwei Personen zustimmen?" }] },
  ],
  "5_3": [
    { label: "Frage 1", fragen: ["Welche automatischen Prüfungen führt Ihre Software durch? (z. B. Warnung bei doppelten Rechnungen, falsche Steuersätze)"],
      leitfragen: [{ question: "Welche automatischen Prüfungen führt Ihre Software durch? (z. B. Warnung bei doppelten Rechnungen, falsche Steuersätze)" }] },
    { label: "Frage 2", fragen: ["Wie werden Auffälligkeiten oder Fehler in der Buchhaltung erkannt?"],
      leitfragen: [{ question: "Wie werden Auffälligkeiten oder Fehler in der Buchhaltung erkannt?" }] },
    { label: "Frage 3", fragen: ["Was passiert wenn eine automatische Prüfung anschlägt? Wer wird informiert?"],
      leitfragen: [{ question: "Was passiert wenn eine automatische Prüfung anschlägt? Wer wird informiert?" }] },
    { label: "Frage 4", fragen: ["Wo werden die Ergebnisse dieser Prüfungen gespeichert?"],
      leitfragen: [{ question: "Wo werden die Ergebnisse dieser Prüfungen gespeichert?" }] },
    { label: "Frage 5", fragen: ["Wie oft werden manuell Stichproben durchgeführt um die Richtigkeit der Daten zu prüfen?"],
      leitfragen: [{ question: "Wie oft werden manuell Stichproben durchgeführt um die Richtigkeit der Daten zu prüfen?" }] },
  ],
  "5_4": [
    { label: "Frage 1", fragen: ["Wer trägt in Ihrem Unternehmen die Gesamtverantwortung dafür dass die Buchhaltung korrekt und GoBD-konform ist?"],
      leitfragen: [{ question: "Wer trägt in Ihrem Unternehmen die Gesamtverantwortung dafür dass die Buchhaltung korrekt und GoBD-konform ist?" }] },
    { label: "Frage 2", fragen: ["Wie sind Kontrollaufgaben auf verschiedene Personen verteilt?"],
      leitfragen: [{ question: "Wie sind Kontrollaufgaben auf verschiedene Personen verteilt?" }] },
    { label: "Frage 3", fragen: ["Wie wird überwacht ob die internen Kontrollen auch wirklich eingehalten werden?"],
      leitfragen: [{ question: "Wie wird überwacht ob die internen Kontrollen auch wirklich eingehalten werden?" }] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wer für welche Kontrollen zuständig ist?"],
      leitfragen: [{ question: "Wo ist dokumentiert wer für welche Kontrollen zuständig ist?" }] },
    { label: "Frage 5", fragen: ["Wie werden neue Mitarbeiter in die internen Kontrollprozesse eingewiesen?"],
      leitfragen: [{ question: "Wie werden neue Mitarbeiter in die internen Kontrollprozesse eingewiesen?" }] },
  ],
  "5_5": [
    { label: "Frage 1", fragen: ["Wie werden Fehler in der Buchhaltung erkannt? (z. B. durch Software-Prüfungen, Steuerberater, eigene Kontrollen)"],
      leitfragen: [{ question: "Wie werden Fehler in der Buchhaltung erkannt? (z. B. durch Software-Prüfungen, Steuerberater, eigene Kontrollen)" }] },
    { label: "Frage 2", fragen: ["Was passiert wenn ein Buchungsfehler entdeckt wird? Wie wird er korrigiert?"],
      leitfragen: [{ question: "Was passiert wenn ein Buchungsfehler entdeckt wird? Wie wird er korrigiert?" }] },
    { label: "Frage 3", fragen: ["Wer muss bei einem schwerwiegenden Fehler informiert werden?"],
      leitfragen: [{ question: "Wer muss bei einem schwerwiegenden Fehler informiert werden?" }] },
    { label: "Frage 4", fragen: ["Wie wird sichergestellt dass ein Fehler nicht nochmal passiert?"],
      leitfragen: [{ question: "Wie wird sichergestellt dass ein Fehler nicht nochmal passiert?" }] },
    { label: "Frage 5", fragen: ["Wie werden Korrekturen dokumentiert damit später nachvollziehbar ist was geändert wurde und warum?"],
      leitfragen: [{ question: "Wie werden Korrekturen dokumentiert damit später nachvollziehbar ist was geändert wurde und warum?" }] },
  ],
};

/**
 * Utility: Get visible (non-hidden) leitfragen for a chapter based on onboarding answers.
 * Returns { visible, hidden, prefilled } with counts and data.
 */
export function getFilteredLeitfragen(
  chapterKey: string,
  answers: OnboardingAnswers
): {
  visibleBlocks: (LeitfragenBlock & { prefillValue?: string })[];
  hiddenCount: number;
  prefilledCount: number;
  allHidden: boolean;
} {
  const blocks = CHAPTER_LEITFRAGEN_BLOCKS[chapterKey] || [];
  const visibleBlocks: (LeitfragenBlock & { prefillValue?: string })[] = [];
  let hiddenCount = 0;
  let prefilledCount = 0;

  for (const block of blocks) {
    const lf = block.leitfragen?.[0];
    if (lf?.hideIf && lf.hideIf(answers)) {
      hiddenCount++;
      continue;
    }

    let prefillValue: string | undefined;
    if (lf?.prefillFrom) {
      const val = lf.prefillFrom(answers);
      if (val) {
        prefillValue = val;
        prefilledCount++;
      }
    }

    visibleBlocks.push({ ...block, prefillValue });
  }

  return {
    visibleBlocks,
    hiddenCount,
    prefilledCount,
    allHidden: hiddenCount === blocks.length && blocks.length > 0,
  };
}

/**
 * Get negative note for fully hidden chapters (used by AI text generation).
 */
export function getNegativvermerk(chapterKey: string, answers: OnboardingAnswers): string | null {
  const negativeNotes: Record<string, (a: OnboardingAnswers) => string | null> = {
    "2_3": (a) => a.HAS_CASH === false ? "Es wird kein Kassensystem eingesetzt. Bargeschäfte finden nicht statt." : null,
    "2_4": (a) => a.USES_PAYMENT_PROVIDER === false ? "Es werden keine externen Zahlungsdienstleister (z. B. PayPal, Stripe) eingesetzt." : null,
    "2_5": (a) => a.USES_MARKETPLACE === false ? "Es werden keine Marktplätze oder Verkaufsplattformen (z. B. Amazon, eBay) genutzt." : null,
    "2_6": (a) => a.HAS_SCAN_PROCESS === false ? "Es findet kein Scanprozess statt. Alle Belege werden bereits digital empfangen." : null,
    "2_9": (a) => a.HAS_EMPLOYEES === false ? "Das Unternehmen hat keine Angestellten. Lohn- und Gehaltsabrechnungen entfallen." : null,
    "3_2": (a) => a.INVOICE_CREATION_TYPE === 'manual' ? "Es werden keine Software-Schnittstellen eingesetzt. Alle Buchungen erfolgen manuell." : null,
    "3_3": (a) => a.HAS_E_INVOICING === 'no' ? "Es werden keine strukturierten E-Rechnungen (XRechnung, ZUGFeRD) versendet oder empfangen." : null,
    "3_4": (a) => a.USES_CLOUD === 'no' ? "Es werden keine Cloud-Dienste für steuerrelevante Daten eingesetzt." : null,
    "3_6": (a) => a.USES_PAYMENT_PROVIDER === false ? "Es sind keine Zahlungsplattformen technisch eingebunden." : null,
  };

  const fn = negativeNotes[chapterKey];
  return fn ? fn(answers) : null;
}

/** Flat version for backward compatibility */
export const CHAPTER_LEITFRAGEN: Record<string, string[]> = Object.fromEntries(
  Object.entries(CHAPTER_LEITFRAGEN_BLOCKS).map(([key, blocks]) => [
    key,
    blocks.flatMap((b) => b.fragen),
  ])
);
