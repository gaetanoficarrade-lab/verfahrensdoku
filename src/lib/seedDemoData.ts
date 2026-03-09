import { supabase } from '@/integrations/supabase/client';
import { GOBD_CHAPTERS } from './chapter-structure';
import type { OnboardingAnswers } from './onboarding-variables';

const DEMO_ONBOARDING: OnboardingAnswers = {
  company_name: 'Beispiel GmbH',
  legal_form: 'GmbH',
  industry: 'IT-Dienstleistungen',
  founding_year: '2018',
  HAS_EMPLOYEES: true,
  HAS_TAX_ADVISOR: true,
  ACCOUNTING_CONTACT: 'Maria Muster',
  BOOKKEEPING_BY: 'tax_advisor',
  document_transfer_method: 'DATEV Unternehmen online',
  INVOICE_CREATION_TYPE: 'lexoffice',
  HAS_CASH: false,
  USES_PAYMENT_PROVIDER: false,
  USES_MARKETPLACE: false,
  HAS_E_INVOICING: 'no',
  SOFTWARE_LIST: 'Lexoffice, Microsoft 365, DATEV',
  USES_CLOUD: 'yes',
  HAS_BUSINESS_ACCOUNT: true,
  USES_ONLINE_BANKING: true,
  HAS_AUTO_BANK_IMPORT: 'yes',
  DOCUMENT_TYPE: 'digital',
  HAS_SCAN_PROCESS: false,
};

// ─── Detailed chapter content for ALL 30 subchapters ───

