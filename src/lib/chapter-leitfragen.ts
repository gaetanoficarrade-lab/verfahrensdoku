// Leitfragen für alle 30 Unterkapitel der GoBD-Verfahrensdokumentation
// Struktur pro Kapitel: Auslöser → Durchführung → Nachweis → Aufbewahrung (+ Zusatzfrage)

export interface LeitfragenBlock {
  label: string;
  fragen: string[];
}

export const CHAPTER_LEITFRAGEN_BLOCKS: Record<string, LeitfragenBlock[]> = {
  // ── KAPITEL 1: Allgemeine Beschreibung ──
  "1_1": [
    { label: "Auslöser", fragen: ["Was ist die Kerntätigkeit Ihres Unternehmens und wie entstehen Ihre Geschäftsvorfälle?"] },
    { label: "Durchführung", fragen: ["Wie läuft ein typischer Auftrag von der Anfrage bis zur Fertigstellung ab?"] },
    { label: "Nachweis", fragen: ["Welche Dokumente belegen Ihre Geschäftstätigkeit (z. B. Verträge, Angebote, Lieferscheine)?"] },
    { label: "Aufbewahrung", fragen: ["Wo und wie lange bewahren Sie diese Nachweise auf?"] },
    { label: "Zusatz", fragen: ["Welche Rechtsform hat Ihr Unternehmen und seit wann besteht es?"] },
  ],
  "1_2": [
    { label: "Auslöser", fragen: ["Wie ist Ihr Unternehmen organisatorisch aufgebaut (Abteilungen, Standorte)?"] },
    { label: "Durchführung", fragen: ["Wie werden Aufgaben und Kompetenzen zwischen den Bereichen verteilt?"] },
    { label: "Nachweis", fragen: ["Gibt es ein Organigramm oder eine dokumentierte Aufbauorganisation?"] },
    { label: "Aufbewahrung", fragen: ["Wo wird die aktuelle Organisationsstruktur gepflegt und archiviert?"] },
    { label: "Zusatz", fragen: ["Wie oft wird die Organisationsstruktur überprüft und angepasst?"] },
  ],
  "1_3": [
    { label: "Auslöser", fragen: ["Wer ist für die Buchführung und steuerrelevante Prozesse verantwortlich?"] },
    { label: "Durchführung", fragen: ["Wie sind Vertretungsregelungen und Zugriffsrechte organisiert?"] },
    { label: "Nachweis", fragen: ["Wo sind Zuständigkeiten und Berechtigungen schriftlich dokumentiert?"] },
    { label: "Aufbewahrung", fragen: ["Wie werden Änderungen an Zuständigkeiten nachvollziehbar festgehalten?"] },
    { label: "Zusatz", fragen: ["Wer hat Zugriff auf steuerrelevante Daten und IT-Systeme?"] },
  ],
  "1_4": [
    { label: "Auslöser", fragen: ["Nach welchen Grundsätzen wird Ihre Buchhaltung geführt (z. B. Soll/Ist-Versteuerung)?"] },
    { label: "Durchführung", fragen: ["Welchen Kontenrahmen verwenden Sie und wie stellen Sie die Vollständigkeit sicher?"] },
    { label: "Nachweis", fragen: ["Wer überprüft die Einhaltung der Buchführungsgrundsätze?"] },
    { label: "Aufbewahrung", fragen: ["Wo sind Ihre Buchführungsrichtlinien und Kontenpläne hinterlegt?"] },
    { label: "Zusatz", fragen: ["Wie wird mit Abweichungen vom regulären Buchungsablauf umgegangen?"] },
  ],
  "1_5": [
    { label: "Auslöser", fragen: ["Wer ist für die Pflege dieser Verfahrensdokumentation zuständig?"] },
    { label: "Durchführung", fragen: ["In welchem Rhythmus wird die Dokumentation überprüft und aktualisiert?"] },
    { label: "Nachweis", fragen: ["Wie werden Änderungen an Prozessen in der Dokumentation nachgeführt?"] },
    { label: "Aufbewahrung", fragen: ["Wo wird die jeweils aktuelle Version der Dokumentation aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Gibt es ein Versionierungssystem für die Verfahrensdokumentation?"] },
  ],

  // ── KAPITEL 2: Anwenderdokumentation ──
  "2_1": [
    { label: "Auslöser", fragen: ["Wann und wie entsteht eine Ausgangsrechnung in Ihrem Unternehmen?"] },
    { label: "Durchführung", fragen: ["Welche Software nutzen Sie und wie stellen Sie fortlaufende Nummerierung sicher?"] },
    { label: "Nachweis", fragen: ["Wie werden Rechnungen dem zugehörigen Auftrag zugeordnet?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden erstellte Rechnungen gespeichert und wie lange archiviert?"] },
    { label: "Zusatz", fragen: ["Wie gehen Sie mit Stornos oder Korrekturrechnungen um?"] },
  ],
  "2_2": [
    { label: "Auslöser", fragen: ["Auf welchem Weg erhalten Sie Eingangsrechnungen (Post, E-Mail, Portal)?"] },
    { label: "Durchführung", fragen: ["Was passiert als Erstes, wenn eine Rechnung eintrifft? Wer prüft sie?"] },
    { label: "Nachweis", fragen: ["Wie dokumentieren Sie die Freigabe einer Eingangsrechnung?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Eingangsrechnungen gespeichert und wie finden Sie sie wieder?"] },
    { label: "Zusatz", fragen: ["Wie gehen Sie mit Mahnungen oder strittigen Rechnungen um?"] },
  ],
  "2_3": [
    { label: "Auslöser", fragen: ["Wie läuft ein typischer Kassiervorgang ab?"] },
    { label: "Durchführung", fragen: ["Wie führen Sie den Tagesabschluss durch und wie gelangen Kassendaten in die Buchhaltung?"] },
    { label: "Nachweis", fragen: ["Welches Kassensystem verwenden Sie und ist es GoBD-konform (TSE)?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Kassendaten, Z-Bons und Belege aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Wie gehen Sie mit Kassendifferenzen um?"] },
  ],
  "2_4": [
    { label: "Auslöser", fragen: ["Welche Zahlungsanbieter setzen Sie ein (z. B. PayPal, Stripe, Klarna)?"] },
    { label: "Durchführung", fragen: ["Wie werden Zahlungseingänge über diese Anbieter erfasst und abgeglichen?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie die Vollständigkeit der Zahlungserfassung sicher?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Transaktionsbelege und Abrechnungen der Anbieter archiviert?"] },
    { label: "Zusatz", fragen: ["Wie gehen Sie mit Rückbuchungen oder Chargebacks um?"] },
  ],
  "2_5": [
    { label: "Auslöser", fragen: ["Über welche Marktplätze oder Plattformen verkaufen Sie (z. B. Amazon, eBay)?"] },
    { label: "Durchführung", fragen: ["Wie werden Verkaufsdaten von der Plattform übernommen und verbucht?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie die Vollständigkeit der Umsatzerfassung pro Plattform sicher?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Plattform-Abrechnungen und Transaktionsberichte archiviert?"] },
    { label: "Zusatz", fragen: ["Wie behandeln Sie Retouren und Gutschriften von Marktplätzen?"] },
  ],
  "2_6": [
    { label: "Auslöser", fragen: ["Welche Belege werden gescannt oder digitalisiert?"] },
    { label: "Durchführung", fragen: ["Welches Gerät oder welche Software nutzen Sie zum Scannen?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie sicher, dass das Digitalisat dem Original entspricht (bildliche Übereinstimmung)?"] },
    { label: "Aufbewahrung", fragen: ["Was passiert mit dem Papieroriginal nach dem Scannen?"] },
    { label: "Zusatz", fragen: ["Gibt es eine Verfahrensdokumentation zum ersetzenden Scannen?"] },
  ],
  "2_7": [
    { label: "Auslöser", fragen: ["Wie gelangen Belege in Ihre Buchhaltung (automatisch, manuell)?"] },
    { label: "Durchführung", fragen: ["Wer verbucht die Geschäftsvorfälle und in welchem Rhythmus?"] },
    { label: "Nachweis", fragen: ["Wie wird die Richtigkeit der Buchungen überprüft (4-Augen-Prinzip)?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Buchungsbelege und Journale aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Wie werden wiederkehrende Buchungen (Miete, Gehälter) behandelt?"] },
  ],
  "2_8": [
    { label: "Auslöser", fragen: ["Wie viele Geschäftskonten haben Sie und bei welchen Banken?"] },
    { label: "Durchführung", fragen: ["Wie werden Kontoauszüge abgerufen und mit der Buchhaltung abgeglichen?"] },
    { label: "Nachweis", fragen: ["Wie dokumentieren Sie den Abgleich von Bank und Buchhaltung?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Kontoauszüge und Zahlungsbelege archiviert?"] },
    { label: "Zusatz", fragen: ["Wie werden offene Posten überwacht und geklärt?"] },
  ],
  "2_9": [
    { label: "Auslöser", fragen: ["Wie viele Mitarbeiter beschäftigen Sie und welche Beschäftigungsformen gibt es?"] },
    { label: "Durchführung", fragen: ["Welche Software nutzen Sie für die Lohn- und Gehaltsabrechnung?"] },
    { label: "Nachweis", fragen: ["Wie gelangen Lohndaten in die Finanzbuchhaltung?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Lohnabrechnungen und Personalunterlagen aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Wie werden Reisekosten und Spesen abgerechnet?"] },
  ],

  // ── KAPITEL 3: Technische Systemdokumentation ──
  "3_1": [
    { label: "Auslöser", fragen: ["Welche Buchhaltungssoftware setzen Sie ein (Name, Version)?"] },
    { label: "Durchführung", fragen: ["Wer hat Zugriff auf die Software und mit welchen Berechtigungsstufen?"] },
    { label: "Nachweis", fragen: ["Wie werden Updates und Versionsänderungen dokumentiert?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden die Stammdaten, Einstellungen und Lizenzdokumente der Software aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Wie ist der Support für die Software geregelt?"] },
  ],
  "3_2": [
    { label: "Auslöser", fragen: ["Welche Systeme sind an Ihre Buchhaltung angebunden (ERP, Kasse, Shop)?"] },
    { label: "Durchführung", fragen: ["Wie werden Daten zwischen den Systemen übertragen (API, Export/Import)?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie die Fehlerfreiheit und Vollständigkeit der Schnittstellen sicher?"] },
    { label: "Aufbewahrung", fragen: ["Wo ist die Schnittstellenkonfiguration dokumentiert?"] },
    { label: "Zusatz", fragen: ["Wie werden Schnittstellenfehler erkannt und behoben?"] },
  ],
  "3_3": [
    { label: "Auslöser", fragen: ["Versenden oder empfangen Sie E-Rechnungen (z. B. ZUGFeRD, XRechnung)?"] },
    { label: "Durchführung", fragen: ["Welche Software nutzen Sie für die Erstellung und Verarbeitung von E-Rechnungen?"] },
    { label: "Nachweis", fragen: ["Wie werden E-Rechnungen validiert (Formatprüfung, Signaturprüfung)?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden E-Rechnungen im Originalformat unveränderbar archiviert?"] },
    { label: "Zusatz", fragen: ["Wie gehen Sie mit fehlerhaften E-Rechnungen um?"] },
  ],
  "3_4": [
    { label: "Auslöser", fragen: ["Welche Cloud- oder SaaS-Lösungen nutzen Sie für steuerrelevante Daten?"] },
    { label: "Durchführung", fragen: ["Wie ist der Zugriff auf die Cloud-Daten geregelt (Berechtigungen, 2FA)?"] },
    { label: "Nachweis", fragen: ["Wo werden die Daten gespeichert (Serverstandort, Zertifizierungen)?"] },
    { label: "Aufbewahrung", fragen: ["Wie stellen Sie die Datenverfügbarkeit und Portabilität bei Anbieterwechsel sicher?"] },
    { label: "Zusatz", fragen: ["Gibt es einen Auftragsverarbeitungsvertrag (AVV) mit dem Cloud-Anbieter?"] },
  ],
  "3_5": [
    { label: "Auslöser", fragen: ["Welches E-Mail-System nutzen Sie geschäftlich?"] },
    { label: "Durchführung", fragen: ["Wie werden steuerrelevante E-Mails identifiziert und behandelt?"] },
    { label: "Nachweis", fragen: ["Wie werden diese E-Mails GoBD-konform archiviert?"] },
    { label: "Aufbewahrung", fragen: ["Wie lange werden E-Mails aufbewahrt und wo befindet sich das Archiv?"] },
    { label: "Zusatz", fragen: ["Wie wird sichergestellt, dass archivierte E-Mails nicht verändert werden können?"] },
  ],
  "3_6": [
    { label: "Auslöser", fragen: ["Welche Zahlungsplattformen sind technisch an Ihre Systeme angebunden?"] },
    { label: "Durchführung", fragen: ["Wie werden Transaktionsdaten von den Plattformen automatisch übernommen?"] },
    { label: "Nachweis", fragen: ["Wie wird die Datenintegrität bei der Übertragung sichergestellt?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden technische Protokolle und Transaktionslogs gespeichert?"] },
    { label: "Zusatz", fragen: ["Wie werden Abweichungen zwischen Plattform- und Buchhaltungsdaten erkannt?"] },
  ],

  // ── KAPITEL 4: Betriebsdokumentation ──
  "4_1": [
    { label: "Auslöser", fragen: ["Wie oft und wann werden Datensicherungen durchgeführt?"] },
    { label: "Durchführung", fragen: ["Welche Daten sind in der Sicherung enthalten und wer führt sie durch?"] },
    { label: "Nachweis", fragen: ["Wie wird protokolliert, dass die Sicherung erfolgreich war?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Sicherungskopien aufbewahrt (Ort, Medium, Verschlüsselung)?"] },
    { label: "Zusatz", fragen: ["Gibt es eine Aufbewahrung an einem zweiten Standort (Offsite-Backup)?"] },
  ],
  "4_2": [
    { label: "Auslöser", fragen: ["Wann wird eine Datenwiederherstellung notwendig?"] },
    { label: "Durchführung", fragen: ["Wie ist der Ablauf einer Wiederherstellung geregelt und wer ist verantwortlich?"] },
    { label: "Nachweis", fragen: ["Werden Wiederherstellungen regelmäßig getestet und dokumentiert?"] },
    { label: "Aufbewahrung", fragen: ["Wo ist der Wiederherstellungsplan (Disaster Recovery) dokumentiert?"] },
    { label: "Zusatz", fragen: ["Wie schnell kann im Notfall der Betrieb wiederhergestellt werden (RTO)?"] },
  ],
  "4_3": [
    { label: "Auslöser", fragen: ["Wie werden Systemänderungen und Updates geplant und freigegeben?"] },
    { label: "Durchführung", fragen: ["Wer ist für die Durchführung von Updates verantwortlich?"] },
    { label: "Nachweis", fragen: ["Wie werden Änderungen an der Software dokumentiert (Changelog)?"] },
    { label: "Aufbewahrung", fragen: ["Wie wird sichergestellt, dass Updates keine steuerrelevanten Daten beeinträchtigen?"] },
    { label: "Zusatz", fragen: ["Gibt es eine Testumgebung vor der Produktivnahme von Updates?"] },
  ],
  "4_4": [
    { label: "Auslöser", fragen: ["Welche Aufbewahrungsfristen gelten für Ihre steuerrelevanten Unterlagen (6/10 Jahre)?"] },
    { label: "Durchführung", fragen: ["In welchem Format werden Daten langfristig archiviert?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie die Lesbarkeit und maschinelle Auswertbarkeit über die gesamte Aufbewahrungsfrist sicher?"] },
    { label: "Aufbewahrung", fragen: ["Wo befinden sich die Archive (physisch und digital)?"] },
    { label: "Zusatz", fragen: ["Wie werden Daten nach Ablauf der Aufbewahrungsfrist gelöscht?"] },
  ],
  "4_5": [
    { label: "Auslöser", fragen: ["Wie wird der Datenzugriff der Finanzverwaltung bei einer Betriebsprüfung ermöglicht?"] },
    { label: "Durchführung", fragen: ["Welche Zugriffsarten können Sie bereitstellen (Z1: unmittelbar, Z2: mittelbar, Z3: Datenträgerüberlassung)?"] },
    { label: "Nachweis", fragen: ["Wer ist im Unternehmen Ansprechpartner für Betriebsprüfungen?"] },
    { label: "Aufbewahrung", fragen: ["Wie schnell können angeforderte Daten in den geforderten Formaten bereitgestellt werden?"] },
    { label: "Zusatz", fragen: ["Wie werden GDPdU/GoBD-Exporte aus Ihrer Buchhaltungssoftware erstellt?"] },
  ],
  "4_6": [
    { label: "Auslöser", fragen: ["Wann und wie werden Änderungen an Prozessen und Systemen initiiert?"] },
    { label: "Durchführung", fragen: ["Wer genehmigt Änderungen an steuerrelevanten Verfahren?"] },
    { label: "Nachweis", fragen: ["Gibt es ein Änderungsprotokoll oder Changelog für alle Versionen?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden alte Versionen der Dokumentation und Prozessbeschreibungen aufbewahrt?"] },
    { label: "Zusatz", fragen: ["Wie wird sichergestellt, dass alle Beteiligten über Änderungen informiert werden?"] },
  ],
  "4_7": [
    { label: "Auslöser", fragen: ["Welche Papierbelege werden digitalisiert und warum?"] },
    { label: "Durchführung", fragen: ["Welches Verfahren und welche Geräte nutzen Sie zur Digitalisierung?"] },
    { label: "Nachweis", fragen: ["Wie stellen Sie die bildliche Übereinstimmung mit dem Original sicher?"] },
    { label: "Aufbewahrung", fragen: ["Was geschieht mit den Originalen nach der Digitalisierung?"] },
    { label: "Zusatz", fragen: ["Gibt es eine interne Verfahrensanweisung zum ersetzenden Scannen nach TR-RESISCAN?"] },
  ],

  // ── KAPITEL 5: Internes Kontrollsystem ──
  "5_1": [
    { label: "Auslöser", fragen: ["Welche Berechtigungskonzepte gibt es für Ihre IT-Systeme?"] },
    { label: "Durchführung", fragen: ["Wie werden Berechtigungen vergeben, geändert und entzogen?"] },
    { label: "Nachweis", fragen: ["Wie oft werden Berechtigungen überprüft (Rezertifizierung)?"] },
    { label: "Aufbewahrung", fragen: ["Wo ist das Berechtigungskonzept dokumentiert?"] },
    { label: "Zusatz", fragen: ["Wie wird das Prinzip der minimalen Rechte (Least Privilege) umgesetzt?"] },
  ],
  "5_2": [
    { label: "Auslöser", fragen: ["Welche Freigabeprozesse gibt es (z. B. für Rechnungen, Zahlungen, Verträge)?"] },
    { label: "Durchführung", fragen: ["Wer hat welche Freigabekompetenzen und gibt es Wertgrenzen?"] },
    { label: "Nachweis", fragen: ["Wie werden Freigaben dokumentiert und nachvollzogen?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Freigabeprotokolle archiviert?"] },
    { label: "Zusatz", fragen: ["Wie wird das Vier-Augen-Prinzip bei kritischen Vorgängen sichergestellt?"] },
  ],
  "5_3": [
    { label: "Auslöser", fragen: ["Welche automatischen Plausibilitätsprüfungen sind in Ihren Systemen eingerichtet?"] },
    { label: "Durchführung", fragen: ["Wie werden Abweichungen oder Auffälligkeiten erkannt und bearbeitet?"] },
    { label: "Nachweis", fragen: ["Was passiert, wenn eine Plausibilitätsprüfung fehlschlägt?"] },
    { label: "Aufbewahrung", fragen: ["Wo werden Ergebnisse der Prüfungen protokolliert?"] },
    { label: "Zusatz", fragen: ["Wie werden manuelle Plausibilitätsprüfungen (z. B. Stichproben) durchgeführt?"] },
  ],
  "5_4": [
    { label: "Auslöser", fragen: ["Wer trägt die Gesamtverantwortung für das interne Kontrollsystem?"] },
    { label: "Durchführung", fragen: ["Wie sind die Kontrollverantwortlichkeiten auf die Bereiche verteilt?"] },
    { label: "Nachweis", fragen: ["Wie wird die Einhaltung der Kontrollen überwacht und berichtet?"] },
    { label: "Aufbewahrung", fragen: ["Wo sind die Kontrollverantwortlichkeiten dokumentiert?"] },
    { label: "Zusatz", fragen: ["Wie werden neue Mitarbeiter in das IKS eingewiesen?"] },
  ],
  "5_5": [
    { label: "Auslöser", fragen: ["Wie werden Fehler in der Buchführung erkannt?"] },
    { label: "Durchführung", fragen: ["Wie werden Korrekturbuchungen durchgeführt und dokumentiert?"] },
    { label: "Nachweis", fragen: ["An wen werden schwerwiegende Fehler eskaliert?"] },
    { label: "Aufbewahrung", fragen: ["Wie wird sichergestellt, dass Fehler nicht wiederholt auftreten (Lessons Learned)?"] },
    { label: "Zusatz", fragen: ["Wie werden Stornierungen und Berichtigungen nachvollziehbar dokumentiert?"] },
  ],
};

/** Flat version for backward compatibility */
export const CHAPTER_LEITFRAGEN: Record<string, string[]> = Object.fromEntries(
  Object.entries(CHAPTER_LEITFRAGEN_BLOCKS).map(([key, blocks]) => [
    key,
    blocks.flatMap((b) => b.fragen),
  ])
);
