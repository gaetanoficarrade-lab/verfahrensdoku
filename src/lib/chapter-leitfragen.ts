// Leitfragen für alle 30 Unterkapitel der GoBD-Verfahrensdokumentation
// Struktur: Auslöser → Durchführung → Nachweis → Aufbewahrung

export const CHAPTER_LEITFRAGEN: Record<string, string[]> = {
  // KAPITEL 1: Allgemeine Beschreibung
  "1_1": [
    "Beschreiben Sie Ihre Kerntätigkeit.",
    "Wie entsteht ein Auftrag bei Ihnen?",
    "Wie wird der Preis vereinbart?",
    "Wie bewahren Sie Nachweise über Aufträge auf?",
  ],
  "1_2": [
    "Wie ist Ihr Unternehmen organisatorisch aufgebaut?",
    "Welche Abteilungen oder Bereiche gibt es?",
    "Gibt es ein Organigramm oder eine Übersicht der Struktur?",
    "Wo ist die aktuelle Organisationsstruktur dokumentiert?",
  ],
  "1_3": [
    "Wer ist für die Buchhaltung verantwortlich?",
    "Wer hat Zugriff auf steuerrelevante Daten und Systeme?",
    "Wie sind Vertretungsregelungen organisiert?",
    "Wo sind Zuständigkeiten schriftlich festgehalten?",
  ],
  "1_4": [
    "Nach welchen Grundsätzen wird Ihre Buchhaltung geführt?",
    "Welchen Kontenrahmen verwenden Sie (z. B. SKR03, SKR04)?",
    "Wie stellen Sie die Vollständigkeit der Buchführung sicher?",
    "Wer überprüft die Einhaltung der Buchführungsgrundsätze?",
  ],
  "1_5": [
    "Wer ist für die Pflege dieser Verfahrensdokumentation zuständig?",
    "In welchem Rhythmus wird die Dokumentation überprüft?",
    "Wie werden Änderungen an Prozessen in der Dokumentation nachgeführt?",
    "Wo wird die jeweils aktuelle Version der Dokumentation aufbewahrt?",
  ],

  // KAPITEL 2: Anwenderdokumentation
  "2_1": [
    "Wie entsteht eine Ausgangsrechnung in Ihrem Unternehmen?",
    "Welche Software nutzen Sie zur Rechnungserstellung?",
    "Wie stellen Sie sicher, dass Rechnungen fortlaufend nummeriert sind?",
    "Wo werden erstellte Rechnungen gespeichert und archiviert?",
  ],
  "2_2": [
    "Auf welchem Weg erhalten Sie Eingangsrechnungen?",
    "Was passiert als Erstes, wenn eine Rechnung eintrifft?",
    "Wo wird die Rechnung gespeichert?",
    "Wie finden Sie eine alte Rechnung wieder?",
  ],
  "2_3": [
    "Wie läuft ein Kassiervorgang ab?",
    "Wie machen Sie den Tagesabschluss?",
    "Wie gelangen Kassendaten in die Buchhaltung?",
    "Wo werden Kassendaten und -belege aufbewahrt?",
  ],
  "2_4": [
    "Welche Zahlungsanbieter setzen Sie ein (z. B. PayPal, Stripe, Klarna)?",
    "Wie werden Zahlungseingänge über diese Anbieter erfasst?",
    "Wie erfolgt der Abgleich mit Ihrer Buchhaltung?",
    "Wo werden Transaktionsbelege der Zahlungsanbieter archiviert?",
  ],
  "2_5": [
    "Über welche Marktplätze oder Plattformen verkaufen Sie?",
    "Wie werden Verkaufsdaten von der Plattform übernommen?",
    "Wie stellen Sie die Vollständigkeit der Umsatzerfassung sicher?",
    "Wo werden Plattform-Abrechnungen und -Berichte archiviert?",
  ],
  "2_6": [
    "Welche Belege werden gescannt oder digitalisiert?",
    "Welches Gerät oder welche Software nutzen Sie zum Scannen?",
    "Wie stellen Sie sicher, dass das Digitalisat dem Original entspricht?",
    "Was passiert mit dem Papieroriginal nach dem Scannen?",
  ],
  "2_7": [
    "Wie gelangen Belege in Ihre Buchhaltung?",
    "Wer verbucht die Geschäftsvorfälle?",
    "Wie wird die Richtigkeit der Buchungen überprüft?",
    "In welchem Rhythmus werden Buchungen vorgenommen?",
  ],
  "2_8": [
    "Wie viele Geschäftskonten haben Sie und bei welchen Banken?",
    "Wie werden Kontoauszüge abgerufen und verarbeitet?",
    "Wie erfolgt der Abgleich zwischen Bankbewegungen und Buchhaltung?",
    "Wo werden Kontoauszüge und Zahlungsbelege archiviert?",
  ],
  "2_9": [
    "Wie viele Mitarbeiter beschäftigen Sie?",
    "Welche Software nutzen Sie für die Lohn- und Gehaltsabrechnung?",
    "Wie gelangen Lohndaten in die Finanzbuchhaltung?",
    "Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt?",
  ],

  // KAPITEL 3: Technische Systemdokumentation
  "3_1": [
    "Welche Buchhaltungssoftware setzen Sie ein?",
    "Wer hat Zugriff auf die Software und mit welchen Berechtigungen?",
    "Wie werden Updates und Versionsänderungen durchgeführt?",
    "Wo werden die Stammdaten und Einstellungen der Software dokumentiert?",
  ],
  "3_2": [
    "Welche Systeme sind an Ihre Buchhaltung angebunden?",
    "Wie werden Daten zwischen den Systemen übertragen?",
    "Wie stellen Sie die Fehlerfreiheit der Schnittstellen sicher?",
    "Wo ist die Schnittstellenkonfiguration dokumentiert?",
  ],
  "3_3": [
    "Versenden oder empfangen Sie E-Rechnungen (z. B. ZUGFeRD, XRechnung)?",
    "Welche Software nutzen Sie für E-Rechnungen?",
    "Wie werden E-Rechnungen validiert und verarbeitet?",
    "Wo werden E-Rechnungen im Originalformat archiviert?",
  ],
  "3_4": [
    "Welche Cloud- oder SaaS-Lösungen nutzen Sie für steuerrelevante Daten?",
    "Wo werden die Daten gespeichert (Serverstandort)?",
    "Wie ist der Zugriff auf die Cloud-Daten geregelt?",
    "Wie stellen Sie die Datenverfügbarkeit und -sicherheit sicher?",
  ],
  "3_5": [
    "Welches E-Mail-System nutzen Sie geschäftlich?",
    "Wie werden steuerrelevante E-Mails identifiziert?",
    "Wie werden diese E-Mails archiviert?",
    "Wie lange werden E-Mails aufbewahrt?",
  ],
  "3_6": [
    "Welche Zahlungsplattformen sind technisch angebunden?",
    "Wie werden Transaktionsdaten von den Plattformen übernommen?",
    "Wie wird die Datenintegrität bei der Übertragung sichergestellt?",
    "Wo werden technische Protokolle und Transaktionslogs gespeichert?",
  ],

  // KAPITEL 4: Betriebsdokumentation
  "4_1": [
    "Wie oft werden Datensicherungen durchgeführt?",
    "Welche Daten sind in der Sicherung enthalten?",
    "Wo werden Sicherungskopien aufbewahrt?",
    "Wer ist für die Durchführung der Datensicherung verantwortlich?",
  ],
  "4_2": [
    "Wie ist der Ablauf einer Datenwiederherstellung geregelt?",
    "Werden Wiederherstellungen regelmäßig getestet?",
    "Wie schnell kann im Notfall ein Betrieb wiederhergestellt werden?",
    "Wo ist der Wiederherstellungsplan dokumentiert?",
  ],
  "4_3": [
    "Wie werden Systemänderungen und Updates geplant und freigegeben?",
    "Wer ist für die Durchführung von Updates verantwortlich?",
    "Wie werden Änderungen an der Software dokumentiert?",
    "Wie wird sichergestellt, dass Updates keine Daten beeinträchtigen?",
  ],
  "4_4": [
    "Welche Aufbewahrungsfristen gelten für Ihre steuerrelevanten Unterlagen?",
    "In welchem Format werden Daten langfristig archiviert?",
    "Wie stellen Sie die Lesbarkeit der archivierten Daten sicher?",
    "Wo befinden sich die Archive (physisch und digital)?",
  ],
  "4_5": [
    "Wie wird der Datenzugriff der Finanzverwaltung technisch ermöglicht?",
    "Welche Zugriffsarten können Sie bereitstellen (Z1, Z2, Z3)?",
    "Wer ist im Unternehmen Ansprechpartner für Betriebsprüfungen?",
    "Wie schnell können angeforderte Daten bereitgestellt werden?",
  ],
  "4_6": [
    "Wie werden Änderungen an Prozessen und Systemen versioniert?",
    "Gibt es ein Änderungsprotokoll oder Changelog?",
    "Wer genehmigt Änderungen an steuerrelevanten Verfahren?",
    "Wo werden alte Versionen der Dokumentation aufbewahrt?",
  ],
  "4_7": [
    "Welche Papierbelege werden digitalisiert?",
    "Welches Verfahren nutzen Sie zur Digitalisierung?",
    "Wie stellen Sie die bildliche Übereinstimmung sicher?",
    "Was geschieht mit den Originalen nach der Digitalisierung?",
  ],

  // KAPITEL 5: Internes Kontrollsystem
  "5_1": [
    "Welche Berechtigungskonzepte gibt es für Ihre IT-Systeme?",
    "Wie werden Berechtigungen vergeben und entzogen?",
    "Wie oft werden Berechtigungen überprüft?",
    "Wo ist das Berechtigungskonzept dokumentiert?",
  ],
  "5_2": [
    "Welche Freigabeprozesse gibt es (z. B. für Rechnungen, Zahlungen)?",
    "Wer hat welche Freigabekompetenzen?",
    "Wie werden Freigaben dokumentiert und nachvollzogen?",
    "Gibt es Wertgrenzen für unterschiedliche Freigabestufen?",
  ],
  "5_3": [
    "Welche automatischen Plausibilitätsprüfungen sind eingerichtet?",
    "Wie werden Abweichungen oder Auffälligkeiten erkannt?",
    "Was passiert, wenn eine Plausibilitätsprüfung fehlschlägt?",
    "Wo werden Ergebnisse der Prüfungen protokolliert?",
  ],
  "5_4": [
    "Wer trägt die Gesamtverantwortung für das interne Kontrollsystem?",
    "Wie sind die Kontrollverantwortlichkeiten verteilt?",
    "Wie wird die Einhaltung der Kontrollen überwacht?",
    "Wo sind die Kontrollverantwortlichkeiten dokumentiert?",
  ],
  "5_5": [
    "Wie wird mit Fehlern in der Buchführung umgegangen?",
    "Wie werden Korrekturbuchungen dokumentiert?",
    "An wen werden schwerwiegende Fehler eskaliert?",
    "Wie wird sichergestellt, dass Fehler nicht wiederholt auftreten?",
  ],
};
