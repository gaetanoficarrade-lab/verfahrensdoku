// Leitfragen für alle Unterkapitel der GoBD-Verfahrensdokumentation
// Überarbeitete Version: Leitfragen decken alle 7 Prüfkriterien der KI-Prüfung ab
// (Vollständigkeit, Unveränderbarkeit, Nachvollziehbarkeit, Verantwortlichkeiten, Aufbewahrung, Softwareversionen, Schnittstellen)
// Dynamische Steuerung über hideIf / prefillFrom basierend auf Onboarding-Variablen

import { OnboardingAnswers } from './onboarding-variables';

export interface Leitfrage {
  question: string;
  hideIf?: (variables: OnboardingAnswers) => boolean;
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

/** Helper to build a block */
function q(label: string, question: string, hideIf?: (v: OnboardingAnswers) => boolean): LeitfragenBlock {
  return {
    label,
    fragen: [question],
    leitfragen: [{ question, ...(hideIf ? { hideIf } : {}) }],
  };
}

export const CHAPTER_LEITFRAGEN_BLOCKS: Record<string, LeitfragenBlock[]> = {
  // ── KAPITEL 1: Allgemeine Beschreibung ──
  "1_1": [
    q("Frage 1", "Was macht Ihr Unternehmen? Beschreiben Sie kurz womit Sie Geld verdienen."),
    q("Frage 2", "Wie läuft ein typischer Auftrag ab? Von der ersten Anfrage eines Kunden bis zur fertigen Rechnung."),
    q("Frage 3", "Welche Dokumente entstehen dabei? (z. B. Angebote, Verträge, Lieferscheine, Rechnungen)"),
    q("Frage 4", "Wo bewahren Sie diese Dokumente auf und wie lange?"),
    q("Frage 5", "Welche Rechtsform hat Ihr Unternehmen (z. B. GmbH, UG, Einzelunternehmen) und seit wann gibt es es?",
      (v) => !!(v.legal_form || v.founding_year)),
    q("Frage 6", "Welche Software nutzen Sie? Bitte nennen Sie auch die Versionsnummer (z. B. Lexoffice Version 2.1, sevDesk Version 3.0)"),
    q("Frage 7", "Wie fließen Daten zwischen Ihren Systemen? (z. B. Stripe übergibt Zahlungen an Lexoffice, GoHighLevel erstellt Rechnungen)"),
    q("Frage 8", "Wer ist verantwortlich für die Buchhaltung und Dokumentation in Ihrem Unternehmen?"),
    q("Frage 9", "Wie stellen Sie sicher dass Dokumente nachträglich nicht verändert werden können? (z. B. PDF-Export, read-only Ablage, Software sperrt gebuchte Belege)"),
  ],
  "1_2": [
    q("Frage 1", "Wie viele Personen arbeiten in Ihrem Unternehmen und was sind ihre Aufgaben?",
      (v) => v.HAS_EMPLOYEES === false || v.HAS_EMPLOYEES === true),
    q("Frage 2", "Wer ist für was zuständig? (z. B. Wer kümmert sich um Rechnungen, wer um IT, wer um Einkauf?)"),
    q("Frage 3", "Gibt es eine schriftliche Übersicht wer welche Aufgaben hat? Wenn ja, wo liegt diese?"),
    q("Frage 4", "Wo ist festgehalten wer im Unternehmen welche Rolle hat?"),
    q("Frage 5", "Wie oft prüfen Sie ob diese Aufgabenverteilung noch aktuell ist?"),
    q("Frage 6", "Wer ist die Vertretung wenn eine verantwortliche Person ausfällt? (z. B. Urlaub, Krankheit)"),
  ],
  "1_3": [
    q("Frage 1", "Wer ist in Ihrem Unternehmen für die Buchhaltung verantwortlich? (Name und Position)"),
    q("Frage 2", "Wer übernimmt die Buchhaltungsaufgaben wenn diese Person krank oder im Urlaub ist?", hideIfNoEmployees),
    q("Frage 3", "Wer darf auf Ihre Buchhaltungssoftware, Ihr Online-Banking und Ihre Steuerdaten zugreifen?"),
    q("Frage 4", "Wo ist schriftlich festgehalten wer welche Zugriffsrechte hat?"),
    q("Frage 5", "Wer ist der Ansprechpartner für Ihren Steuerberater?"),
    q("Frage 6", "Wie wird sichergestellt dass nur berechtigte Personen Änderungen an Buchhaltungsdaten vornehmen können?"),
  ],
  "1_4": [
    q("Frage 1", "Wann stellen Sie Ihren Kunden Rechnungen? Sofort nach der Leistung oder erst wenn Sie bezahlt werden? (Das bestimmt ob Sie Soll- oder Ist-Versteuerung nutzen)"),
    q("Frage 2", "Führen Sie die Buchhaltung selbst oder macht das Ihr Steuerberater?",
      (v) => !!v.BOOKKEEPING_BY),
    q("Frage 3", "Welche Software nutzen Sie für die Buchhaltung? (Name und Versionsnummer, z. B. DATEV Unternehmen online 2024, Lexoffice Version 2.1)",
      (v) => !!v.INVOICE_CREATION_TYPE),
    q("Frage 4", "Wie oft werden Belege an den Steuerberater übergeben? (täglich, wöchentlich, monatlich)"),
    q("Frage 5", "Was passiert wenn eine Buchung falsch ist? Wie wird das korrigiert und dokumentiert?"),
    q("Frage 6", "Wie stellen Sie sicher dass alle Geschäftsvorfälle vollständig und zeitnah erfasst werden?"),
    q("Frage 7", "Wie wird verhindert dass gebuchte Belege nachträglich verändert oder gelöscht werden können?"),
  ],
  "1_5": [
    q("Frage 1", "Wer ist dafür verantwortlich dass dieses Dokument aktuell bleibt?"),
    q("Frage 2", "Wie oft wird dieses Dokument überprüft und aktualisiert? (z. B. einmal pro Jahr)"),
    q("Frage 3", "In welchen Situationen muss dieses Dokument sofort aktualisiert werden? (z. B. neue Software, neue Mitarbeiter, Prozessänderung)"),
    q("Frage 4", "Wo wird dieses Dokument aufbewahrt?"),
    q("Frage 5", "Werden alte Versionen dieses Dokuments aufbewahrt? Wo?"),
    q("Frage 6", "Wie wird dokumentiert welche Änderungen wann und von wem vorgenommen wurden?"),
  ],

  // ── KAPITEL 2: Anwenderdokumentation ──
  "2_1": [
    q("Frage 1", "Welche Software nutzen Sie um Rechnungen zu schreiben? (Name und Versionsnummer)",
      (v) => !!v.INVOICE_CREATION_TYPE),
    q("Frage 2", "Wie werden Rechnungsnummern vergeben? (automatisch durch die Software oder manuell)"),
    q("Frage 3", "Wie versenden Sie Rechnungen an Ihre Kunden? (per E-Mail als PDF, per Post, über ein Portal)"),
    q("Frage 4", "Wo werden Ihre ausgestellten Rechnungen gespeichert und wie lange?"),
    q("Frage 5", "Was machen Sie wenn eine Rechnung falsch war und korrigiert werden muss? Wie wird die Korrektur dokumentiert?"),
    q("Frage 6", "Wie stellen Sie sicher dass versendete Rechnungen nachträglich nicht verändert werden können?"),
    q("Frage 7", "Wer ist verantwortlich für die Rechnungserstellung und -archivierung?"),
    q("Frage 8", "Fließen Rechnungsdaten automatisch in ein anderes System? (z. B. Rechnungssoftware → Buchhaltung)"),
  ],
  "2_2": [
    q("Frage 1", "Wie erhalten Sie Rechnungen von Ihren Lieferanten? (per E-Mail, per Post, über ein Online-Portal)"),
    q("Frage 2", "Was passiert wenn eine Rechnung ankommt? Wer prüft sie und wer gibt sie frei?"),
    q("Frage 3", "Wie dokumentieren Sie dass eine Rechnung geprüft und freigegeben wurde?"),
    q("Frage 4", "Wo werden Ihre Eingangsrechnungen abgelegt und wie lange? (Ordner, Cloud, Buchhaltungssoftware)"),
    q("Frage 5", "Was tun Sie wenn Sie eine Rechnung erhalten die Sie nicht nachvollziehen können oder die falsch ist?"),
    q("Frage 6", "Wie stellen Sie sicher dass empfangene Rechnungen nicht verändert werden können? (z. B. Originaldatei wird unverändert gespeichert)"),
    q("Frage 7", "Wer ist verantwortlich für den gesamten Eingangsrechnungsprozess?"),
  ],
  "2_3": [
    q("Frage 1", "Welches Kassensystem nutzen Sie? (Name, Modell und Softwareversion)", hideIfNoCash),
    q("Frage 2", "Wie läuft ein Kassiervorgang bei Ihnen ab? Beschreiben Sie den Ablauf vom Kassieren bis zum Beleg.", hideIfNoCash),
    q("Frage 3", "Wie machen Sie den Tagesabschluss an der Kasse und wo werden die Tagesberichte gespeichert?", hideIfNoCash),
    q("Frage 4", "Wie gelangen die Kassendaten in Ihre Buchhaltung? (automatisch oder manuell)", hideIfNoCash),
    q("Frage 5", "Was tun Sie wenn die Kasse nicht stimmt - also wenn mehr oder weniger Geld in der Kasse ist als sein sollte?", hideIfNoCash),
    q("Frage 6", "Wer ist verantwortlich für die Kasse und den Tagesabschluss?", hideIfNoCash),
    q("Frage 7", "Wie wird sichergestellt dass Kasseneinträge nachträglich nicht verändert werden können? (z. B. TSE, Kassensicherungsverordnung)", hideIfNoCash),
    q("Frage 8", "Wie lange und wo werden Kassendaten und Tagesberichte aufbewahrt?", hideIfNoCash),
  ],
  "2_4": [
    q("Frage 1", "Welche Zahlungsdienste nutzen Sie? (z. B. PayPal, Stripe, Klarna, SumUp – mit Versionsnummer der Integration falls bekannt)", hideIfNoPaymentProvider),
    q("Frage 2", "Wie werden Zahlungseingänge über diese Dienste in Ihrer Buchhaltung erfasst? (automatisch oder manuell)", hideIfNoPaymentProvider),
    q("Frage 3", "Wie stellen Sie sicher dass keine Zahlung vergessen wird?", hideIfNoPaymentProvider),
    q("Frage 4", "Wo werden die Abrechnungen und Belege dieser Zahlungsdienste gespeichert und wie lange?", hideIfNoPaymentProvider),
    q("Frage 5", "Was passiert wenn ein Kunde eine Zahlung zurückbucht (Chargeback)? Wie wird das dokumentiert?", hideIfNoPaymentProvider),
    q("Frage 6", "Wer ist verantwortlich für den Abgleich der Zahlungsanbieter-Daten mit der Buchhaltung?", hideIfNoPaymentProvider),
    q("Frage 7", "Wie fließen Daten vom Zahlungsanbieter in Ihre Buchhaltung? (z. B. Stripe → Lexoffice automatisch)", hideIfNoPaymentProvider),
  ],
  "2_5": [
    q("Frage 1", "Über welche Plattformen verkaufen Sie? (z. B. Amazon, eBay, Etsy, eigener Onlineshop)", hideIfNoMarketplace),
    q("Frage 2", "Wie werden Ihre Verkäufe von der Plattform in Ihre Buchhaltung übernommen? (automatisch oder manuell)", hideIfNoMarketplace),
    q("Frage 3", "Wie stellen Sie sicher dass alle Umsätze vollständig erfasst sind?", hideIfNoMarketplace),
    q("Frage 4", "Wo werden die monatlichen Abrechnungen der Plattformen gespeichert und wie lange?", hideIfNoMarketplace),
    q("Frage 5", "Wie behandeln Sie Retouren und Erstattungen buchhalterisch?", hideIfNoMarketplace),
    q("Frage 6", "Wer ist verantwortlich für den Abgleich der Plattform-Umsätze mit der Buchhaltung?", hideIfNoMarketplace),
    q("Frage 7", "Wie fließen die Verkaufsdaten von der Plattform in Ihre Systeme? (z. B. API-Anbindung, CSV-Export)", hideIfNoMarketplace),
  ],
  "2_6": [
    q("Frage 1", "Welche Dokumente erhalten Sie noch auf Papier und müssen daher eingescannt werden?", hideIfNoScanProcess),
    q("Frage 2", "Womit scannen Sie diese Dokumente? (z. B. Smartphone-App, Scanner, Multifunktionsdrucker – Name und Version)", hideIfNoScanProcess),
    q("Frage 3", "Wie stellen Sie sicher dass der Scan gut lesbar ist und dem Original entspricht?", hideIfNoScanProcess),
    q("Frage 4", "Was passiert mit dem Papieroriginal nachdem es eingescannt wurde? Wird es aufbewahrt oder vernichtet?", hideIfNoScanProcess),
    q("Frage 5", "Gibt es eine interne Regel wie Dokumente gescannt und benannt werden müssen?", hideIfNoScanProcess),
    q("Frage 6", "Wer ist verantwortlich für den Scanprozess?", hideIfNoScanProcess),
    q("Frage 7", "Wie wird sichergestellt dass gescannte Dokumente nachträglich nicht verändert werden können?", hideIfNoScanProcess),
    q("Frage 8", "Wo werden die gescannten Dokumente gespeichert und wie lange?", hideIfNoScanProcess),
  ],
  "2_7": [
    q("Frage 1", "Wie gelangen Belege in Ihre Buchhaltung? (werden sie manuell eingetragen oder automatisch importiert)"),
    q("Frage 2", "Wer bucht die Geschäftsvorfälle und wie oft? (täglich, wöchentlich, monatlich)"),
    q("Frage 3", "Wie wird kontrolliert ob Buchungen korrekt sind?"),
    q("Frage 4", "Wo werden Buchungsbelege und Journale aufbewahrt und wie lange?"),
    q("Frage 5", "Wie werden regelmäßige Ausgaben behandelt die jeden Monat gleich sind? (z. B. Miete, Versicherungen)"),
    q("Frage 6", "Wie wird sichergestellt dass einmal gebuchte Vorgänge nicht unbemerkt geändert oder gelöscht werden können?"),
    q("Frage 7", "Welche Software nutzen Sie für die Buchhaltungsverarbeitung? (Name und Version)"),
    q("Frage 8", "Welche Systeme liefern automatisch Daten in die Buchhaltung? (z. B. Kasse, Onlineshop, Bank)"),
  ],
  "2_8": [
    q("Frage 1", "Wie viele Geschäftskonten haben Sie und bei welcher Bank?",
      (v) => v.HAS_BUSINESS_ACCOUNT !== undefined),
    q("Frage 2", "Wie rufen Sie Ihre Kontoauszüge ab? (Online-Banking, automatischer Import in Buchhaltungssoftware)",
      (v) => v.USES_ONLINE_BANKING !== undefined),
    q("Frage 3", "Wie werden Zahlungseingänge und -ausgänge den richtigen Rechnungen zugeordnet?"),
    q("Frage 4", "Wo werden Kontoauszüge und Zahlungsbelege archiviert und wie lange?"),
    q("Frage 5", "Wie behalten Sie den Überblick über offene Rechnungen die noch nicht bezahlt wurden?"),
    q("Frage 6", "Wer ist verantwortlich für den Zahlungsverkehr und den Kontoabgleich?"),
    q("Frage 7", "Fließen Bankdaten automatisch in Ihre Buchhaltung? (z. B. automatischer Bankabgleich in Lexoffice/DATEV)"),
    q("Frage 8", "Wie wird sichergestellt dass Zahlungsdaten nicht nachträglich verändert werden können?"),
  ],
  "2_9": [
    q("Frage 1", "Wie viele Mitarbeiter haben Sie und in welchen Beschäftigungsformen? (Vollzeit, Teilzeit, Minijob)", hideIfNoEmployees),
    q("Frage 2", "Wer erstellt die Lohn- und Gehaltsabrechnungen? (intern oder externer Dienstleister)", hideIfNoEmployees),
    q("Frage 3", "Welche Software wird für die Lohnabrechnung genutzt? (Name und Version)", hideIfNoEmployees),
    q("Frage 4", "Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt und wie lange?", hideIfNoEmployees),
    q("Frage 5", "Wie werden Spesen und Reisekosten der Mitarbeiter abgerechnet?", hideIfNoEmployees),
    q("Frage 6", "Wie fließen die Lohndaten in die Finanzbuchhaltung? (z. B. DATEV-Export, manuelle Buchung)", hideIfNoEmployees),
    q("Frage 7", "Wer ist verantwortlich für die korrekte und fristgerechte Lohnabrechnung?", hideIfNoEmployees),
  ],

  // ── KAPITEL 3: Technische Systemdokumentation ──
  "3_1": [
    q("Frage 1", "Welche Buchhaltungssoftware nutzen Sie? (Name und aktuelle Versionsnummer)",
      (v) => !!v.INVOICE_CREATION_TYPE && v.INVOICE_CREATION_TYPE !== 'manual'),
    q("Frage 2", "Wer hat Zugriff auf die Software und welche Rechte haben die einzelnen Personen?"),
    q("Frage 3", "Wie werden Updates der Software durchgeführt und von wem?"),
    q("Frage 4", "Wo sind die Lizenzdaten und Zugangsdaten der Software sicher hinterlegt?"),
    q("Frage 5", "An wen wenden Sie sich wenn die Software nicht funktioniert?"),
    q("Frage 6", "Wie stellt die Software sicher dass gebuchte Daten nicht nachträglich verändert werden können? (z. B. Festschreibung, Audit-Log)"),
    q("Frage 7", "Wo werden die Daten der Software gespeichert? (lokal, Cloud, Serverstandort)"),
  ],
  "3_2": [
    q("Frage 1", "Welche Programme tauschen bei Ihnen automatisch Daten aus? (z. B. Onlineshop → Buchhaltung, Kasse → DATEV) Bitte nennen Sie alle Systeme mit Versionsnummern.", hideIfManualInvoice),
    q("Frage 2", "Wie werden diese Daten übertragen? (automatisch im Hintergrund, API, oder müssen Sie selbst einen Export/Import anstoßen)", hideIfManualInvoice),
    q("Frage 3", "Wie merken Sie wenn bei einer Datenübertragung etwas schiefgelaufen ist? (z. B. Fehlermeldung, Protokoll)", hideIfManualInvoice),
    q("Frage 4", "Wo ist dokumentiert wie diese Verbindungen zwischen den Programmen eingerichtet sind?", hideIfManualInvoice),
    q("Frage 5", "Was tun Sie wenn eine Übertragung fehlschlägt? Wer ist verantwortlich für die Behebung?", hideIfManualInvoice),
    q("Frage 6", "Wie wird sichergestellt dass bei der Datenübertragung keine Daten verloren gehen oder verändert werden?", hideIfManualInvoice),
  ],
  "3_3": [
    q("Frage 1", "Versenden oder empfangen Sie elektronische Rechnungen in einem strukturierten Format? (z. B. XRechnung, ZUGFeRD)", hideIfNoEInvoicing),
    q("Frage 2", "Welche Software nutzen Sie dafür? (Name und Version)", hideIfNoEInvoicing),
    q("Frage 3", "Wie wird geprüft ob eine empfangene E-Rechnung korrekt und vollständig ist?", hideIfNoEInvoicing),
    q("Frage 4", "Wo werden E-Rechnungen im Originalformat gespeichert und wie lange? (sie dürfen nicht in ein anderes Format umgewandelt werden)", hideIfNoEInvoicing),
    q("Frage 5", "Was passiert wenn eine E-Rechnung fehlerhaft ist? Wie wird das dokumentiert?", hideIfNoEInvoicing),
    q("Frage 6", "Wer ist verantwortlich für den E-Rechnungsprozess?", hideIfNoEInvoicing),
    q("Frage 7", "Wie fließen E-Rechnungen in die Buchhaltung? (automatisch oder manuell)", hideIfNoEInvoicing),
  ],
  "3_4": [
    q("Frage 1", "Welche Online-Programme nutzen Sie für steuerrelevante Daten? (z. B. Google Drive, Dropbox, OneDrive, Cloud-Buchhaltung – mit Version)", hideIfNoCloud),
    q("Frage 2", "Wer hat Zugriff auf diese Programme und wie ist der Zugang gesichert? (z. B. Passwort + SMS-Code)", hideIfNoCloud),
    q("Frage 3", "Wo werden Ihre Daten bei diesen Anbietern gespeichert? (möglichst in Deutschland oder der EU)", hideIfNoCloud),
    q("Frage 4", "Was passiert mit Ihren Daten wenn Sie den Anbieter wechseln oder kündigen?", hideIfNoCloud),
    q("Frage 5", "Haben Sie mit diesen Anbietern einen Vertrag zum Datenschutz abgeschlossen? (Auftragsverarbeitungsvertrag)", hideIfNoCloud),
    q("Frage 6", "Wie wird sichergestellt dass in der Cloud gespeicherte Daten nicht unbemerkt verändert oder gelöscht werden können?", hideIfNoCloud),
    q("Frage 7", "Wer ist verantwortlich für die Verwaltung der Cloud-Zugänge und -Daten?", hideIfNoCloud),
  ],
  "3_5": [
    q("Frage 1", "Welches E-Mail-Programm nutzen Sie geschäftlich? (z. B. Outlook, Gmail, Apple Mail – mit Version oder Tarif)"),
    q("Frage 2", "Wie gehen Sie mit Rechnungen und Verträgen um die per E-Mail ankommen?"),
    q("Frage 3", "Wie stellen Sie sicher dass wichtige geschäftliche E-Mails nicht verloren gehen und für 10 Jahre abrufbar sind?"),
    q("Frage 4", "Wo werden archivierte E-Mails gespeichert?"),
    q("Frage 5", "Wie wird verhindert dass archivierte E-Mails nachträglich verändert oder gelöscht werden können?"),
    q("Frage 6", "Wer ist verantwortlich für die E-Mail-Archivierung?"),
  ],
  "3_6": [
    q("Frage 1", "Welche Zahlungsplattformen sind technisch in Ihre Systeme eingebunden? (z. B. PayPal-API, Stripe-Integration – mit Version)", hideIfNoPaymentProvider),
    q("Frage 2", "Wie werden Transaktionsdaten von diesen Plattformen automatisch in Ihre Buchhaltung übernommen?", hideIfNoPaymentProvider),
    q("Frage 3", "Wie stellen Sie sicher dass alle Transaktionen vollständig und korrekt übertragen wurden?", hideIfNoPaymentProvider),
    q("Frage 4", "Wo werden die technischen Protokolle und Transaktionsaufzeichnungen gespeichert und wie lange?", hideIfNoPaymentProvider),
    q("Frage 5", "Wie erkennen Sie wenn Daten zwischen der Plattform und Ihrer Buchhaltung nicht übereinstimmen?", hideIfNoPaymentProvider),
    q("Frage 6", "Wer ist verantwortlich für die technische Anbindung und den regelmäßigen Datenabgleich?", hideIfNoPaymentProvider),
  ],

  // ── KAPITEL 4: Betriebsdokumentation ──
  "4_1": [
    q("Frage 1", "Wie oft werden Ihre geschäftlichen Daten gesichert? (täglich, wöchentlich)"),
    q("Frage 2", "Was genau wird gesichert? (Buchhaltungsdaten, E-Mails, Dokumente)"),
    q("Frage 3", "Wer ist dafür verantwortlich dass die Datensicherung regelmäßig durchgeführt wird?"),
    q("Frage 4", "Wo werden die Sicherungskopien aufbewahrt? (externe Festplatte, Cloud, zweiter Standort)"),
    q("Frage 5", "Werden die Sicherungen regelmäßig getestet ob sie im Notfall auch wirklich funktionieren?"),
    q("Frage 6", "Welche Software oder welches Tool wird für die Datensicherung genutzt? (Name und Version)"),
    q("Frage 7", "Wie lange werden Sicherungskopien aufbewahrt?"),
  ],
  "4_2": [
    q("Frage 1", "Was würden Sie tun wenn Ihr Computer oder Server komplett ausfällt? Haben Sie einen Plan?"),
    q("Frage 2", "Wie lange würde es dauern bis Ihr Betrieb nach einem Totalausfall wieder läuft?"),
    q("Frage 3", "Wer ist verantwortlich wenn Daten wiederhergestellt werden müssen?"),
    q("Frage 4", "Wo ist beschrieben wie die Datenwiederherstellung Schritt für Schritt funktioniert?"),
    q("Frage 5", "Haben Sie die Wiederherstellung schon einmal probeweise getestet? Wann zuletzt?"),
    q("Frage 6", "Wie stellen Sie sicher dass nach der Wiederherstellung alle Daten vollständig und unverändert sind?"),
  ],
  "4_3": [
    q("Frage 1", "Wie werden Updates Ihrer Programme durchgeführt? (automatisch oder manuell)"),
    q("Frage 2", "Wer entscheidet wann ein größeres Update oder ein Programm-Wechsel durchgeführt wird?"),
    q("Frage 3", "Wie dokumentieren Sie welche Programme in welcher Version eingesetzt werden? (z. B. Software-Inventarliste)"),
    q("Frage 4", "Wie stellen Sie sicher dass nach einem Update alle Daten noch korrekt und vollständig sind?"),
    q("Frage 5", "Testen Sie größere Updates zuerst bevor Sie sie produktiv einsetzen?"),
    q("Frage 6", "Wo wird protokolliert wann welche Updates durchgeführt wurden?"),
  ],
  "4_4": [
    q("Frage 1", "Wissen Sie welche Unterlagen Sie wie lange aufbewahren müssen? (Rechnungen 10 Jahre, Geschäftsbriefe 6 Jahre)"),
    q("Frage 2", "In welchem Format werden Ihre Unterlagen langfristig archiviert? (PDF, Original-Dateiformat)"),
    q("Frage 3", "Wie stellen Sie sicher dass Sie in 10 Jahren noch auf archivierte Daten zugreifen können?"),
    q("Frage 4", "Wo befinden sich Ihre Archive? (physisch und digital)"),
    q("Frage 5", "Wie werden Dokumente vernichtet wenn die Aufbewahrungsfrist abgelaufen ist?"),
    q("Frage 6", "Wie wird sichergestellt dass archivierte Dokumente nicht verändert oder gelöscht werden können?"),
    q("Frage 7", "Wer ist verantwortlich für die Archivierung und Einhaltung der Aufbewahrungsfristen?"),
  ],
  "4_5": [
    q("Frage 1", "Wenn das Finanzamt bei einer Prüfung Ihre Daten einsehen möchte: Wer ist Ihr Ansprechpartner dafür? (Name und Telefonnummer)"),
    q("Frage 2", "Kann ein Betriebsprüfer direkt in Ihre Buchhaltungssoftware schauen? Oder müssen Sie Daten exportieren?"),
    q("Frage 3", "Können Sie auf Anfrage alle Buchungsdaten in einer Datei exportieren die das Finanzamt einlesen kann? (GDPdU/GoBD-Export)"),
    q("Frage 4", "Wie schnell können Sie angefragte Daten bereitstellen?"),
    q("Frage 5", "Wer begleitet eine Betriebsprüfung in Ihrem Unternehmen?"),
    q("Frage 6", "Welche Zugriffsart bieten Sie dem Finanzamt an? (Z1 = Nur-Lese-Zugriff, Z2 = Datenexport, Z3 = Datenträgerüberlassung)"),
  ],
  "4_6": [
    q("Frage 1", "Wie werden Änderungen an wichtigen Prozessen in Ihrem Unternehmen festgehalten?"),
    q("Frage 2", "Wer muss zustimmen bevor ein wichtiger Prozess oder ein IT-System geändert wird?"),
    q("Frage 3", "Gibt es ein Protokoll in dem alle Änderungen mit Datum und Grund dokumentiert sind?"),
    q("Frage 4", "Wo werden alte Versionen von Dokumenten und Prozessbeschreibungen aufbewahrt?"),
    q("Frage 5", "Wie werden alle betroffenen Mitarbeiter über Änderungen informiert?"),
    q("Frage 6", "Wie wird sichergestellt dass Änderungen nachvollziehbar sind und nicht unbemerkt vorgenommen werden können?"),
  ],
  "4_7": [
    q("Frage 1", "Welche Papier-Dokumente scannen oder fotografieren Sie ein?"),
    q("Frage 2", "Wie gehen Sie dabei vor? (Smartphone-App, Scanner – Name und Version des Geräts/der App)"),
    q("Frage 3", "Wie stellen Sie sicher dass der Scan wirklich gut lesbar ist und alles drauf ist?"),
    q("Frage 4", "Bewahren Sie das Papier-Original nach dem Scannen noch auf oder vernichten Sie es?"),
    q("Frage 5", "Gibt es bei Ihnen eine Regel wie Scans gespeichert und benannt werden müssen?"),
    q("Frage 6", "Wer ist verantwortlich für die Digitalisierung von Papierbelegen?"),
    q("Frage 7", "Wie wird sichergestellt dass digitalisierte Belege nicht nachträglich verändert werden können?"),
    q("Frage 8", "Wo werden die digitalisierten Belege gespeichert und wie lange?"),
  ],

  // ── KAPITEL 5: Internes Kontrollsystem ──
  "5_1": [
    q("Frage 1", "Wer hat bei Ihnen Zugriff auf welche Programme und Daten? (Buchhaltung, Online-Banking, CRM)"),
    q("Frage 2", "Wie werden neue Zugänge eingerichtet und wie werden sie wieder gesperrt wenn jemand das Unternehmen verlässt?"),
    q("Frage 3", "Wird regelmäßig geprüft ob jeder noch die richtigen Zugriffsrechte hat? Wie oft?"),
    q("Frage 4", "Wo ist dokumentiert wer welche Zugriffsrechte hat?"),
    q("Frage 5", "Gilt bei Ihnen das Prinzip dass jeder nur auf das zugreifen kann was er für seine Arbeit wirklich braucht?"),
    q("Frage 6", "Wer ist verantwortlich für die Vergabe und Überprüfung von Berechtigungen?"),
  ],
  "5_2": [
    q("Frage 1", "Welche Vorgänge müssen bei Ihnen von jemandem freigegeben werden? (z. B. Rechnungen bezahlen, Verträge unterschreiben)"),
    q("Frage 2", "Wer darf was freigeben und gibt es Betragsgrenzen? (z. B. bis 1.000 € darf Mitarbeiter X freigeben)"),
    q("Frage 3", "Wie wird dokumentiert dass eine Freigabe erteilt wurde?"),
    q("Frage 4", "Wo werden Freigabe-Protokolle aufbewahrt und wie lange?"),
    q("Frage 5", "Bei welchen Vorgängen müssen immer zwei Personen zustimmen? (Vier-Augen-Prinzip)"),
    q("Frage 6", "Wie wird sichergestellt dass Freigaben nicht nachträglich manipuliert werden können?"),
  ],
  "5_3": [
    q("Frage 1", "Welche automatischen Prüfungen führt Ihre Software durch? (z. B. Warnung bei doppelten Rechnungen, falsche Steuersätze)"),
    q("Frage 2", "Wie werden Auffälligkeiten oder Fehler in der Buchhaltung erkannt?"),
    q("Frage 3", "Was passiert wenn eine automatische Prüfung anschlägt? Wer wird informiert?"),
    q("Frage 4", "Wo werden die Ergebnisse dieser Prüfungen gespeichert und wie lange?"),
    q("Frage 5", "Wie oft werden manuell Stichproben durchgeführt um die Richtigkeit der Daten zu prüfen?"),
    q("Frage 6", "Wer ist verantwortlich für die Durchführung und Auswertung der Plausibilitätskontrollen?"),
  ],
  "5_4": [
    q("Frage 1", "Wer trägt in Ihrem Unternehmen die Gesamtverantwortung dafür dass die Buchhaltung korrekt und GoBD-konform ist?"),
    q("Frage 2", "Wie sind Kontrollaufgaben auf verschiedene Personen verteilt?"),
    q("Frage 3", "Wie wird überwacht ob die internen Kontrollen auch wirklich eingehalten werden?"),
    q("Frage 4", "Wo ist dokumentiert wer für welche Kontrollen zuständig ist?"),
    q("Frage 5", "Wie werden neue Mitarbeiter in die internen Kontrollprozesse eingewiesen?"),
    q("Frage 6", "Wie oft wird geprüft ob die Verteilung der Verantwortlichkeiten noch aktuell und angemessen ist?"),
  ],
  "5_5": [
    q("Frage 1", "Wie werden Fehler in der Buchhaltung erkannt? (z. B. durch Software-Prüfungen, Steuerberater, eigene Kontrollen)"),
    q("Frage 2", "Was passiert wenn ein Buchungsfehler entdeckt wird? Wie wird er korrigiert?"),
    q("Frage 3", "Wer muss bei einem schwerwiegenden Fehler informiert werden?"),
    q("Frage 4", "Wie wird sichergestellt dass ein Fehler nicht nochmal passiert? (Präventionsmaßnahmen)"),
    q("Frage 5", "Wie werden Korrekturen dokumentiert damit später nachvollziehbar ist was geändert wurde und warum?"),
    q("Frage 6", "Wo werden Fehlerprotokolle und Korrekturbelege aufbewahrt und wie lange?"),
  ],
};

/**
 * Utility: Get visible (non-hidden) leitfragen for a chapter based on onboarding answers.
 */
export function getFilteredLeitfragen(
  chapterKey: string,
  answers: OnboardingAnswers
): {
  visibleBlocks: LeitfragenBlock[];
  hiddenCount: number;
  allHidden: boolean;
} {
  const blocks = CHAPTER_LEITFRAGEN_BLOCKS[chapterKey] || [];
  const visibleBlocks: LeitfragenBlock[] = [];
  let hiddenCount = 0;

  for (const block of blocks) {
    const lf = block.leitfragen?.[0];
    if (lf?.hideIf && lf.hideIf(answers)) {
      hiddenCount++;
      continue;
    }
    visibleBlocks.push(block);
  }

  return {
    visibleBlocks,
    hiddenCount,
    allHidden: hiddenCount === blocks.length && blocks.length > 0,
  };
}

/**
 * Get negative note for fully hidden chapters (used by AI text generation).
 */
export function getNegativvermerk(chapterKey: string, answers: OnboardingAnswers, companyName?: string): string | null {
  const firma = companyName || 'des Unternehmens';
  const firmaGen = companyName ? `der ${companyName}` : 'des Unternehmens';

  const negativeNotes: Record<string, (a: OnboardingAnswers) => string | null> = {
    // Kassenprozesse
    "2_3": (a) => a.HAS_CASH === false
      ? `Im Rahmen der Geschäftstätigkeit ${firmaGen} werden keine Bargeschäfte getätigt. Ein Kassensystem oder eine Registrierkasse wird nicht eingesetzt. Sämtliche Geschäftsvorfälle werden ausschließlich über den unbaren Zahlungsverkehr abgewickelt. Ein Kassenbuch wird daher nicht geführt. Die Dokumentationspflichten gemäß § 146 Abs. 1 AO für Kasseneinnahmen und -ausgaben entfallen entsprechend.`
      : null,
    // Zahlungsanbieter
    "2_4": (a) => a.USES_PAYMENT_PROVIDER === false
      ? `Im Rahmen der Geschäftstätigkeit werden keine externen Zahlungsdienstleister eingesetzt. Die Abwicklung aller Zahlungen erfolgt ausschließlich über das Geschäftskonto per Überweisung oder Lastschrift.`
      : null,
    // Marktplatz
    "2_5": (a) => a.USES_MARKETPLACE === false
      ? `Das Unternehmen vertreibt keine Waren oder Dienstleistungen über Online-Marktplätze oder Plattformen. Sämtliche Geschäftsvorfälle werden über direkte Kundenbeziehungen abgewickelt.`
      : null,
    // Scanprozess
    "2_6": (a) => a.HAS_SCAN_PROCESS === false
      ? `Im Unternehmen fallen keine Papierbelege an, die digitalisiert werden müssen. Alle eingehenden Belege liegen bereits in digitaler Form vor.`
      : null,
    // Personal / Lohn
    "2_9": (a) => a.HAS_EMPLOYEES === false
      ? `Das Unternehmen beschäftigt keine Mitarbeiter. Sämtliche buchhalterischen und administrativen Tätigkeiten werden ausschließlich durch den Inhaber persönlich ausgeführt. Ein Berechtigungskonzept für mehrere Nutzer ist daher nicht erforderlich. Die Zugangsdaten zu allen eingesetzten Systemen liegen ausschließlich beim Inhaber.`
      : null,
    // Schnittstellen
    "3_2": (a) => a.INVOICE_CREATION_TYPE === 'manual'
      ? `Es werden keine automatisierten Software-Schnittstellen zwischen den eingesetzten Systemen genutzt. Sämtliche Buchungen und Datenübertragungen erfolgen manuell.`
      : null,
    // E-Rechnungen
    "3_3": (a) => a.HAS_E_INVOICING === 'no'
      ? `Das Unternehmen empfängt und versendet derzeit keine elektronischen Rechnungen im Format ZUGFeRD oder XRechnung. Die Rechnungsstellung erfolgt ausschließlich im PDF-Format.`
      : null,
    // Cloud
    "3_4": (a) => a.USES_CLOUD === 'no'
      ? `Das Unternehmen setzt keine Cloud-Dienste zur Speicherung oder Verarbeitung steuerrelevanter Daten ein. Alle relevanten Daten werden lokal oder in der eingesetzten Buchhaltungssoftware gespeichert.`
      : null,
    // Zahlungsplattformen (technisch)
    "3_6": (a) => a.USES_PAYMENT_PROVIDER === false && a.USES_MARKETPLACE === false
      ? `Es sind keine externen Zahlungsplattformen oder Marktplatz-Schnittstellen technisch eingebunden. Der gesamte Zahlungsverkehr wird über die regulären Bankverbindungen abgewickelt.`
      : null,
    // Berechtigungen (IKS)
    "5_1": (a) => a.HAS_EMPLOYEES === false
      ? `Das Unternehmen beschäftigt keine Mitarbeiter. Sämtliche Systemzugriffe erfolgen ausschließlich durch den Inhaber. Ein differenziertes Berechtigungskonzept ist daher nicht erforderlich.`
      : null,
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