const CHAPTER_CONTENT: Record<string, { client_notes: string; generated_text: string }> = {
  '1_1': {
    client_notes: `Die Beispiel GmbH ist ein IT-Dienstleistungsunternehmen mit Sitz in München, gegründet 2018. Unsere Kerntätigkeit umfasst die Entwicklung individueller Softwarelösungen sowie IT-Beratung für mittelständische Unternehmen. Ein typischer Auftrag beginnt mit einer Kundenanfrage per E-Mail oder Telefon. Nach einem Erstgespräch erstellen wir ein Angebot in Lexoffice. Bei Beauftragung wird ein Projektvertrag geschlossen und die Leistung erbracht. Geschäftstätigkeit wird belegt durch Angebote, Auftragsbestätigungen, Projektverträge, Stundenzettel, Abnahmeprotokolle und Rechnungen. Diese Dokumente werden digital in Microsoft 365 (SharePoint) aufbewahrt, die Aufbewahrungsfrist beträgt 10 Jahre. Die Beispiel GmbH ist eine GmbH und besteht seit 2018. Geschäftsführerin ist Anna Schmidt.`,
    generated_text: `## 1.1 Unternehmensbeschreibung

### Unternehmensgegenstand und Kerntätigkeit
Die Beispiel GmbH mit Sitz in München wurde im Jahr 2018 gegründet und ist im Bereich IT-Dienstleistungen tätig. Die Kerntätigkeit umfasst die Entwicklung individueller Softwarelösungen sowie IT-Beratung für mittelständische Unternehmen. Die Gesellschaft wird als Gesellschaft mit beschränkter Haftung (GmbH) geführt. Geschäftsführerin ist Frau Anna Schmidt.

### Typischer Geschäftsprozess
Ein typischer Geschäftsvorfall beginnt mit einer Kundenanfrage, die per E-Mail oder telefonisch eingeht. Im Anschluss wird ein Beratungsgespräch geführt und ein verbindliches Angebot über die Rechnungssoftware Lexoffice erstellt. Nach Angebotsannahme wird ein Projektvertrag geschlossen, die vereinbarten Leistungen erbracht und dokumentiert. Nach Projektabschluss erfolgt die Rechnungsstellung über Lexoffice mit automatischer Übergabe an DATEV.

### Belegwesen und Nachweisführung
Die Geschäftstätigkeit der Beispiel GmbH wird durch folgende Dokumente belegt:
- **Angebote und Auftragsbestätigungen** (Lexoffice)
- **Projektverträge** (Microsoft 365 / SharePoint)
- **Stundenzettel und Abnahmeprotokolle** (SharePoint)
- **Ausgangsrechnungen** (Lexoffice → DATEV)

### Aufbewahrung
Sämtliche geschäftsrelevanten Dokumente werden digital aufbewahrt. Die primäre Ablage erfolgt in Microsoft 365 (SharePoint) sowie in DATEV Unternehmen online. Die gesetzliche Aufbewahrungsfrist von 10 Jahren gemäß § 147 AO wird eingehalten. Die digitale Archivierung erfolgt revisionssicher in DATEV.

### Unternehmensdaten
| Merkmal | Wert |
|---------|------|
| Firma | Beispiel GmbH |
| Rechtsform | GmbH |
| Gründungsjahr | 2018 |
| Sitz | München |
| Geschäftsführung | Anna Schmidt |
| Branche | IT-Dienstleistungen |
| Mitarbeiter | 3 |

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '1_2': {
    client_notes: `Die Beispiel GmbH hat einen Standort in München mit 3 Mitarbeitern: Anna Schmidt (Geschäftsführerin, verantwortlich für Finanzen, Vertrieb und Projektleitung), Markus Weber (Senior Entwickler / IT-Leiter, verantwortlich für Softwareentwicklung und IT-Infrastruktur) und Lisa Bauer (Junior Entwicklerin, Softwareentwicklung und Kundensupport). Die Aufgabenverteilung ist klar geregelt. Ein formales Organigramm existiert aufgrund der kleinen Unternehmensgröße nicht, die Zuständigkeiten sind jedoch in einer internen Dokumentation festgehalten. Die Organisationsstruktur wird bei Personaländerungen aktualisiert, mindestens jedoch einmal jährlich überprüft.`,
    generated_text: `## 1.2 Organisatorischer Aufbau

### Standort und Unternehmensgröße
Die Beispiel GmbH unterhält einen Standort in München. Das Unternehmen beschäftigt drei Mitarbeiter. Aufgrund der geringen Unternehmensgröße ist die Organisationsstruktur flach und transparent gehalten.

### Personalstruktur und Aufgabenverteilung

| Person | Position | Verantwortungsbereich |
|--------|----------|----------------------|
| Anna Schmidt | Geschäftsführerin | Finanzen, Vertrieb, Projektleitung, kaufmännische Prozesse |
| Markus Weber | Senior Entwickler / IT-Leiter | Softwareentwicklung, IT-Infrastruktur, technische Systeme |
| Lisa Bauer | Junior Entwicklerin | Softwareentwicklung, Kundensupport |

### Organisationsform
Die Beispiel GmbH ist als Linienorganisation mit direkter Berichtsstruktur an die Geschäftsführung organisiert. Alle Mitarbeiter berichten direkt an die Geschäftsführerin Anna Schmidt.

Ein formalisiertes Organigramm liegt aufgrund der kleinen Unternehmensgröße nicht vor. Die Zuständigkeiten und Verantwortlichkeiten sind jedoch in einer internen Dokumentation auf SharePoint (Microsoft 365) schriftlich festgehalten.

### Kompetenzregelungen
- **Kaufmännische Entscheidungen**: Ausschließlich Geschäftsführerin Anna Schmidt
- **Technische Entscheidungen**: Markus Weber in Abstimmung mit der Geschäftsführung
- **Vertretungsregelung**: Bei Abwesenheit der Geschäftsführerin übernimmt Markus Weber operative Entscheidungen (eingeschränkt)

### Pflege und Aktualisierung
Die Organisationsstruktur wird bei Personaländerungen unverzüglich aktualisiert. Darüber hinaus erfolgt mindestens einmal jährlich eine Überprüfung der dokumentierten Struktur auf Aktualität und Vollständigkeit.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '1_3': {
    client_notes: `Für die Buchführung und steuerrelevante Prozesse ist primär Anna Schmidt (Geschäftsführerin) verantwortlich. Die laufende Buchführung wird von der Musterkanzlei Müller & Partner durchgeführt. Bei Abwesenheit von Frau Schmidt werden dringende Zahlungsfreigaben von Markus Weber übernommen (eingeschränkte Bankvollmacht). Zugriffsrechte: DATEV (Anna Schmidt Vollzugriff, Kanzlei Vollzugriff), Lexoffice (Anna Schmidt Administrator, Markus Weber Lesezugriff), Online-Banking (Anna Schmidt Vollzugriff, Markus Weber eingeschränkt bis 5.000€). Zuständigkeiten sind in der internen IT-Dokumentation auf SharePoint festgehalten.`,
    generated_text: `## 1.3 Zuständigkeiten & Verantwortlichkeiten

### Verantwortung für die Buchführung
Die Gesamtverantwortung für die ordnungsgemäße Buchführung liegt bei der Geschäftsführerin Anna Schmidt. Die laufende Buchführung wird durch die Musterkanzlei Müller & Partner als externen Steuerberater durchgeführt.

### Aufgabenverteilung im Detail

| Aufgabe | Verantwortlich | Stellvertretung |
|---------|---------------|-----------------|
| Gesamtverantwortung Buchführung | Anna Schmidt | — |
| Laufende Buchführung | Musterkanzlei Müller & Partner | — |
| Rechnungsstellung | Anna Schmidt | — |
| Rechnungsprüfung | Anna Schmidt | Markus Weber |
| Zahlungsfreigabe | Anna Schmidt | Markus Weber (bis 5.000 €) |
| IT-Administration | Markus Weber | Anna Schmidt |

### Vertretungsregelungen
Bei Abwesenheit der Geschäftsführerin werden dringende Zahlungsfreigaben bis zu einem Betrag von 5.000 € durch Markus Weber übernommen. Dieser verfügt über eine eingeschränkte Bankvollmacht. Darüber hinausgehende Freigaben werden bis zur Rückkehr der Geschäftsführerin zurückgestellt.

### Zugriffsrechte auf steuerrelevante Systeme

| System | Anna Schmidt | Markus Weber | Musterkanzlei |
|--------|-------------|-------------|---------------|
| DATEV Unternehmen online | Vollzugriff | Kein Zugriff | Vollzugriff |
| Lexoffice | Administrator | Lesezugriff | Kein Zugriff |
| Online-Banking (Sparkasse) | Vollzugriff | Eingeschränkt (≤ 5.000 €) | Kein Zugriff |
| Microsoft 365 / SharePoint | Vollzugriff | Vollzugriff | Kein Zugriff |

### Dokumentation der Zuständigkeiten
Sämtliche Zuständigkeiten, Berechtigungen und Vertretungsregelungen sind in der internen IT- und Prozessdokumentation auf Microsoft SharePoint schriftlich festgehalten. Änderungen werden protokolliert und versioniert.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '1_4': {
    client_notes: `Die Buchführung erfolgt nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) in Verbindung mit den GoBD. Wir wenden die Soll-Versteuerung an. Kontenrahmen: SKR04 (DATEV-Standard). Buchungszeitraum: monatlich, Belege werden wöchentlich über DATEV Unternehmen online bereitgestellt. Vollständigkeit wird sichergestellt durch fortlaufende Rechnungsnummern in Lexoffice, automatischen Bankdatenimport in DATEV und monatliche Abstimmung durch die Steuerberaterkanzlei.`,
    generated_text: `## 1.4 Buchführungsgrundsätze

### Grundlagen
Die Beispiel GmbH führt ihre Buchführung nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) gemäß §§ 238 ff. HGB in Verbindung mit den GoBD (BMF-Schreiben vom 28.11.2019). Es wird die **Soll-Versteuerung** gemäß § 16 Abs. 1 UStG angewendet.

### Kontenrahmen und Buchungssystematik
Die Buchführung erfolgt unter Verwendung des **Standardkontenrahmens SKR04** (DATEV). Der Kontenplan wird von der Musterkanzlei Müller & Partner gepflegt und bei Bedarf angepasst. Anpassungen werden dokumentiert und nachvollziehbar festgehalten.

### Buchungsrhythmus und Belegfluss
- Belege werden **wöchentlich** über DATEV Unternehmen online an die Kanzlei übermittelt
- Die Verbuchung erfolgt **monatlich** durch die Musterkanzlei Müller & Partner
- Abstimmung der offenen Posten erfolgt **monatlich**
- Umsatzsteuervoranmeldungen werden **monatlich** durch die Kanzlei erstellt und übermittelt

### Sicherstellung der Vollständigkeit
Die Vollständigkeit der Buchführung wird durch folgende Maßnahmen sichergestellt:

1. **Fortlaufende Rechnungsnummern** – automatisch durch Lexoffice vergeben, keine manuellen Eingriffe möglich
2. **Automatischer Bankdatenimport** – täglicher Abruf der Kontoumsätze über die DATEV-Bankschnittstelle
3. **Monatliche Abstimmung** – systematische Prüfung durch die Steuerberaterkanzlei (Kontenabstimmung, OP-Abstimmung)
4. **Belegkontrolle** – Prüfung auf Vollständigkeit der Eingangsbelege im Rahmen der monatlichen Buchführung

### Abweichungen und Korrekturen
Korrekturbuchungen und Stornierungen werden ausschließlich von der Steuerberaterkanzlei vorgenommen. Jede Korrektur wird mit einem Buchungstext dokumentiert, der den Grund der Korrektur nachvollziehbar macht. Direkte Löschungen von Buchungssätzen sind systemseitig ausgeschlossen.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '1_5': {
    client_notes: `Anna Schmidt ist als Geschäftsführerin für die Pflege der Verfahrensdokumentation verantwortlich. Die Dokumentation wird mindestens einmal jährlich überprüft und bei wesentlichen Änderungen an Prozessen, Software oder Organisation aktualisiert. Änderungen werden versioniert in SharePoint abgelegt. Die Steuerberaterkanzlei wird bei relevanten Änderungen informiert und prüft die Dokumentation auf GoBD-Konformität.`,
    generated_text: `## 1.5 Pflege der Verfahrensdokumentation

### Verantwortlichkeit
Die Verantwortung für die Pflege und Aktualisierung der Verfahrensdokumentation liegt bei der Geschäftsführerin Anna Schmidt. Die fachliche Unterstützung und Qualitätssicherung erfolgt durch die Musterkanzlei Müller & Partner.

### Aktualisierungsanlässe
Die Verfahrensdokumentation wird in folgenden Fällen überprüft und bei Bedarf aktualisiert:
- **Regelmäßig**: Mindestens einmal jährlich im Rahmen der Jahresabschlussvorbereitung
- **Anlassbezogen**: Bei wesentlichen Änderungen an Geschäftsprozessen, eingesetzter Software, Organisationsstruktur oder gesetzlichen Rahmenbedingungen
- **Systemwechsel**: Bei Einführung oder Ablösung steuerrelevanter IT-Systeme

### Änderungsmanagement
Änderungen an der Verfahrensdokumentation werden wie folgt dokumentiert:
1. Erstellung einer neuen Version mit Änderungsdatum und Änderungshistorie
2. Versionierte Ablage in Microsoft SharePoint mit Zugriffsbeschränkung
3. Information der Steuerberaterkanzlei über relevante Änderungen
4. Prüfung der aktualisierten Dokumentation auf GoBD-Konformität durch die Kanzlei

### Aufbewahrung
Die Verfahrensdokumentation einschließlich aller historischen Versionen wird für die Dauer der gesetzlichen Aufbewahrungsfrist (10 Jahre) digital aufbewahrt. Die Ablage erfolgt in Microsoft SharePoint mit automatischer Versionierung.

### Qualitätssicherung
Die Musterkanzlei Müller & Partner prüft die Verfahrensdokumentation im Rahmen der jährlichen Überprüfung auf:
- Vollständigkeit und Aktualität der beschriebenen Prozesse
- Übereinstimmung mit den tatsächlich gelebten Verfahren
- Konformität mit den aktuellen GoBD-Anforderungen

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '2_1': {
    client_notes: `Ausgangsrechnungen werden in Lexoffice erstellt. Die Rechnungsnummer wird automatisch fortlaufend vergeben. Rechnungen werden als PDF per E-Mail an den Kunden versendet. Die Daten werden automatisch an DATEV Unternehmen online übertragen. Archivierung erfolgt in Lexoffice (10 Jahre) und parallel in DATEV. Rechnungsinhalte umfassen: Leistungsbeschreibung, Zeitraum, Stundensätze, Gesamtbetrag, USt-Ausweis. Zahlungsziel ist standardmäßig 14 Tage netto.`,
    generated_text: `## 2.1 Rechnungsausgang / Debitoren

### Rechnungserstellung
Ausgangsrechnungen werden ausschließlich über die Software **Lexoffice** erstellt. Die Rechnungserstellung erfolgt durch die Geschäftsführerin Anna Schmidt nach Abschluss der jeweiligen Leistung oder gemäß vertraglicher Vereinbarung.

### Rechnungsnummernvergabe
Die Vergabe der Rechnungsnummern erfolgt **automatisch und fortlaufend** durch Lexoffice. Eine manuelle Änderung oder Vergabe von Rechnungsnummern ist systemseitig nicht vorgesehen. Die Nummernkreise sind lückenlos und entsprechen den Anforderungen des § 14 Abs. 4 UStG.

### Pflichtangaben
Jede Ausgangsrechnung enthält die gesetzlich vorgeschriebenen Pflichtangaben gemäß § 14 Abs. 4 UStG:
- Vollständiger Name und Anschrift des leistenden Unternehmens und des Leistungsempfängers
- Steuernummer bzw. USt-IdNr.
- Ausstellungsdatum und fortlaufende Rechnungsnummer
- Leistungsbeschreibung, Leistungszeitraum
- Nettobetrag, Steuersatz und Steuerbetrag, Bruttobetrag

### Versand und Zustellung
Rechnungen werden als PDF-Dokument per E-Mail an den Kunden versendet. Das Standard-Zahlungsziel beträgt 14 Tage netto. Bei Zahlungsverzug erfolgt ein automatisches Mahnwesen über Lexoffice.

### Datenübergabe und Archivierung
Die Rechnungsdaten werden **automatisch** von Lexoffice an DATEV Unternehmen online übertragen. Die Archivierung erfolgt parallel in:
- **Lexoffice**: Primärarchiv mit 10 Jahren Aufbewahrung
- **DATEV Unternehmen online**: Sekundärarchiv für die steuerliche Verarbeitung

Die revisionssichere Archivierung gemäß GoBD ist durch die Unveränderbarkeit der Dokumente in beiden Systemen sichergestellt.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '2_2': {
    client_notes: `Eingangsrechnungen erreichen uns zu 90% per E-Mail und zu 10% per Post (diese werden gescannt). Der Prozess: Upload in DATEV Unternehmen online, sachliche und rechnerische Prüfung durch Anna Schmidt, Freigabe in DATEV, Verbuchung durch den Steuerberater. Archivierung erfolgt in DATEV (10 Jahre). Zahlungen werden nach Freigabe über Online-Banking ausgelöst. Offene Posten werden monatlich abgestimmt.`,
    generated_text: `## 2.2 Rechnungseingang / Kreditoren

### Belegeingang
Eingangsrechnungen erreichen die Beispiel GmbH über folgende Kanäle:
- **E-Mail** (ca. 90%): Rechnungen werden als PDF-Anhang empfangen
- **Post** (ca. 10%): Papierbelege werden zeitnah digitalisiert

### Verarbeitungsprozess
Der Verarbeitungsprozess für Eingangsrechnungen ist wie folgt definiert:

1. **Belegerfassung**: Upload der Eingangsrechnung in DATEV Unternehmen online (manuell oder via E-Mail-Weiterleitung)
2. **Sachliche Prüfung**: Anna Schmidt prüft die Rechnung auf korrekte Leistungsbeschreibung und Übereinstimmung mit der Bestellung
3. **Rechnerische Prüfung**: Kontrolle der Beträge, Steuersätze und Zahlungskonditionen
4. **Freigabe**: Digitale Freigabe in DATEV Unternehmen online durch Anna Schmidt
5. **Verbuchung**: Die Musterkanzlei Müller & Partner verbucht die freigegebenen Rechnungen im Rahmen der monatlichen Buchführung
6. **Zahlung**: Nach Freigabe wird die Zahlung über Online-Banking (Sparkasse) ausgelöst

### Zuständigkeiten
- **Prüfung und Freigabe**: Anna Schmidt (Geschäftsführerin)
- **Vertretung**: Markus Weber bei Beträgen bis 5.000 €
- **Verbuchung**: Musterkanzlei Müller & Partner

### Archivierung
Alle Eingangsrechnungen werden revisionssicher in DATEV Unternehmen online archiviert. Die Aufbewahrungsfrist beträgt 10 Jahre gemäß § 147 AO. Die Unveränderbarkeit der archivierten Belege ist durch DATEV systemseitig sichergestellt.

### Kontrollen
- Monatliche Abstimmung der offenen Posten durch die Steuerberaterkanzlei
- Abgleich der verbuchten Eingangsrechnungen mit den Bankumsätzen
- Prüfung auf Doppelerfassung durch DATEV

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '2_7': {
    client_notes: `Die laufende Buchführung wird vollständig von der Musterkanzlei Müller & Partner durchgeführt. Wir nutzen DATEV Unternehmen online als zentrale Plattform. Belege werden wöchentlich hochgeladen, die Verbuchung erfolgt monatlich. Der Kontenrahmen SKR04 wird verwendet. Monatliche Auswertungen (BWA, SuSa) werden von der Kanzlei bereitgestellt. Die Umsatzsteuervoranmeldung erfolgt monatlich durch die Kanzlei.`,
    generated_text: `## 2.7 Buchhaltungsverarbeitung

### Organisation der Buchführung
Die laufende Buchführung der Beispiel GmbH wird vollständig durch die **Musterkanzlei Müller & Partner** als externe Steuerberaterkanzlei durchgeführt. Als zentrale Buchführungsplattform wird **DATEV Unternehmen online** eingesetzt.

### Belegfluss und Buchungsrhythmus
- **Wöchentlich**: Upload der Belege (Eingangs-/Ausgangsrechnungen, Bankbelege) in DATEV Unternehmen online durch Anna Schmidt
- **Monatlich**: Verbuchung aller Geschäftsvorfälle durch die Kanzlei
- **Monatlich**: Erstellung und Übermittlung der Umsatzsteuervoranmeldung

### Kontenrahmen und Buchungssystematik
Es wird der **Standardkontenrahmen SKR04** (DATEV) verwendet. Der Kontenplan wird von der Kanzlei gepflegt. Individuelle Konten werden bei Bedarf in Abstimmung mit der Geschäftsführung angelegt und dokumentiert.

### Buchungsprozess im Detail
1. Belegsammlung und -upload durch die Beispiel GmbH (wöchentlich)
2. Prüfung der Belege auf Vollständigkeit durch die Kanzlei
3. Kontierung und Verbuchung gemäß SKR04
4. Abgleich mit den Bankumsätzen (automatischer Import)
5. Abstimmung offener Posten (Debitoren/Kreditoren)
6. Erstellung monatlicher Auswertungen (BWA, Summen-/Saldenliste)

### Monatliche Auswertungen
Die Kanzlei stellt folgende Auswertungen monatlich über DATEV bereit:
- **Betriebswirtschaftliche Auswertung (BWA)**
- **Summen- und Saldenliste (SuSa)**
- **Offene-Posten-Liste** (Debitoren und Kreditoren)
- **Umsatzsteuervoranmeldung** (ELSTER-Übermittlung durch Kanzlei)

### Qualitätssicherung
Die Kanzlei führt folgende Kontrollmaßnahmen durch:
- Plausibilitätsprüfung der Buchungssätze
- Abgleich der Bankumsätze mit den Buchungen
- Prüfung der Umsatzsteuerkonten
- Jahresabschlussvorbereitung mit systematischer Kontenklärung

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '2_8': {
    client_notes: `Geschäftskonto bei der Sparkasse München. Online-Banking über die Sparkassen-App und Browser. Automatischer Bankdatenimport in DATEV über die DATEV-Bankschnittstelle (täglich). Zahlungsfreigaben: bis 5.000€ Einzelfreigabe (Anna Schmidt oder Markus Weber), über 5.000€ nur durch Geschäftsführerin. TAN-Verfahren: pushTAN. Kontoauszüge werden digital in DATEV archiviert.`,
    generated_text: `## 2.8 Zahlungsverkehr / Bank

### Kontenstruktur
Die Beispiel GmbH unterhält ein Geschäftskonto bei der **Sparkasse München**. Das Konto dient als zentrales Zahlungsverkehrskonto für sämtliche Ein- und Auszahlungen des Unternehmens.

### Online-Banking
Der Zahlungsverkehr wird über das Online-Banking der Sparkasse abgewickelt. Der Zugriff erfolgt über die Sparkassen-App sowie über den Browser. Als Authentifizierungsverfahren wird **pushTAN** eingesetzt.

### Berechtigungen und Freigaben

| Person | Berechtigung | Limit |
|--------|-------------|-------|
| Anna Schmidt | Vollzugriff | Unbegrenzt |
| Markus Weber | Eingeschränkt | Bis 5.000 € |

**Freigaberegelung**: Einzelzahlungen bis 5.000 € können von Anna Schmidt oder Markus Weber freigegeben werden. Zahlungen über 5.000 € erfordern die Freigabe durch die Geschäftsführerin Anna Schmidt.

### Automatischer Bankdatenimport
Die Kontoumsätze werden **täglich automatisch** über die DATEV-Bankschnittstelle in DATEV Unternehmen online importiert. Dadurch ist eine zeitnahe Zuordnung der Zahlungen zu den offenen Posten sichergestellt.

### Zahlungsprozess
1. Zahlungsvorschlag wird auf Basis der freigegebenen Eingangsrechnungen erstellt
2. Prüfung und Freigabe durch berechtigte Person
3. Ausführung über Online-Banking mit pushTAN-Bestätigung
4. Automatischer Import der Buchung in DATEV

### Archivierung
Elektronische Kontoauszüge werden automatisch in DATEV Unternehmen online archiviert. Die Aufbewahrung erfolgt revisionssicher für die gesetzliche Aufbewahrungsfrist von 10 Jahren.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '2_9': {
    client_notes: `Die Beispiel GmbH hat 2 Angestellte (Markus Weber und Lisa Bauer). Die Lohnabrechnung wird extern durch ADP durchgeführt. Monatlich werden die relevanten Daten (Arbeitszeiten, Fehlzeiten, Sonderzahlungen) an ADP übermittelt. ADP erstellt die Lohnabrechnungen und übermittelt die Lohndaten an DATEV. Personalakten werden digital auf SharePoint geführt. Lohn- und Gehaltsüberweisungen erfolgen über das Geschäftskonto.`,
    generated_text: `## 2.9 Personal / Lohn

### Personalstruktur
Die Beispiel GmbH beschäftigt zwei Arbeitnehmer:
- **Markus Weber** – Senior Entwickler / IT-Leiter (Vollzeit)
- **Lisa Bauer** – Junior Entwicklerin (Vollzeit)

Die Geschäftsführerin Anna Schmidt ist als Gesellschafter-Geschäftsführerin nicht sozialversicherungspflichtig beschäftigt.

### Lohn- und Gehaltsabrechnung
Die Lohn- und Gehaltsabrechnung wird durch den externen Dienstleister **ADP Employer Services** durchgeführt. Die Zusammenarbeit ist vertraglich geregelt, ein Auftragsverarbeitungsvertrag (AVV) gemäß Art. 28 DSGVO liegt vor.

### Monatlicher Abrechnungsprozess
1. **Datenübermittlung**: Anna Schmidt übermittelt monatlich die relevanten Abrechnungsdaten an ADP (Arbeitszeiten, Fehlzeiten, Sonderzahlungen)
2. **Abrechnung**: ADP erstellt die Lohn- und Gehaltsabrechnungen
3. **Meldungen**: ADP übernimmt die Meldungen an Sozialversicherungsträger und Finanzamt
4. **Datenübergabe**: Die Buchungsdaten werden von ADP an DATEV übermittelt
5. **Verbuchung**: Die Kanzlei verbucht die Lohndaten im Rahmen der monatlichen Buchführung
6. **Auszahlung**: Lohn- und Gehaltsüberweisungen erfolgen über das Geschäftskonto bei der Sparkasse

### Personalakten
Personalakten werden digital in Microsoft SharePoint geführt. Der Zugriff ist auf die Geschäftsführerin beschränkt. Folgende Unterlagen werden geführt:
- Arbeitsverträge und Nachträge
- Lohn- und Gehaltsabrechnungen
- Sozialversicherungsnachweise
- Krankmeldungen und Urlaubsanträge

### Aufbewahrungsfristen
- Lohnkonten und Lohnabrechnungen: **6 Jahre** (§ 41 Abs. 1 EStG)
- Lohnsteueranmeldungen: **10 Jahre** (§ 147 AO)
- Beitragsabrechnungen Sozialversicherung: **10 Jahre**

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '3_1': {
    client_notes: `Hauptsystem: DATEV Unternehmen online (Finanzbuchhaltung, Belegverwaltung, Cloud). Lexoffice (Rechnungsstellung, Cloud). Schnittstelle zwischen Lexoffice und DATEV für automatischen Belegexport. Microsoft 365 Business (E-Mail, Dokumentenablage, SharePoint). Alle Systeme sind cloudbasiert. Zugangsdaten werden zentral verwaltet.`,
    generated_text: `## 3.1 Buchhaltungssoftware

### Übersicht der eingesetzten Systeme

| Software | Einsatzzweck | Betriebsart | Anbieter |
|----------|-------------|-------------|----------|
| DATEV Unternehmen online | Finanzbuchhaltung, Belegverwaltung | Cloud (SaaS) | DATEV eG |
| Lexoffice | Rechnungsstellung, Angebote | Cloud (SaaS) | Lexware / Haufe |
| Microsoft 365 Business | E-Mail, Dokumentenablage | Cloud (SaaS) | Microsoft |

### DATEV Unternehmen online
DATEV Unternehmen online ist das zentrale System für die Finanzbuchhaltung und Belegverwaltung. Das System wird von der DATEV eG als Cloud-Lösung betrieben. Der Zugriff erfolgt über den Webbrowser. Die Datenhaltung erfolgt in deutschen Rechenzentren der DATEV eG.

**Funktionen im Einsatz:**
- Belegverwaltung und -archivierung
- Bankanbindung (automatischer Kontoumsatzimport)
- Bereitstellung von Auswertungen (BWA, SuSa)
- Schnittstelle zur Kanzleisoftware des Steuerberaters

### Lexoffice
Lexoffice wird für die Erstellung von Angeboten und Ausgangsrechnungen eingesetzt. Das System vergibt automatisch fortlaufende Rechnungsnummern und archiviert alle erstellten Dokumente revisionssicher.

**Schnittstelle zu DATEV:** Ausgangsrechnungen und zugehörige Belege werden automatisch von Lexoffice an DATEV Unternehmen online übertragen (tägliche Synchronisation).

### Microsoft 365 Business
Microsoft 365 dient als zentrale Plattform für:
- E-Mail-Kommunikation (Outlook)
- Dokumentenablage und -verwaltung (SharePoint)
- Interne Zusammenarbeit (Teams)

### Zugangsverwaltung
Zugangsdaten für alle Systeme werden zentral verwaltet. Jeder Benutzer verfügt über individuelle Zugangsdaten. Die Zugriffsrechte sind nach dem Prinzip der minimalen Berechtigung vergeben und in der internen Dokumentation festgehalten.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '3_2': {
    client_notes: `Schnittstelle Lexoffice → DATEV: Automatischer Export von Ausgangsrechnungen und Belegen (täglich). Schnittstelle Sparkasse → DATEV: Automatischer Bankdatenimport (täglich). Schnittstelle ADP → DATEV: Monatliche Lohndatenübertragung. Alle Schnittstellen sind vom Anbieter bereitgestellt und konfiguriert. Keine individuellen oder selbst entwickelten Schnittstellen.`,
    generated_text: `## 3.2 Schnittstellen

### Übersicht der aktiven Schnittstellen

| Schnittstelle | Quellsystem | Zielsystem | Frequenz | Art |
|---------------|-------------|------------|----------|-----|
| Belegexport | Lexoffice | DATEV Unternehmen online | Täglich (automatisch) | Herstellerschnittstelle |
| Bankdatenimport | Sparkasse München | DATEV Unternehmen online | Täglich (automatisch) | DATEV-Bankschnittstelle |
| Lohndatenübergabe | ADP | DATEV Unternehmen online | Monatlich | Herstellerschnittstelle |

### Schnittstelle Lexoffice → DATEV
Ausgangsrechnungen und zugehörige Belegbilder werden automatisch und täglich von Lexoffice an DATEV Unternehmen online übertragen. Die Schnittstelle wird von Lexoffice bereitgestellt und erfordert eine einmalige Autorisierung. Die übertragenen Daten umfassen:
- Rechnungs-PDF als Belegbild
- Strukturierte Rechnungsdaten (Betrag, Steuer, Rechnungsnummer)

### Schnittstelle Sparkasse → DATEV (Bankdatenimport)
Die Kontoumsätze des Geschäftskontos bei der Sparkasse München werden täglich automatisch über die DATEV-Bankschnittstelle importiert. Der Import umfasst:
- Alle Kontoumsätze (Ein- und Ausgänge)
- Verwendungszweck und Buchungsdetails
- Saldo-Informationen

### Schnittstelle ADP → DATEV (Lohndaten)
Die monatlichen Lohndaten werden von ADP an DATEV übergeben. Die Übertragung umfasst:
- Buchungssätze der Lohn- und Gehaltsabrechnung
- Sozialversicherungsbeiträge und Lohnsteuer
- Nettolöhne für die Überweisung

### Individuelle Schnittstellen
Es werden **keine** individuell entwickelten oder angepassten Schnittstellen eingesetzt. Sämtliche Datenübertragungen erfolgen über die von den Herstellern bereitgestellten Standardschnittstellen.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '3_4': {
    client_notes: `Folgende Cloud-Dienste werden eingesetzt: Microsoft 365 Business (E-Mail, SharePoint, Teams - Datenhaltung EU), DATEV Unternehmen online (Finanzbuchhaltung - Datenhaltung DE), Lexoffice (Rechnungsstellung - Datenhaltung DE), GitHub (Quellcodeverwaltung - Datenhaltung EU). Für alle Cloud-Dienste liegen Auftragsverarbeitungsverträge (AVV) vor. Alle Anbieter sind ISO 27001 zertifiziert.`,
    generated_text: `## 3.4 Cloud-Software / SaaS

### Übersicht der eingesetzten Cloud-Dienste

| Dienst | Zweck | Anbieter | Datenhaltung | AVV |
|--------|-------|----------|-------------|-----|
| Microsoft 365 Business | E-Mail, SharePoint, Teams | Microsoft | EU | ✓ |
| DATEV Unternehmen online | Finanzbuchhaltung, Belegverwaltung | DATEV eG | Deutschland | ✓ |
| Lexoffice | Rechnungsstellung | Lexware / Haufe | Deutschland | ✓ |
| GitHub | Quellcodeverwaltung | GitHub Inc. (Microsoft) | EU | ✓ |

### Datenschutz und Vertragsgrundlagen
Für sämtliche eingesetzten Cloud-Dienste liegen **Auftragsverarbeitungsverträge (AVV)** gemäß Art. 28 DSGVO vor. Die Datenhaltung erfolgt ausschließlich innerhalb der Europäischen Union bzw. in Deutschland.

### Sicherheitsstandards
Alle eingesetzten Cloud-Anbieter verfügen über anerkannte Sicherheitszertifizierungen:
- **DATEV eG**: IDW PS 951, ISO 27001, BSI C5
- **Microsoft**: ISO 27001, SOC 2, BSI C5
- **Lexware/Haufe**: ISO 27001, TÜV-geprüft
- **GitHub**: SOC 2, ISO 27001

### Zugangssicherung
Der Zugang zu Cloud-Diensten ist durch folgende Maßnahmen gesichert:
- Individuelle Benutzerkonten mit persönlichen Zugangsdaten
- **Zwei-Faktor-Authentifizierung (2FA)** für alle steuerrelevanten Systeme (DATEV, Lexoffice, Online-Banking)
- Regelmäßige Überprüfung der Zugriffsrechte (mindestens jährlich)

### Verfügbarkeit und Datensicherung
Die Datensicherung wird von den jeweiligen Cloud-Anbietern im Rahmen ihrer Service-Level-Agreements (SLA) sichergestellt. Zusätzlich werden kritische Daten lokal gesichert (siehe Kapitel 4.1 Datensicherung).

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '3_5': {
    client_notes: `E-Mail-System: Microsoft 365 (Outlook). Geschäftliche E-Mails werden über info@beispiel-gmbh.de und persönliche Adressen abgewickelt. Steuerrelevante E-Mails (Rechnungen, Verträge) werden in SharePoint archiviert. E-Mail-Archivierung: Microsoft 365 Compliance Center mit Aufbewahrungsrichtlinie (10 Jahre). Spam-Filter und Malware-Schutz über Microsoft Defender.`,
    generated_text: `## 3.5 E-Mail-Systeme & Archivierung

### E-Mail-Infrastruktur
Die Beispiel GmbH nutzt **Microsoft 365 (Outlook)** als zentrales E-Mail-System. Die E-Mail-Kommunikation erfolgt über folgende Adressen:
- info@beispiel-gmbh.de (allgemeine Kontaktadresse)
- Persönliche E-Mail-Adressen der Mitarbeiter (vorname@beispiel-gmbh.de)

### Steuerrelevante E-Mail-Kommunikation
Steuerrelevante E-Mails (insbesondere Eingangsrechnungen, Verträge und geschäftsrelevante Korrespondenz) werden wie folgt behandelt:
1. **Identifikation**: Eingehende steuerrelevante Dokumente werden von den Mitarbeitern erkannt
2. **Weiterverarbeitung**: Rechnungen werden in DATEV Unternehmen online hochgeladen
3. **Archivierung**: Relevante E-Mails und Anhänge werden in Microsoft SharePoint abgelegt

### E-Mail-Archivierung
Die E-Mail-Archivierung erfolgt über das **Microsoft 365 Compliance Center**. Es ist eine automatische Aufbewahrungsrichtlinie konfiguriert:
- **Aufbewahrungsdauer**: 10 Jahre für alle geschäftlichen E-Mails
- **Unveränderbarkeit**: Archivierte E-Mails können nicht gelöscht oder verändert werden
- **Durchsuchbarkeit**: Volltextsuche über alle archivierten E-Mails möglich

### Sicherheitsmaßnahmen
- **Spam-Filter**: Microsoft Defender for Office 365
- **Malware-Schutz**: Automatische Prüfung aller eingehenden Anhänge
- **Verschlüsselung**: TLS-Verschlüsselung für den E-Mail-Transport
- **Phishing-Schutz**: Erweiterte Bedrohungserkennung durch Microsoft Defender

### Compliance
Die E-Mail-Archivierung entspricht den Anforderungen der GoBD hinsichtlich:
- Vollständigkeit der Archivierung geschäftsrelevanter Korrespondenz
- Unveränderbarkeit der archivierten Nachrichten
- Maschinelle Auswertbarkeit und Verfügbarkeit
- Einhaltung der gesetzlichen Aufbewahrungsfristen

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_1': {
    client_notes: `Datensicherung: Alle steuerrelevanten Daten liegen in Cloud-Systemen (DATEV, Lexoffice, Microsoft 365) und werden durch die Anbieter automatisch gesichert. Zusätzlich: Wöchentlicher Export wichtiger Daten auf eine externe Festplatte (verschlüsselt, aufbewahrt im Büro). Verantwortlich: Markus Weber. Die Backup-Strategie wird jährlich überprüft.`,
    generated_text: `## 4.1 Datensicherung

### Sicherungsstrategie
Die Datensicherung der Beispiel GmbH basiert auf einem mehrstufigen Konzept, das sowohl die automatische Sicherung durch Cloud-Anbieter als auch zusätzliche lokale Sicherungen umfasst.

### Cloud-basierte Datensicherung
Die primäre Datensicherung erfolgt durch die eingesetzten Cloud-Dienste:

| System | Sicherungsart | Frequenz | Aufbewahrung |
|--------|-------------|----------|-------------|
| DATEV Unternehmen online | Automatisch durch DATEV | Kontinuierlich | Gemäß SLA |
| Lexoffice | Automatisch durch Anbieter | Kontinuierlich | Gemäß SLA |
| Microsoft 365 | Automatisch durch Microsoft | Kontinuierlich | Gemäß SLA |
| GitHub | Automatisch durch GitHub | Kontinuierlich | Gemäß SLA |

### Zusätzliche lokale Datensicherung
Ergänzend zur Cloud-Sicherung wird wöchentlich ein Export wichtiger Daten auf eine externe Festplatte durchgeführt:
- **Umfang**: Buchhaltungsdaten, Rechnungen, Verträge, Personalunterlagen
- **Verschlüsselung**: AES-256 Verschlüsselung der externen Festplatte
- **Aufbewahrung**: Im Büro der Beispiel GmbH
- **Verantwortlich**: Markus Weber (IT-Leiter)

### Überprüfung und Tests
- Die Backup-Strategie wird **jährlich** überprüft
- Stichprobenartige Wiederherstellungstests werden **halbjährlich** durchgeführt
- Ergebnisse werden in der IT-Dokumentation auf SharePoint protokolliert

### Dokumentation
Die Datensicherungsstrategie ist in der internen IT-Dokumentation beschrieben und umfasst:
- Sicherungsumfang und -frequenz
- Verantwortlichkeiten
- Wiederherstellungsverfahren
- Protokolle der durchgeführten Tests

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_2': {
    client_notes: `Wiederherstellung: Bei Cloud-Diensten über die jeweiligen Anbieter-Tools (DATEV Support, Microsoft Admin Center). Lokales Backup kann von Markus Weber wiederhergestellt werden. Wiederherstellungszeit (RTO): maximal 24 Stunden für kritische Systeme. Halbjährliche Wiederherstellungstests. Notfallplan ist in SharePoint dokumentiert.`,
    generated_text: `## 4.2 Wiederherstellung

### Wiederherstellungsstrategie
Die Beispiel GmbH verfügt über definierte Wiederherstellungsverfahren für alle steuerrelevanten Daten und Systeme. Ziel ist die Wiederherstellung der Arbeitsfähigkeit innerhalb von **24 Stunden** (Recovery Time Objective, RTO).

### Wiederherstellungsverfahren nach System

| System | Verfahren | Verantwortlich | RTO |
|--------|----------|---------------|-----|
| DATEV Unternehmen online | Wiederherstellung durch DATEV Support | Markus Weber (Kontakt) | < 4 Stunden |
| Lexoffice | Self-Service-Wiederherstellung | Anna Schmidt | < 2 Stunden |
| Microsoft 365 | Microsoft Admin Center | Markus Weber | < 4 Stunden |
| Lokale Daten | Wiederherstellung vom verschlüsselten Backup | Markus Weber | < 24 Stunden |

### Wiederherstellungstests
Stichprobenartige Wiederherstellungstests werden **halbjährlich** durchgeführt. Getestet wird:
- Wiederherstellung einzelner Dateien aus SharePoint
- Export/Import von Buchungsdaten aus DATEV
- Zugriff auf archivierte Belege in Lexoffice
- Entschlüsselung und Lesbarkeit des lokalen Backups

### Notfallplan
Ein Notfallplan für IT-Ausfälle ist in der internen Dokumentation auf Microsoft SharePoint hinterlegt. Der Plan umfasst:
- Ansprechpartner und Eskalationswege
- Schritt-für-Schritt-Anleitungen zur Wiederherstellung
- Kontaktdaten der Anbieter-Hotlines
- Priorisierung der wiederherzustellenden Systeme

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_3': {
    client_notes: `Updates: Cloud-Systeme werden automatisch durch die Anbieter aktualisiert. Windows-Updates werden automatisch über Microsoft Update eingespielt. Softwareänderungen werden von Markus Weber dokumentiert. Vor größeren Updates: Prüfung auf Kompatibilität, insbesondere der DATEV-Schnittstellen. Änderungsprotokoll in SharePoint.`,
    generated_text: `## 4.3 Systemänderungen & Updates

### Update-Strategie
Die Beispiel GmbH verfolgt eine differenzierte Update-Strategie für die eingesetzten IT-Systeme:

### Cloud-basierte Systeme (automatische Updates)
Cloud-Dienste (DATEV, Lexoffice, Microsoft 365, GitHub) werden automatisch durch die jeweiligen Anbieter aktualisiert. Die Updates umfassen Funktionserweiterungen, Sicherheitspatches und Fehlerbehebungen. Der Zeitpunkt und Umfang der Updates wird durch die Anbieter bestimmt.

### Lokale Systeme
- **Betriebssystem (Windows)**: Automatische Updates über Microsoft Update (wöchentlich)
- **Antivirensoftware**: Automatische Signaturupdates (täglich)
- **Sonstige Software**: Manuelle Aktualisierung durch Markus Weber bei Verfügbarkeit

### Änderungsmanagement
Bei wesentlichen Systemänderungen wird folgender Prozess eingehalten:
1. **Prüfung**: Bewertung der Auswirkungen, insbesondere auf steuerrelevante Schnittstellen (z. B. Lexoffice → DATEV)
2. **Dokumentation**: Erfassung der Änderung im Änderungsprotokoll (SharePoint)
3. **Durchführung**: Installation/Konfiguration durch Markus Weber
4. **Validierung**: Prüfung der Funktionsfähigkeit nach der Änderung
5. **Protokollierung**: Abschluss und Archivierung im Änderungsprotokoll

### Verantwortlichkeit
Markus Weber (IT-Leiter) ist verantwortlich für:
- Überwachung der automatischen Updates
- Durchführung manueller Updates
- Kompatibilitätsprüfungen vor größeren Änderungen
- Pflege des Änderungsprotokolls in SharePoint

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_4': {
    client_notes: `Aufbewahrungsfristen: Buchungsbelege 10 Jahre, Handels-/Geschäftsbriefe 6 Jahre, Personalunterlagen 6-10 Jahre je nach Art. Archivierung primär digital in DATEV und SharePoint. Papierbelege werden nach Digitalisierung zusätzlich im Büro aufbewahrt. Vernichtung nach Ablauf der Fristen durch Anna Schmidt. Jährliche Prüfung der Aufbewahrungsfristen.`,
    generated_text: `## 4.4 Archivierung & Aufbewahrung

### Gesetzliche Aufbewahrungsfristen

| Dokumentenart | Frist | Rechtsgrundlage |
|--------------|-------|-----------------|
| Buchungsbelege (Ein-/Ausgangsrechnungen) | 10 Jahre | § 147 Abs. 1 Nr. 1 AO, § 257 Abs. 1 Nr. 1 HGB |
| Jahresabschlüsse | 10 Jahre | § 147 Abs. 1 Nr. 1 AO |
| Kontoauszüge | 10 Jahre | § 147 Abs. 1 Nr. 1 AO |
| Handels- und Geschäftsbriefe | 6 Jahre | § 257 Abs. 1 Nr. 2 HGB |
| Lohnunterlagen | 6 Jahre | § 41 Abs. 1 EStG |
| Personalakten | 10 Jahre nach Ausscheiden | Arbeitsrechtliche Aufbewahrungspflicht |

### Archivierungssysteme
Die Archivierung erfolgt primär digital über folgende Systeme:

- **DATEV Unternehmen online**: Revisionssichere Archivierung aller Buchungsbelege, Kontoauszüge und steuerlichen Dokumente
- **Lexoffice**: Archivierung aller Ausgangsrechnungen und Angebote
- **Microsoft SharePoint**: Ablage von Verträgen, Personalunterlagen und interner Dokumentation

### Revisionssicherheit
Die digitale Archivierung erfüllt die Anforderungen der GoBD an die Revisionssicherheit:
- **Unveränderbarkeit**: Archivierte Dokumente können nicht nachträglich verändert werden
- **Vollständigkeit**: Alle steuerrelevanten Dokumente werden lückenlos archiviert
- **Ordnung**: Systematische Ablage nach Dokumentenart und Zeitraum
- **Zeitnähe**: Belege werden zeitnah nach Eingang archiviert
- **Lesbarkeit**: Archivierte Dokumente sind jederzeit lesbar und reproduzierbar

### Vernichtung und Löschung
Die Vernichtung archivierter Dokumente nach Ablauf der Aufbewahrungsfrist obliegt der Geschäftsführerin Anna Schmidt. Die Fristen werden jährlich überprüft. Eine Vernichtung erfolgt erst nach Bestätigung, dass keine weiteren rechtlichen Gründe für eine längere Aufbewahrung bestehen.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_5': {
    client_notes: `Im Falle einer Betriebsprüfung werden die steuerrelevanten Daten über DATEV Unternehmen online bereitgestellt. Zugriff für die Finanzverwaltung: Z1 (unmittelbarer Zugriff auf DATEV) oder Z3 (Datenträgerüberlassung). Verantwortlich für die Bereitstellung: Anna Schmidt in Abstimmung mit der Steuerberaterkanzlei. Alle Daten sind maschinell auswertbar (GDPdU/GoBD-konforme Schnittstelle in DATEV).`,
    generated_text: `## 4.5 Datenzugriff der Finanzverwaltung

### Rechtsgrundlage
Gemäß § 147 Abs. 6 AO hat die Finanzverwaltung im Rahmen von Außenprüfungen das Recht auf Datenzugriff. Die Beispiel GmbH stellt die Erfüllung dieses Rechts durch technische und organisatorische Maßnahmen sicher.

### Zugriffsarten
Die Beispiel GmbH kann folgende Zugriffsarten der Finanzverwaltung unterstützen:

| Zugriffsart | Beschreibung | Umsetzung |
|------------|-------------|-----------|
| **Z1** – Unmittelbarer Zugriff | Prüfer arbeitet direkt im System | Zugang zu DATEV Unternehmen online mit eingeschränktem Leserecht |
| **Z2** – Mittelbarer Zugriff | Auswertungen werden auf Anfrage erstellt | Durch Kanzlei oder intern über DATEV-Auswertungen |
| **Z3** – Datenträgerüberlassung | Export der Daten auf Datenträger | GDPdU-konforme Exportschnittstelle in DATEV |

### Technische Voraussetzungen
- **DATEV Unternehmen online** verfügt über eine GoBD-konforme Exportschnittstelle (vormals GDPdU), die sämtliche steuerrelevanten Daten in maschinell auswertbarer Form bereitstellen kann
- Alle Buchungsdaten, Stammdaten und Belege sind über die DATEV-Schnittstelle exportierbar
- Die Datenformate entsprechen den Anforderungen der Beschreibungsstandards der Finanzverwaltung

### Organisatorische Vorbereitung
Im Falle einer angekündigten Betriebsprüfung:
1. Information der Steuerberaterkanzlei (Musterkanzlei Müller & Partner)
2. Abstimmung der bereitzustellenden Daten und Zeiträume
3. Einrichtung des Prüferzugangs in DATEV (Z1) oder Erstellung des Datenexports (Z3)
4. Bereitstellung eines Arbeitsplatzes für den Prüfer (bei Vor-Ort-Prüfung)

### Verantwortlichkeiten
- **Anna Schmidt**: Gesamtverantwortung und Ansprechpartnerin für die Finanzverwaltung
- **Musterkanzlei Müller & Partner**: Fachliche Begleitung und Datenbereitstellung
- **Markus Weber**: Technische Unterstützung bei Bedarf

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_6': {
    client_notes: `Versionierung: Alle Dokumente in SharePoint werden automatisch versioniert. Änderungen an der Verfahrensdokumentation werden mit Datum und Verantwortlichem protokolliert. Bei Softwarewechseln wird ein Migrationsbericht erstellt. Änderungshistorie ist jederzeit nachvollziehbar. Verantwortlich: Markus Weber (technisch), Anna Schmidt (inhaltlich).`,
    generated_text: `## 4.6 Änderungs- und Versionsmanagement

### Grundsatz
Alle steuerrelevanten Dokumente und die Verfahrensdokumentation unterliegen einem strukturierten Änderungs- und Versionsmanagement. Ziel ist die lückenlose Nachvollziehbarkeit aller Änderungen gemäß den Anforderungen der GoBD.

### Automatische Versionierung
Microsoft SharePoint bietet eine automatische Versionierung für alle gespeicherten Dokumente:
- Jede Änderung erzeugt automatisch eine neue Version
- Frühere Versionen können jederzeit eingesehen und wiederhergestellt werden
- Änderungsdatum, Bearbeiter und Art der Änderung werden protokolliert

### Änderungen an der Verfahrensdokumentation
Änderungen an der Verfahrensdokumentation werden gesondert protokolliert:
- **Änderungsdatum** und **verantwortliche Person**
- **Art der Änderung** (Ergänzung, Korrektur, Aktualisierung)
- **Betroffene Kapitel** und Abschnitte
- **Grund der Änderung**

### Software- und Systemwechsel
Bei einem Wechsel steuerrelevanter Software wird ein Migrationsbericht erstellt, der folgende Informationen enthält:
- Bezeichnung der alten und neuen Software
- Zeitpunkt der Migration
- Migrierte Datenbestände
- Prüfung der Datenintegrität
- Verantwortliche Personen

### Verantwortlichkeiten
- **Anna Schmidt**: Inhaltliche Verantwortung für Änderungen an der Verfahrensdokumentation
- **Markus Weber**: Technische Verantwortung für Systemänderungen und Versionierung

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '4_7': {
    client_notes: `Da unsere Belege überwiegend digital eingehen (90% per E-Mail), ist der Digitalisierungsprozess minimal. Die wenigen Papierbelege (ca. 10%) werden zeitnah eingescannt und in DATEV hochgeladen. Ein ersetzendes Scannen gemäß BSI TR-03138 (RESISCAN) wird derzeit nicht durchgeführt – die Papieroriginale werden zusätzlich aufbewahrt.`,
    generated_text: `## 4.7 Digitalisierung von Papierbelegen

### Ausgangssituation
Die Beispiel GmbH empfängt den überwiegenden Teil ihrer Geschäftsbelege in digitaler Form (ca. 90% per E-Mail). Lediglich ca. 10% der Eingangsbelege erreichen das Unternehmen in Papierform.

### Digitalisierungsprozess
Papierbelege werden nach Eingang zeitnah digitalisiert:
1. **Scannen**: Erfassung des Papierbelegs als PDF-Datei
2. **Qualitätsprüfung**: Überprüfung der Lesbarkeit und Vollständigkeit des Scans
3. **Upload**: Hochladen des digitalisierten Belegs in DATEV Unternehmen online
4. **Zuordnung**: Verknüpfung mit dem entsprechenden Buchungsvorgang

### Ersetzendes Scannen
Ein ersetzendes Scannen gemäß der BSI-Richtlinie TR-03138 (RESISCAN) wird derzeit **nicht** durchgeführt. Dies bedeutet:
- Papieroriginale werden nach der Digitalisierung **zusätzlich im Original aufbewahrt**
- Die Aufbewahrung erfolgt geordnet im Büro der Beispiel GmbH
- Die gesetzlichen Aufbewahrungsfristen gelten für die Papieroriginale

### Qualitätsanforderungen an Scans
- **Auflösung**: Mindestens 300 dpi
- **Format**: PDF (unveränderbar)
- **Farbe**: Farbscan
- **Lesbarkeit**: Alle Textinhalte müssen vollständig lesbar sein

### Verantwortlichkeit
Die Digitalisierung von Papierbelegen liegt in der Verantwortung von Anna Schmidt. Bei Abwesenheit übernimmt Markus Weber diese Aufgabe.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '5_1': {
    client_notes: `Berechtigungskonzept: Jeder Mitarbeiter hat individuelle Zugangsdaten zu allen Systemen. Rechte werden nach dem Prinzip der minimalen Berechtigung vergeben. Administratorrechte hat nur Markus Weber (IT) und Anna Schmidt (Geschäftsführung). Passwortrichtlinie: mindestens 12 Zeichen, Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen. 2FA für DATEV, Lexoffice und Online-Banking. Zugriffsliste wird in SharePoint geführt.`,
    generated_text: `## 5.1 Berechtigungen

### Berechtigungskonzept
Die Beispiel GmbH verfolgt das Prinzip der **minimalen Berechtigung** (Principle of Least Privilege). Jeder Mitarbeiter erhält nur diejenigen Zugriffsrechte, die für die Ausübung seiner Tätigkeit erforderlich sind.

### Berechtigungsmatrix

| System | Anna Schmidt | Markus Weber | Lisa Bauer | Kanzlei |
|--------|-------------|-------------|-----------|---------|
| DATEV | Administrator | — | — | Vollzugriff |
| Lexoffice | Administrator | Lesezugriff | — | — |
| Online-Banking | Vollzugriff | Eingeschränkt | — | — |
| Microsoft 365 | Global Admin | IT-Admin | Standardnutzer | — |
| GitHub | — | Admin | Entwickler | — |
| SharePoint | Vollzugriff | Vollzugriff | Eingeschränkt | — |

### Authentifizierung
- **Passwortrichtlinie**: Mindestens 12 Zeichen, Kombination aus Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen
- **Zwei-Faktor-Authentifizierung (2FA)**: Pflicht für DATEV, Lexoffice und Online-Banking
- **Passwort-Rotation**: Empfohlen alle 90 Tage, erzwungen bei Verdacht auf Kompromittierung

### Administrative Berechtigungen
Administratorzugriff ist auf zwei Personen beschränkt:
- **Anna Schmidt**: Geschäftsführung, administrativer Zugang zu DATEV, Lexoffice und Microsoft 365
- **Markus Weber**: IT-Administration, technischer Administratorzugang zu Microsoft 365 und GitHub

### Verwaltung und Dokumentation
Die aktuelle Berechtigungsübersicht wird in Microsoft SharePoint gepflegt. Änderungen an Berechtigungen werden dokumentiert und umfassen:
- Datum der Änderung
- Betroffener Mitarbeiter und System
- Art der Änderung (Vergabe/Entzug)
- Verantwortliche Person

### Entzug von Berechtigungen
Bei Ausscheiden eines Mitarbeiters werden sämtliche Zugänge unverzüglich gesperrt. Verantwortlich ist Markus Weber in Abstimmung mit der Geschäftsführung.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '5_2': {
    client_notes: `Freigabeprozesse: Ausgangsrechnungen werden durch Anna Schmidt freigegeben. Eingangsrechnungen: sachliche Prüfung durch Anna Schmidt, Zahlungsfreigabe über Online-Banking. Zahlungen über 5.000€ erfordern Geschäftsführer-Freigabe. Lohnabrechnungen werden durch Anna Schmidt freigegeben bevor ADP die Auszahlung vornimmt. Vertretung bei Abwesenheit: Markus Weber (bis 5.000€).`,
    generated_text: `## 5.2 Freigaben

### Freigabeprozesse im Überblick
Die Beispiel GmbH hat für alle wesentlichen Geschäftsprozesse definierte Freigabeverfahren implementiert:

### Rechnungsfreigabe

| Prozess | Freigabe durch | Vertretung | Schwellenwert |
|---------|---------------|------------|--------------|
| Ausgangsrechnungen | Anna Schmidt | — | Alle Beträge |
| Eingangsrechnungen (sachlich) | Anna Schmidt | Markus Weber | Alle Beträge |
| Zahlungsfreigabe | Anna Schmidt | Markus Weber | ≤ 5.000 € |
| Zahlungsfreigabe > 5.000 € | Anna Schmidt | — | > 5.000 € |

### Lohn- und Gehaltsfreigabe
Die monatlichen Lohn- und Gehaltsabrechnungen werden von Anna Schmidt geprüft und freigegeben, bevor ADP die Auszahlung vornimmt.

### Prozessablauf Rechnungsfreigabe
1. Eingang der Rechnung (E-Mail oder Post)
2. Upload in DATEV Unternehmen online
3. Sachliche Prüfung (Leistung erhalten? Betrag korrekt?)
4. Rechnerische Prüfung (Berechnung, Steuersatz, Zahlungskonditionen)
5. Digitale Freigabe in DATEV
6. Zahlungsanweisung über Online-Banking (mit pushTAN)

### Vier-Augen-Prinzip
Aufgrund der kleinen Unternehmensgröße wird das Vier-Augen-Prinzip eingeschränkt angewendet:
- **Zahlungen > 5.000 €**: Ausschließlich durch die Geschäftsführerin
- **Verträge und wesentliche Verpflichtungen**: Nur durch die Geschäftsführerin
- **Buchhaltungsrelevante Entscheidungen**: In Abstimmung mit der Steuerberaterkanzlei

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '5_3': {
    client_notes: `Plausibilitätskontrollen: Lexoffice prüft Rechnungen automatisch auf Pflichtangaben. DATEV prüft Buchungssätze auf formale Korrektheit. Online-Banking prüft IBAN-Validierung. Monatliche Abstimmung durch die Kanzlei: Kontenabstimmung, OP-Abstimmung, Umsatzsteuerabstimmung. Bei Auffälligkeiten wird Anna Schmidt informiert.`,
    generated_text: `## 5.3 Plausibilitätskontrollen

### Automatische Systemkontrollen
Die eingesetzten Softwaresysteme verfügen über integrierte Plausibilitätsprüfungen:

| System | Kontrolle | Art |
|--------|----------|-----|
| Lexoffice | Prüfung auf gesetzliche Pflichtangaben bei Rechnungen | Automatisch |
| Lexoffice | Warnung bei abweichenden Steuersätzen | Automatisch |
| DATEV | Formale Prüfung der Buchungssätze | Automatisch |
| DATEV | Kontenabstimmung und Saldenkontrolle | Halbautomatisch |
| Online-Banking | IBAN-Validierung bei Überweisungen | Automatisch |
| Online-Banking | Duplikaterkennung bei Zahlungsaufträgen | Automatisch |

### Manuelle Kontrollen
Ergänzend zu den automatischen Kontrollen werden folgende manuelle Prüfungen durchgeführt:

**Monatlich durch die Musterkanzlei Müller & Partner:**
- Kontenabstimmung (Soll/Haben-Vergleich)
- Offene-Posten-Abstimmung (Debitoren und Kreditoren)
- Umsatzsteuerabstimmung (Vorsteuer vs. Umsatzsteuer)
- Plausibilitätsprüfung der Buchungssätze

**Jährlich im Rahmen der Abschlussvorbereitung:**
- Vollständigkeitsprüfung der Belege
- Abstimmung der Anlagenbuchhaltung
- Prüfung der Rückstellungen und Abgrenzungen

### Eskalation bei Auffälligkeiten
Bei Feststellung von Unregelmäßigkeiten oder Auffälligkeiten wird die Geschäftsführerin Anna Schmidt unverzüglich informiert. Die Art der Auffälligkeit, das betroffene Konto und die empfohlene Maßnahme werden dokumentiert.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '5_4': {
    client_notes: `Verantwortlichkeiten im IKS: Geschäftsführerin Anna Schmidt trägt die Gesamtverantwortung für das interne Kontrollsystem. Markus Weber ist für die IT-Sicherheit verantwortlich. Die Steuerberaterkanzlei überwacht die Einhaltung der steuerlichen Vorschriften im Rahmen der laufenden Buchführung. Verantwortlichkeiten sind in der IKS-Dokumentation auf SharePoint festgehalten.`,
    generated_text: `## 5.4 Verantwortlichkeiten

### Gesamtverantwortung
Die Gesamtverantwortung für das Interne Kontrollsystem (IKS) der Beispiel GmbH liegt bei der Geschäftsführerin **Anna Schmidt**. Sie stellt sicher, dass angemessene Kontrollen implementiert und aufrechterhalten werden.

### Verantwortungsbereiche

| Person / Stelle | Verantwortungsbereich |
|----------------|----------------------|
| Anna Schmidt (GF) | Gesamtverantwortung IKS, Finanzprozesse, Freigaben |
| Markus Weber (IT) | IT-Sicherheit, Systemadministration, technische Kontrollen |
| Musterkanzlei Müller & Partner | Steuerliche Compliance, Buchführungskontrolle |
| ADP | Ordnungsgemäße Lohnabrechnung (im Rahmen des Dienstleistungsvertrags) |

### Überwachungsmaßnahmen
- **Monatlich**: Prüfung der Buchführung durch die Steuerberaterkanzlei
- **Quartalsweise**: Review der IT-Sicherheitsmaßnahmen durch Markus Weber
- **Jährlich**: Gesamtbewertung des IKS durch die Geschäftsführung
- **Anlassbezogen**: Bei Systemänderungen, Personalwechseln oder erkannten Schwachstellen

### Dokumentation
Sämtliche IKS-relevanten Verantwortlichkeiten, Kontrollen und Prüfungsergebnisse werden in der IKS-Dokumentation auf Microsoft SharePoint gepflegt. Die Dokumentation wird mindestens jährlich aktualisiert.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
  '5_5': {
    client_notes: `Umgang mit Fehlern: Buchungsfehler werden ausschließlich durch die Steuerberaterkanzlei korrigiert (Korrekturbuchungen, keine Löschungen). Fehlerhafte Rechnungen werden storniert und neu erstellt (Lexoffice). Bei IT-Fehlern: Meldung an Markus Weber, Dokumentation in SharePoint. Bei steuerrelevanten Fehlern: Information an die Kanzlei. Alle Fehler und Korrekturen werden protokolliert.`,
    generated_text: `## 5.5 Umgang mit Fehlern

### Grundsatz
Fehler in steuerrelevanten Daten und Prozessen werden unverzüglich erkannt, korrigiert und dokumentiert. Direkte Löschungen von Buchungssätzen oder Belegen sind grundsätzlich ausgeschlossen. Alle Korrekturen erfolgen nachvollziehbar durch Korrekturbuchungen oder Stornierungen.

### Fehlerarten und Korrekturverfahren

| Fehlerart | Korrekturverfahren | Verantwortlich |
|-----------|-------------------|---------------|
| Buchungsfehler | Korrekturbuchung in DATEV | Musterkanzlei Müller & Partner |
| Fehlerhafte Ausgangsrechnung | Stornierung und Neuausstellung in Lexoffice | Anna Schmidt |
| Fehlerhafte Eingangsrechnung | Rücksprache mit Lieferant, ggf. Gutschrift anfordern | Anna Schmidt |
| IT-Systemfehler | Fehlerbehebung und Dokumentation | Markus Weber |
| Datenübertragungsfehler | Prüfung und erneute Übertragung | Markus Weber / Kanzlei |

### Korrekturprozess im Detail
1. **Fehlererkennung**: Durch automatische Systemprüfungen oder manuelle Kontrollen
2. **Fehlermeldung**: Dokumentation in SharePoint mit Datum, Art und Auswirkung
3. **Korrekturmaßnahme**: Durchführung der geeigneten Korrektur
4. **Nachkontrolle**: Überprüfung der Korrektur auf Richtigkeit
5. **Protokollierung**: Abschließende Dokumentation mit Ergebnis und Unterschrift

### Eskalation
Bei steuerrelevanten Fehlern wird unverzüglich die Steuerberaterkanzlei informiert. Bei schwerwiegenden Fehlern (z. B. Datenverlust, Systemausfall) greift der Notfallplan (siehe Kapitel 4.2).

### Protokollierung
Alle Fehler und deren Korrekturen werden in einem Fehlerprotokoll auf SharePoint dokumentiert. Das Protokoll umfasst: Datum, Art des Fehlers, betroffenes System/Konto, durchgeführte Korrektur, verantwortliche Person.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  },
};

// Inactive chapter texts (for chapters deactivated by onboarding answers)
const INACTIVE_CHAPTER_TEXTS: Record<string, string> = {
  '2_3': `## 2.3 Kassenprozesse

### Negativvermerk
Im Unternehmen der Beispiel GmbH finden keine Bargeschäfte statt. Sämtliche Zahlungsvorgänge werden ausschließlich über das Geschäftskonto bei der Sparkasse München abgewickelt. Eine Kassenbuchführung ist daher nicht erforderlich und wird nicht durchgeführt.

Die Geschäftsführerin Anna Schmidt bestätigt, dass zum Zeitpunkt der Erstellung dieser Verfahrensdokumentation keine Bargeschäfte getätigt werden und keine Bargeldbestände im Unternehmen vorhanden sind.

Sollte sich dieser Sachverhalt in der Zukunft ändern, wird die Verfahrensdokumentation entsprechend aktualisiert und um eine Beschreibung der Kassenprozesse ergänzt.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  '2_4': `## 2.4 Zahlungsanbieter

### Negativvermerk
Die Beispiel GmbH nutzt keine externen Zahlungsanbieter (z. B. PayPal, Stripe, Klarna). Sämtliche Zahlungen werden über das reguläre Geschäftskonto bei der Sparkasse München abgewickelt.

Eine Anbindung an externe Zahlungsdienstleister ist zum Zeitpunkt der Dokumentation nicht vorgesehen. Sollte sich dieser Sachverhalt ändern, wird die Verfahrensdokumentation entsprechend ergänzt.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  '2_5': `## 2.5 Marktplatz-/Plattformverkäufe

### Negativvermerk
Die Beispiel GmbH vertreibt keine Waren oder Dienstleistungen über Online-Marktplätze oder Plattformen (z. B. Amazon, eBay). Der Vertrieb erfolgt ausschließlich direkt über individuelle Kundenbeziehungen.

Dieses Unterkapitel entfällt daher. Bei einer zukünftigen Nutzung von Online-Marktplätzen wird die Verfahrensdokumentation entsprechend erweitert.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  '2_6': `## 2.6 Digitalisierung / Scanprozess

### Negativvermerk
Da die Beispiel GmbH den überwiegenden Teil ihrer Belege in digitaler Form empfängt (ca. 90% per E-Mail), wird kein formalisierter Scanprozess durchgeführt. Die wenigen Papierbelege (ca. 10%) werden zwar zeitnah digitalisiert und in DATEV hochgeladen, ein ersetzendes Scannen gemäß BSI TR-03138 (RESISCAN) wird jedoch nicht durchgeführt.

Die Papieroriginale werden zusätzlich im Original aufbewahrt (siehe Kapitel 4.7 Digitalisierung von Papierbelegen).

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  '3_3': `## 3.3 E-Rechnungsprozesse

### Negativvermerk
Die Beispiel GmbH nutzt derzeit keine E-Rechnungsverfahren (z. B. ZUGFeRD, XRechnung). Eingangs- und Ausgangsrechnungen werden als PDF-Dokumente verarbeitet.

Hinweis: Ab dem 01.01.2025 besteht in Deutschland die Pflicht zum Empfang von E-Rechnungen im B2B-Bereich. Die Beispiel GmbH wird die Verfahrensdokumentation rechtzeitig vor der Einführung von E-Rechnungsprozessen aktualisieren.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
  '3_6': `## 3.6 Zahlungsplattformen

### Negativvermerk
Die Beispiel GmbH nutzt keine Zahlungsplattformen oder Online-Marktplätze. Dieses Unterkapitel entfällt daher.

---
*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`,
};

export async function seedDemoData() {
  const errors: string[] = [];

  // ─── 1. Find or create Professional plan ───
  let planId: string;
  const { data: existingPlan } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Professional')
    .maybeSingle();

  if (existingPlan) {
    planId = existingPlan.id;
  } else {
    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert({ name: 'Professional', max_clients: 25, max_projects: 50, price_monthly: 149.0 })
      .select()
      .single();
    if (error) throw new Error(`Plan-Fehler: ${error.message}`);
    planId = newPlan.id;
  }
  console.log('[SEED] Plan ID:', planId);

  // ─── 2. Tenant ───
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert({
      name: 'Musterkanzlei Müller & Partner',
      contact_name: 'Thomas Müller',
      contact_email: 'mueller@musterkanzlei.de',
      plan_id: planId,
      is_active: true,
    })
    .select()
    .single();
  if (tenantErr) throw new Error(`Tenant-Fehler: ${tenantErr.message}`);
  const tenantId = tenant.id;
  console.log('[SEED] Tenant ID:', tenantId);

  // ─── Tenant Settings ───
  const { error: tsErr } = await supabase.from('tenant_settings').insert({
    tenant_id: tenantId,
    brand_name: 'Musterkanzlei Müller & Partner',
    primary_color: '#1e3a5f',
    address: 'Kanzleistraße 12, 80333 München',
    phone: '+49 89 1234567',
    website: 'https://www.musterkanzlei-mueller.de',
    imprint: 'Musterkanzlei Müller & Partner\nKanzleistraße 12\n80333 München\nTel: +49 89 1234567\nE-Mail: info@musterkanzlei-mueller.de\nUSt-IdNr.: DE123456789',
  });
  if (tsErr) errors.push(`Tenant-Settings: ${tsErr.message}`);

  // ─── 3. Client (Mandant) ───
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      tenant_id: tenantId,
      company: 'Beispiel GmbH',
      industry: 'IT-Dienstleistungen',
      contact_name: 'Anna Schmidt',
      contact_email: 'schmidt@beispiel-gmbh.de',
      legal_form: 'GmbH',
      founding_year: 2018,
      has_employees: true,
      accounting_mode: 'Soll-Versteuerung',
      has_business_account: true,
      accounting_contact: 'Maria Muster',
      it_contact: 'Markus Weber (IT-Leiter)',
      uses_external_payroll: true,
      tax_number: '143/123/12345',
      scope_org_units: 'Hauptniederlassung München, 3 Mitarbeiter',
      scope_dv_systems: 'DATEV Unternehmen online, Microsoft 365, Lexoffice',
      scope_processes: 'Rechnungseingang, Rechnungsausgang, Zahlungsverkehr, Personalwesen',
      doc_owner_name: 'Anna Schmidt',
      doc_owner_role: 'Geschäftsführerin',
      process_owner_name: 'Thomas Müller (Steuerberater)',
      it_owner_name: 'Markus Weber',
      external_providers: 'Musterkanzlei Müller & Partner (Steuerberatung), ADP (Lohnabrechnung)',
      onboarding_status: 'completed',
    })
    .select()
    .single();
  if (clientErr) throw new Error(`Client-Fehler: ${clientErr.message} (Code: ${clientErr.code}, Details: ${clientErr.details})`);
  if (!client) throw new Error('Client wurde nicht erstellt – kein Datensatz zurückgegeben');
  const clientId = client.id;
  console.log('[SEED] Client ID:', clientId);

  // ─── Verify client was actually persisted ───
  const { data: verifyClient, error: verifyErr } = await supabase
    .from('clients')
    .select('id, company, tenant_id')
    .eq('id', clientId)
    .single();
  if (verifyErr || !verifyClient) {
    throw new Error(`Client-Verifizierung fehlgeschlagen: ${verifyErr?.message || 'Nicht gefunden'}. Der Mandant wurde möglicherweise durch RLS blockiert.`);
  }
  console.log('[SEED] Client verified:', verifyClient);

  // ─── 4. Project ───
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      tenant_id: tenantId,
      client_id: clientId,
      name: 'Verfahrensdokumentation 2024',
      status: 'active',
      workflow_status: 'review',
    })
    .select()
    .single();
  if (projErr) throw new Error(`Project-Fehler: ${projErr.message} (Code: ${projErr.code})`);
  if (!project) throw new Error('Projekt wurde nicht erstellt');
  const projectId = project.id;
  console.log('[SEED] Project ID:', projectId);

  // ─── 5. Onboarding ───
  const { error: onbErr } = await supabase.from('project_onboarding').insert({
    project_id: projectId,
    answers: DEMO_ONBOARDING,
    completed_at: new Date().toISOString(),
  });
  if (onbErr) errors.push(`Onboarding: ${onbErr.message}`);

  // ─── 6. All Chapter Data ───
  const now = new Date().toISOString();
  const chapterInserts: any[] = [];

  for (const mainCh of GOBD_CHAPTERS) {
    for (const sc of mainCh.subChapters) {
      const isActive = sc.isActive(DEMO_ONBOARDING);
      const content = CHAPTER_CONTENT[sc.key];
      const inactiveText = INACTIVE_CHAPTER_TEXTS[sc.key] || sc.inactiveText || `## ${sc.number} ${sc.title}\n\n### Negativvermerk\nDieses Unterkapitel ist für die Beispiel GmbH nicht relevant und entfällt.\n\n---\n*[DEMO – Dieses Dokument wurde mit Beispieldaten erstellt]*`;

      if (isActive && content) {
        chapterInserts.push({
          project_id: projectId,
          chapter_key: sc.key,
          client_notes: content.client_notes,
          submitted_client_notes: content.client_notes,
          submitted_at: now,
          client_precheck_hints: 'Alle Angaben vollständig',
          generated_text: content.generated_text,
          editor_text: content.generated_text,
          status: 'advisor_approved',
          precheck_hints_count: 0,
        });
      } else if (!isActive) {
        chapterInserts.push({
          project_id: projectId,
          chapter_key: sc.key,
          client_notes: null,
          submitted_client_notes: null,
          submitted_at: null,
          client_precheck_hints: null,
          generated_text: inactiveText,
          editor_text: inactiveText,
          status: 'advisor_approved',
          precheck_hints_count: 0,
        });
      }
    }
  }

  const { error: chapterErr } = await supabase.from('chapter_data').insert(chapterInserts);
  if (chapterErr) errors.push(`Kapitel: ${chapterErr.message}`);
  console.log('[SEED] Chapters inserted:', chapterInserts.length);

  // ─── 7. Document Version (finalized) ───
  const { error: docErr } = await supabase.from('document_versions').insert({
    project_id: projectId,
    version_number: 1,
    is_draft: false,
    status: 'finalized',
    notes: 'Erstversion der Verfahrensdokumentation – Demo-Datensatz',
  });
  if (docErr) errors.push(`Dokumentversion: ${docErr.message}`);

  // ─── Final verification ───
  const [vClient, vProject, vChapters, vOnb] = await Promise.all([
    supabase.from('clients').select('id').eq('id', clientId).single(),
    supabase.from('projects').select('id').eq('id', projectId).single(),
    supabase.from('chapter_data').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('project_onboarding').select('id').eq('project_id', projectId).maybeSingle(),
  ]);

  const verification = {
    clientExists: !!vClient.data,
    projectExists: !!vProject.data,
    chapterCount: vChapters.count || 0,
    onboardingExists: !!vOnb.data,
  };
  console.log('[SEED] Final verification:', verification);

  const warningMsg = errors.length > 0 ? `\n⚠️ Warnungen: ${errors.join(', ')}` : '';

  return {
    tenantId,
    clientId,
    projectId,
    verification,
    message: `Vollständiger Demo-Datensatz angelegt:\n• Tenant: ${tenantId}\n• Client: ${clientId} (${verification.clientExists ? '✓' : '✗'})\n• Projekt: ${projectId} (${verification.projectExists ? '✓' : '✗'})\n• Kapitel: ${verification.chapterCount}\n• Onboarding: ${verification.onboardingExists ? '✓' : '✗'}${warningMsg}`,
  };
}
