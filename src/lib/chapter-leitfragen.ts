// Leitfragen für alle Unterkapitel der GoBD-Verfahrensdokumentation
// Überarbeitete Version mit verständlichen, praxisnahen Fragen

export interface LeitfragenBlock {
  label: string;
  fragen: string[];
}

export const CHAPTER_LEITFRAGEN_BLOCKS: Record<string, LeitfragenBlock[]> = {
  // ── KAPITEL 1: Allgemeine Beschreibung ──
  "1_1": [
    { label: "Frage 1", fragen: ["Was macht Ihr Unternehmen? Beschreiben Sie kurz womit Sie Geld verdienen."] },
    { label: "Frage 2", fragen: ["Wie läuft ein typischer Auftrag ab? Von der ersten Anfrage eines Kunden bis zur fertigen Rechnung."] },
    { label: "Frage 3", fragen: ["Welche Dokumente entstehen dabei? (z. B. Angebote, Verträge, Lieferscheine, Rechnungen)"] },
    { label: "Frage 4", fragen: ["Wo bewahren Sie diese Dokumente auf und wie lange?"] },
    { label: "Frage 5", fragen: ["Welche Rechtsform hat Ihr Unternehmen (z. B. GmbH, UG, Einzelunternehmen) und seit wann gibt es es?"] },
  ],
  "1_2": [
    { label: "Frage 1", fragen: ["Wie viele Personen arbeiten in Ihrem Unternehmen und was sind ihre Aufgaben?"] },
    { label: "Frage 2", fragen: ["Wer ist für was zuständig? (z. B. Wer kümmert sich um Rechnungen, wer um IT, wer um Einkauf?)"] },
    { label: "Frage 3", fragen: ["Gibt es eine schriftliche Übersicht wer welche Aufgaben hat? Wenn ja, wo liegt diese?"] },
    { label: "Frage 4", fragen: ["Wo ist festgehalten wer im Unternehmen welche Rolle hat?"] },
    { label: "Frage 5", fragen: ["Wie oft prüfen Sie ob diese Aufgabenverteilung noch aktuell ist?"] },
  ],
  "1_3": [
    { label: "Frage 1", fragen: ["Wer ist in Ihrem Unternehmen für die Buchhaltung verantwortlich? (Name und Position)"] },
    { label: "Frage 2", fragen: ["Wer übernimmt die Buchhaltungsaufgaben wenn diese Person krank oder im Urlaub ist?"] },
    { label: "Frage 3", fragen: ["Wer darf auf Ihre Buchhaltungssoftware, Ihr Online-Banking und Ihre Steuerdaten zugreifen?"] },
    { label: "Frage 4", fragen: ["Wo ist schriftlich festgehalten wer welche Zugriffsrechte hat?"] },
    { label: "Frage 5", fragen: ["Wer ist der Ansprechpartner für Ihren Steuerberater?"] },
  ],
  "1_4": [
    { label: "Frage 1", fragen: ["Wann stellen Sie Ihren Kunden Rechnungen? Sofort nach der Leistung oder erst wenn Sie bezahlt werden? (Das bestimmt ob Sie Soll- oder Ist-Versteuerung nutzen)"] },
    { label: "Frage 2", fragen: ["Führen Sie die Buchhaltung selbst oder macht das Ihr Steuerberater?"] },
    { label: "Frage 3", fragen: ["Welche Software nutzen Sie für die Buchhaltung? (z. B. DATEV, Lexoffice, sevDesk)"] },
    { label: "Frage 4", fragen: ["Wie oft werden Belege an den Steuerberater übergeben? (täglich, wöchentlich, monatlich)"] },
    { label: "Frage 5", fragen: ["Was passiert wenn eine Buchung falsch ist? Wie wird das korrigiert?"] },
  ],
  "1_5": [
    { label: "Frage 1", fragen: ["Wer ist dafür verantwortlich dass dieses Dokument aktuell bleibt?"] },
    { label: "Frage 2", fragen: ["Wie oft wird dieses Dokument überprüft und aktualisiert? (z. B. einmal pro Jahr)"] },
    { label: "Frage 3", fragen: ["In welchen Situationen muss dieses Dokument sofort aktualisiert werden? (z. B. neue Software, neue Mitarbeiter)"] },
    { label: "Frage 4", fragen: ["Wo wird dieses Dokument aufbewahrt?"] },
    { label: "Frage 5", fragen: ["Werden alte Versionen dieses Dokuments aufbewahrt? Wo?"] },
  ],

  // ── KAPITEL 2: Anwenderdokumentation ──
  "2_1": [
    { label: "Frage 1", fragen: ["Welche Software nutzen Sie um Rechnungen zu schreiben? (z. B. Lexoffice, sevDesk, Word)"] },
    { label: "Frage 2", fragen: ["Wie werden Rechnungsnummern vergeben? (automatisch durch die Software oder manuell)"] },
    { label: "Frage 3", fragen: ["Wie versenden Sie Rechnungen an Ihre Kunden? (per E-Mail als PDF, per Post, über ein Portal)"] },
    { label: "Frage 4", fragen: ["Wo werden Ihre ausgestellten Rechnungen gespeichert und wie lange?"] },
    { label: "Frage 5", fragen: ["Was machen Sie wenn eine Rechnung falsch war und korrigiert werden muss?"] },
  ],
  "2_2": [
    { label: "Frage 1", fragen: ["Wie erhalten Sie Rechnungen von Ihren Lieferanten? (per E-Mail, per Post, über ein Online-Portal)"] },
    { label: "Frage 2", fragen: ["Was passiert wenn eine Rechnung ankommt? Wer prüft sie und wer gibt sie frei?"] },
    { label: "Frage 3", fragen: ["Wie dokumentieren Sie dass eine Rechnung geprüft und freigegeben wurde?"] },
    { label: "Frage 4", fragen: ["Wo werden Ihre Eingangsrechnungen abgelegt? (Ordner, Cloud, Buchhaltungssoftware)"] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn Sie eine Rechnung erhalten die Sie nicht nachvollziehen können oder die falsch ist?"] },
  ],
  "2_3": [
    { label: "Frage 1", fragen: ["Welches Kassensystem nutzen Sie? (Name und Modell des Geräts oder der Software)"] },
    { label: "Frage 2", fragen: ["Wie läuft ein Kassiervorgang bei Ihnen ab?"] },
    { label: "Frage 3", fragen: ["Wie machen Sie den Tagesabschluss an der Kasse und wo werden die Tagesberichte gespeichert?"] },
    { label: "Frage 4", fragen: ["Wie gelangen die Kassendaten in Ihre Buchhaltung?"] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn die Kasse nicht stimmt - also wenn mehr oder weniger Geld in der Kasse ist als sie sein sollte?"] },
  ],
  "2_4": [
    { label: "Frage 1", fragen: ["Welche Zahlungsdienste nutzen Sie? (z. B. PayPal, Stripe, Klarna, SumUp)"] },
    { label: "Frage 2", fragen: ["Wie werden Zahlungseingänge über diese Dienste in Ihrer Buchhaltung erfasst?"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass keine Zahlung vergessen wird?"] },
    { label: "Frage 4", fragen: ["Wo werden die Abrechnungen und Belege dieser Zahlungsdienste gespeichert?"] },
    { label: "Frage 5", fragen: ["Was passiert wenn ein Kunde eine Zahlung zurückbucht (Chargeback)?"] },
  ],
  "2_5": [
    { label: "Frage 1", fragen: ["Über welche Plattformen verkaufen Sie? (z. B. Amazon, eBay, Etsy, eigener Onlineshop)"] },
    { label: "Frage 2", fragen: ["Wie werden Ihre Verkäufe von der Plattform in Ihre Buchhaltung übernommen?"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass alle Umsätze vollständig erfasst sind?"] },
    { label: "Frage 4", fragen: ["Wo werden die monatlichen Abrechnungen der Plattformen gespeichert?"] },
    { label: "Frage 5", fragen: ["Wie behandeln Sie Retouren und Erstattungen buchhalterisch?"] },
  ],
  "2_6": [
    { label: "Frage 1", fragen: ["Welche Dokumente erhalten Sie noch auf Papier und müssen daher eingescannt werden?"] },
    { label: "Frage 2", fragen: ["Womit scannen Sie diese Dokumente? (z. B. Smartphone-App, Scanner, Multifunktionsdrucker)"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass der Scan gut lesbar ist und dem Original entspricht?"] },
    { label: "Frage 4", fragen: ["Was passiert mit dem Papieroriginal nachdem es eingescannt wurde? Wird es aufbewahrt oder vernichtet?"] },
    { label: "Frage 5", fragen: ["Gibt es eine interne Regel wie Dokumente gescannt und benannt werden müssen?"] },
  ],
  "2_7": [
    { label: "Frage 1", fragen: ["Wie gelangen Belege in Ihre Buchhaltung? (werden sie manuell eingetragen oder automatisch importiert)"] },
    { label: "Frage 2", fragen: ["Wer bucht die Geschäftsvorfälle und wie oft? (täglich, wöchentlich, monatlich)"] },
    { label: "Frage 3", fragen: ["Wie wird kontrolliert ob Buchungen korrekt sind?"] },
    { label: "Frage 4", fragen: ["Wo werden Buchungsbelege und Journale aufbewahrt?"] },
    { label: "Frage 5", fragen: ["Wie werden regelmäßige Ausgaben behandelt die jeden Monat gleich sind? (z. B. Miete, Versicherungen)"] },
  ],
  "2_8": [
    { label: "Frage 1", fragen: ["Wie viele Geschäftskonten haben Sie und bei welcher Bank?"] },
    { label: "Frage 2", fragen: ["Wie rufen Sie Ihre Kontoauszüge ab? (Online-Banking, automatischer Import in Buchhaltungssoftware)"] },
    { label: "Frage 3", fragen: ["Wie werden Zahlungseingänge und -ausgänge den richtigen Rechnungen zugeordnet?"] },
    { label: "Frage 4", fragen: ["Wo werden Kontoauszüge und Zahlungsbelege archiviert?"] },
    { label: "Frage 5", fragen: ["Wie behalten Sie den Überblick über offene Rechnungen die noch nicht bezahlt wurden?"] },
  ],
  "2_9": [
    { label: "Frage 1", fragen: ["Wie viele Mitarbeiter haben Sie und in welchen Beschäftigungsformen? (Vollzeit, Teilzeit, Minijob)"] },
    { label: "Frage 2", fragen: ["Wer erstellt die Lohn- und Gehaltsabrechnungen? (intern oder externer Dienstleister)"] },
    { label: "Frage 3", fragen: ["Welche Software wird für die Lohnabrechnung genutzt?"] },
    { label: "Frage 4", fragen: ["Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt?"] },
    { label: "Frage 5", fragen: ["Wie werden Spesen und Reisekosten der Mitarbeiter abgerechnet?"] },
  ],

  // ── KAPITEL 3: Technische Systemdokumentation ──
  "3_1": [
    { label: "Frage 1", fragen: ["Welche Buchhaltungssoftware nutzen Sie? (Name und aktuelle Version)"] },
    { label: "Frage 2", fragen: ["Wer hat Zugriff auf die Software und welche Rechte haben die einzelnen Personen?"] },
    { label: "Frage 3", fragen: ["Wie werden Updates der Software durchgeführt und von wem?"] },
    { label: "Frage 4", fragen: ["Wo sind die Lizenzdaten und Zugangsdaten der Software sicher hinterlegt?"] },
    { label: "Frage 5", fragen: ["An wen wenden Sie sich wenn die Software nicht funktioniert?"] },
  ],
  "3_2": [
    { label: "Frage 1", fragen: ["Welche Programme tauschen bei Ihnen automatisch Daten aus? (z. B. Onlineshop → Buchhaltung, Kasse → DATEV)"] },
    { label: "Frage 2", fragen: ["Wie werden diese Daten übertragen? (automatisch im Hintergrund oder müssen Sie selbst einen Export/Import anstoßen)"] },
    { label: "Frage 3", fragen: ["Wie merken Sie wenn bei einer Datenübertragung etwas schiefgelaufen ist?"] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wie diese Verbindungen zwischen den Programmen eingerichtet sind?"] },
    { label: "Frage 5", fragen: ["Was tun Sie wenn eine Übertragung fehlschlägt?"] },
  ],
  "3_3": [
    { label: "Frage 1", fragen: ["Versenden oder empfangen Sie elektronische Rechnungen in einem strukturierten Format? (z. B. XRechnung, ZUGFeRD - das sind Rechnungen die maschinenlesbare Daten enthalten)"] },
    { label: "Frage 2", fragen: ["Welche Software nutzen Sie dafür?"] },
    { label: "Frage 3", fragen: ["Wie wird geprüft ob eine empfangene E-Rechnung korrekt und vollständig ist?"] },
    { label: "Frage 4", fragen: ["Wo werden E-Rechnungen im Originalformat gespeichert? (sie dürfen nicht in ein anderes Format umgewandelt werden)"] },
    { label: "Frage 5", fragen: ["Was passiert wenn eine E-Rechnung fehlerhaft ist?"] },
  ],
  "3_4": [
    { label: "Frage 1", fragen: ["Welche Online-Programme nutzen Sie für steuerrelevante Daten? (z. B. Google Drive, Dropbox, OneDrive, Cloud-Buchhaltung)"] },
    { label: "Frage 2", fragen: ["Wer hat Zugriff auf diese Programme und wie ist der Zugang gesichert? (z. B. Passwort + SMS-Code)"] },
    { label: "Frage 3", fragen: ["Wo werden Ihre Daten bei diesen Anbietern gespeichert? (möglichst in Deutschland oder der EU)"] },
    { label: "Frage 4", fragen: ["Was passiert mit Ihren Daten wenn Sie den Anbieter wechseln oder kündigen?"] },
    { label: "Frage 5", fragen: ["Haben Sie mit diesen Anbietern einen Vertrag zum Datenschutz abgeschlossen? (Auftragsverarbeitungsvertrag)"] },
  ],
  "3_5": [
    { label: "Frage 1", fragen: ["Welches E-Mail-Programm nutzen Sie geschäftlich? (z. B. Outlook, Gmail, Apple Mail)"] },
    { label: "Frage 2", fragen: ["Wie gehen Sie mit Rechnungen und Verträgen um die per E-Mail ankommen?"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass wichtige geschäftliche E-Mails nicht verloren gehen und für 10 Jahre abrufbar sind?"] },
    { label: "Frage 4", fragen: ["Wo werden archivierte E-Mails gespeichert?"] },
    { label: "Frage 5", fragen: ["Wie wird verhindert dass archivierte E-Mails nachträglich verändert oder gelöscht werden können?"] },
  ],
  "3_6": [
    { label: "Frage 1", fragen: ["Welche Zahlungsplattformen sind technisch in Ihre Systeme eingebunden? (z. B. PayPal-API, Stripe-Integration)"] },
    { label: "Frage 2", fragen: ["Wie werden Transaktionsdaten von diesen Plattformen automatisch in Ihre Buchhaltung übernommen?"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass alle Transaktionen vollständig und korrekt übertragen wurden?"] },
    { label: "Frage 4", fragen: ["Wo werden die technischen Protokolle und Transaktionsaufzeichnungen gespeichert?"] },
    { label: "Frage 5", fragen: ["Wie erkennen Sie wenn Daten zwischen der Plattform und Ihrer Buchhaltung nicht übereinstimmen?"] },
  ],

  // ── KAPITEL 4: Betriebsdokumentation ──
  "4_1": [
    { label: "Frage 1", fragen: ["Wie oft werden Ihre geschäftlichen Daten gesichert? (täglich, wöchentlich)"] },
    { label: "Frage 2", fragen: ["Was genau wird gesichert? (Buchhaltungsdaten, E-Mails, Dokumente)"] },
    { label: "Frage 3", fragen: ["Wer ist dafür verantwortlich dass die Datensicherung regelmäßig durchgeführt wird?"] },
    { label: "Frage 4", fragen: ["Wo werden die Sicherungskopien aufbewahrt? (externe Festplatte, Cloud, zweiter Standort)"] },
    { label: "Frage 5", fragen: ["Werden die Sicherungen regelmäßig getestet ob sie im Notfall auch wirklich funktionieren?"] },
  ],
  "4_2": [
    { label: "Frage 1", fragen: ["Was würden Sie tun wenn Ihr Computer oder Server komplett ausfällt? Haben Sie einen Plan?"] },
    { label: "Frage 2", fragen: ["Wie lange würde es dauern bis Ihr Betrieb nach einem Totalausfall wieder läuft?"] },
    { label: "Frage 3", fragen: ["Wer ist verantwortlich wenn Daten wiederhergestellt werden müssen?"] },
    { label: "Frage 4", fragen: ["Wo ist beschrieben wie die Datenwiederherstellung Schritt für Schritt funktioniert?"] },
    { label: "Frage 5", fragen: ["Haben Sie die Wiederherstellung schon einmal probeweise getestet?"] },
  ],
  "4_3": [
    { label: "Frage 1", fragen: ["Wie werden Updates Ihrer Programme durchgeführt? (automatisch oder manuell)"] },
    { label: "Frage 2", fragen: ["Wer entscheidet wann ein größeres Update oder ein Programm-Wechsel durchgeführt wird?"] },
    { label: "Frage 3", fragen: ["Wie dokumentieren Sie welche Programme in welcher Version eingesetzt werden?"] },
    { label: "Frage 4", fragen: ["Wie stellen Sie sicher dass nach einem Update alle Daten noch korrekt sind?"] },
    { label: "Frage 5", fragen: ["Testen Sie größere Updates zuerst bevor Sie sie produktiv einsetzen?"] },
  ],
  "4_4": [
    { label: "Frage 1", fragen: ["Wissen Sie welche Unterlagen Sie wie lange aufbewahren müssen? (Rechnungen 10 Jahre, Geschäftsbriefe 6 Jahre)"] },
    { label: "Frage 2", fragen: ["In welchem Format werden Ihre Unterlagen langfristig archiviert? (PDF, Original-Dateiformat)"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass Sie in 10 Jahren noch auf archivierte Daten zugreifen können?"] },
    { label: "Frage 4", fragen: ["Wo befinden sich Ihre Archive? (physisch und digital)"] },
    { label: "Frage 5", fragen: ["Wie werden Dokumente vernichtet wenn die Aufbewahrungsfrist abgelaufen ist?"] },
  ],
  "4_5": [
    { label: "Frage 1", fragen: ["Wenn das Finanzamt bei einer Prüfung Ihre Daten einsehen möchte: Wer ist Ihr Ansprechpartner dafür? (Name und Telefonnummer)"] },
    { label: "Frage 2", fragen: ["Kann ein Betriebsprüfer direkt in Ihre Buchhaltungssoftware schauen? Oder müssen Sie Daten exportieren?"] },
    { label: "Frage 3", fragen: ["Können Sie auf Anfrage alle Buchungsdaten in einer Datei exportieren die das Finanzamt einlesen kann?"] },
    { label: "Frage 4", fragen: ["Wie schnell können Sie angefragte Daten bereitstellen?"] },
    { label: "Frage 5", fragen: ["Wer begleitet eine Betriebsprüfung in Ihrem Unternehmen?"] },
  ],
  "4_6": [
    { label: "Frage 1", fragen: ["Wie werden Änderungen an wichtigen Prozessen in Ihrem Unternehmen festgehalten?"] },
    { label: "Frage 2", fragen: ["Wer muss zustimmen bevor ein wichtiger Prozess oder ein IT-System geändert wird?"] },
    { label: "Frage 3", fragen: ["Gibt es ein Protokoll in dem alle Änderungen mit Datum und Grund dokumentiert sind?"] },
    { label: "Frage 4", fragen: ["Wo werden alte Versionen von Dokumenten und Prozessbeschreibungen aufbewahrt?"] },
    { label: "Frage 5", fragen: ["Wie werden alle betroffenen Mitarbeiter über Änderungen informiert?"] },
  ],
  "4_7": [
    { label: "Frage 1", fragen: ["Welche Papier-Dokumente scannen oder fotografieren Sie ein?"] },
    { label: "Frage 2", fragen: ["Wie gehen Sie dabei vor? (Smartphone-App, Scanner, welches Gerät genau)"] },
    { label: "Frage 3", fragen: ["Wie stellen Sie sicher dass der Scan wirklich gut lesbar ist und alles drauf ist?"] },
    { label: "Frage 4", fragen: ["Bewahren Sie das Papier-Original nach dem Scannen noch auf oder vernichten Sie es?"] },
    { label: "Frage 5", fragen: ["Gibt es bei Ihnen eine Regel wie Scans gespeichert und benannt werden müssen?"] },
  ],

  // ── KAPITEL 5: Internes Kontrollsystem ──
  "5_1": [
    { label: "Frage 1", fragen: ["Wer hat bei Ihnen Zugriff auf welche Programme und Daten? (Buchhaltung, Online-Banking, CRM)"] },
    { label: "Frage 2", fragen: ["Wie werden neue Zugänge eingerichtet und wie werden sie wieder gesperrt wenn jemand das Unternehmen verlässt?"] },
    { label: "Frage 3", fragen: ["Wird regelmäßig geprüft ob jeder noch die richtigen Zugriffsrechte hat?"] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wer welche Zugriffsrechte hat?"] },
    { label: "Frage 5", fragen: ["Gilt bei Ihnen das Prinzip dass jeder nur auf das zugreifen kann was er für seine Arbeit wirklich braucht?"] },
  ],
  "5_2": [
    { label: "Frage 1", fragen: ["Welche Vorgänge müssen bei Ihnen von jemandem freigegeben werden? (z. B. Rechnungen bezahlen, Verträge unterschreiben)"] },
    { label: "Frage 2", fragen: ["Wer darf was freigeben und gibt es Betragsgrenzen? (z. B. bis 1.000 € darf Mitarbeiter X freigeben)"] },
    { label: "Frage 3", fragen: ["Wie wird dokumentiert dass eine Freigabe erteilt wurde?"] },
    { label: "Frage 4", fragen: ["Wo werden Freigabe-Protokolle aufbewahrt?"] },
    { label: "Frage 5", fragen: ["Bei welchen Vorgängen müssen immer zwei Personen zustimmen?"] },
  ],
  "5_3": [
    { label: "Frage 1", fragen: ["Welche automatischen Prüfungen führt Ihre Software durch? (z. B. Warnung bei doppelten Rechnungen, falsche Steuersätze)"] },
    { label: "Frage 2", fragen: ["Wie werden Auffälligkeiten oder Fehler in der Buchhaltung erkannt?"] },
    { label: "Frage 3", fragen: ["Was passiert wenn eine automatische Prüfung anschlägt? Wer wird informiert?"] },
    { label: "Frage 4", fragen: ["Wo werden die Ergebnisse dieser Prüfungen gespeichert?"] },
    { label: "Frage 5", fragen: ["Wie oft werden manuell Stichproben durchgeführt um die Richtigkeit der Daten zu prüfen?"] },
  ],
  "5_4": [
    { label: "Frage 1", fragen: ["Wer trägt in Ihrem Unternehmen die Gesamtverantwortung dafür dass die Buchhaltung korrekt und GoBD-konform ist?"] },
    { label: "Frage 2", fragen: ["Wie sind Kontrollaufgaben auf verschiedene Personen verteilt?"] },
    { label: "Frage 3", fragen: ["Wie wird überwacht ob die internen Kontrollen auch wirklich eingehalten werden?"] },
    { label: "Frage 4", fragen: ["Wo ist dokumentiert wer für welche Kontrollen zuständig ist?"] },
    { label: "Frage 5", fragen: ["Wie werden neue Mitarbeiter in die internen Kontrollprozesse eingewiesen?"] },
  ],
  "5_5": [
    { label: "Frage 1", fragen: ["Wie werden Fehler in der Buchhaltung erkannt? (z. B. durch Software-Prüfungen, Steuerberater, eigene Kontrollen)"] },
    { label: "Frage 2", fragen: ["Was passiert wenn ein Buchungsfehler entdeckt wird? Wie wird er korrigiert?"] },
    { label: "Frage 3", fragen: ["Wer muss bei einem schwerwiegenden Fehler informiert werden?"] },
    { label: "Frage 4", fragen: ["Wie wird sichergestellt dass ein Fehler nicht nochmal passiert?"] },
    { label: "Frage 5", fragen: ["Wie werden Korrekturen dokumentiert damit später nachvollziehbar ist was geändert wurde und warum?"] },
  ],
};

/** Flat version for backward compatibility */
export const CHAPTER_LEITFRAGEN: Record<string, string[]> = Object.fromEntries(
  Object.entries(CHAPTER_LEITFRAGEN_BLOCKS).map(([key, blocks]) => [
    key,
    blocks.flatMap((b) => b.fragen),
  ])
);
