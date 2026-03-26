import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import landingLogo from "@/assets/landing-logo.png";
import { useSEO } from "@/hooks/useSEO";

export default function AVV() {
  useSEO({
    title: "Auftragsverarbeitungsvertrag | GoBD-Suite",
    robots: "noindex, nofollow",
  });

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased">
      <nav className="border-b border-[#e5e5e5]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={landingLogo} alt="gobdsuite" className="h-10 object-contain" />
          </Link>
          <Link to="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Auftragsverarbeitungsvertrag (AVV)</h1>
        <p className="text-sm text-[#86868b] mb-12">gemäß Art. 28 DSGVO – Stand: März 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-[#1d1d1f]">
          <section>
            <h2 className="text-xl font-semibold mb-3">§ 1 Gegenstand und Dauer</h2>
            <p className="mb-2">
              1.1 Dieser Auftragsverarbeitungsvertrag ergänzt die Allgemeinen Geschäftsbedingungen und regelt die Rechte
              und Pflichten der Vertragsparteien im Zusammenhang mit der Verarbeitung personenbezogener Daten im Auftrag
              des Kunden (Verantwortlicher) durch den Anbieter (Auftragsverarbeiter).
            </p>
            <p className="mb-2 pl-4">
              Auftragsverarbeiter:
              <br />
              Gaetano Ficarra | gaetanoficarra.de | Bielefeld | E-Mail: kontakt@gaetanoficarra.de
            </p>
            <p>
              1.2 Die Laufzeit dieses AVV entspricht der Laufzeit des Hauptvertrags. Mit Beendigung des Hauptvertrags
              endet auch dieser AVV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 2 Gegenstand und Zweck der Verarbeitung</h2>
            <p className="mb-2">
              2.1 Der Auftragsverarbeiter verarbeitet personenbezogene Daten im Namen des Verantwortlichen im Rahmen der
              Bereitstellung der GoBD-Suite, insbesondere:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Erstellung und Verwaltung GoBD-konformer Verfahrensdokumentationen</li>
              <li>Mandantenverwaltung (Stammdaten, Onboarding-Informationen)</li>
              <li>KI-gestützte Verarbeitung von Mandantendaten zur Textgenerierung</li>
              <li>Versionierung und revisionssichere Archivierung von Dokumenten</li>
              <li>Versand transaktionaler E-Mails (Einladungen, Statusmeldungen)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 3 Art der Daten und Kategorien betroffener Personen</h2>
            <p className="mb-2 font-medium">3.1 Art der personenbezogenen Daten:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Stammdaten (Name, E-Mail, Unternehmensbezeichnung, Adresse)</li>
              <li>
                Betriebliche Daten zur Buchführung und IT-Infrastruktur, soweit im Rahmen der Verfahrensdokumentation
                erfasst
              </li>
              <li>Nutzungsdaten und technische Daten (IP-Adresse, Browserinformationen, Login-Zeitpunkte)</li>
              <li>Kommunikationsdaten (E-Mail-Inhalte im Rahmen transaktionaler E-Mails)</li>
            </ul>
            <p className="mb-2 font-medium">3.2 Kategorien betroffener Personen:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mandanten des Verantwortlichen (Berater/Agentur-Plan)</li>
              <li>Mitarbeitende und Verantwortliche des Mandanten, soweit in der Verfahrensdokumentation erfasst</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 4 Pflichten des Auftragsverarbeiters</h2>
            <p className="mb-2">Der Auftragsverarbeiter verpflichtet sich:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Personenbezogene Daten nur auf dokumentierte Weisung des Verantwortlichen zu verarbeiten (Art. 28 Abs. 3
                lit. a DSGVO).
              </li>
              <li>
                Sicherzustellen, dass sich die zur Verarbeitung befugten Personen zur Vertraulichkeit verpflichtet haben
                (Art. 28 Abs. 3 lit. b DSGVO).
              </li>
              <li>Alle gemäß Art. 32 DSGVO erforderlichen technischen und organisatorischen Maßnahmen zu ergreifen.</li>
              <li>Den Verantwortlichen bei der Erfüllung seiner Pflichten gemäß Art. 32–36 DSGVO zu unterstützen.</li>
              <li>Den Verantwortlichen unverzüglich über Datenschutzverletzungen zu informieren (Art. 33 DSGVO).</li>
              <li>
                Dem Verantwortlichen alle erforderlichen Informationen zum Nachweis der Einhaltung der DSGVO zur
                Verfügung zu stellen und Überprüfungen zu ermöglichen.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 5 Technische und organisatorische Maßnahmen (TOMs)</h2>
            <p className="mb-3">Der Auftragsverarbeiter trifft insbesondere folgende Maßnahmen:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Zutrittskontrolle:</strong> Server-Hosting bei Netcup in deutschen Rechenzentren mit physischer
                Zugangskontrolle.
              </li>
              <li>
                <strong>Zugangskontrolle:</strong> Authentifizierung über sichere Auth-Systeme mit Passwort-Hashing,
                optionale Multi-Faktor-Authentifizierung.
              </li>
              <li>
                <strong>Zugriffskontrolle:</strong> Row-Level-Security in der Datenbank, rollenbasierte Berechtigungen,
                vollständige Mandantentrennung.
              </li>
              <li>
                <strong>Verschlüsselung:</strong> TLS/SSL-Verschlüsselung für alle Datenübertragungen, Verschlüsselung
                sensibler Daten at rest.
              </li>
              <li>
                <strong>Verfügbarkeitskontrolle:</strong> Redundante Infrastruktur, regelmäßige Backups,
                Systemmonitoring.
              </li>
              <li>
                <strong>Trennungskontrolle:</strong> Mandantenfähiges System mit vollständiger Datentrennung zwischen
                allen Nutzerkonten.
              </li>
              <li>
                <strong>Auditierbarkeit:</strong> Revisionssichere Versionierung aller Dokumentänderungen mit
                Änderungshistorie und Zeitstempel.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 6 Unterauftragsverarbeiter</h2>
            <p className="mb-2">
              6.1 Der Verantwortliche erteilt hiermit eine allgemeine Genehmigung zur Einschaltung von
              Unterauftragsverarbeitern. Der Auftragsverarbeiter informiert den Verantwortlichen über jede beabsichtigte
              Hinzuziehung oder Ersetzung und gibt dem Verantwortlichen die Möglichkeit, Einspruch zu erheben.
            </p>
            <p className="mb-3">6.2 Aktuell eingesetzte Unterauftragsverarbeiter:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-[#e5e5e5] rounded-lg">
                <thead>
                  <tr className="bg-[#f5f5f7] text-left">
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Unterauftragnehmer</th>
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Zweck</th>
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Standort</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2">Netcup GmbH</td>
                    <td className="px-4 py-2">
                      Server-Hosting, Infrastruktur, Self-hosted Supabase (Datenbank, Authentifizierung, Edge Functions)
                    </td>
                    <td className="px-4 py-2">Deutschland</td>
                  </tr>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2">OpenAI, Inc.</td>
                    <td className="px-4 py-2">KI-Textgenerierung (GPT-4 API)</td>
                    <td className="px-4 py-2">USA (DPF/SCCs)</td>
                  </tr>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2">Resend, Inc.</td>
                    <td className="px-4 py-2">Transaktionaler E-Mail-Versand</td>
                    <td className="px-4 py-2">USA (DPF)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Funnelpay / Stripe</td>
                    <td className="px-4 py-2">Zahlungsabwicklung</td>
                    <td className="px-4 py-2">EU</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Für Unterauftragsverarbeiter außerhalb der EU sind geeignete Garantien sichergestellt, insbesondere EU-US
              Data Privacy Framework oder EU-Standardvertragsklauseln.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 7 Löschung und Rückgabe von Daten</h2>
            <p className="mb-2">
              7.1 Nach Beendigung des Hauptvertrags löscht der Auftragsverarbeiter alle im Auftrag verarbeiteten
              personenbezogenen Daten, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            <p className="mb-2">
              7.2 Der Verantwortliche kann seine Daten innerhalb von 30 Tagen nach Vertragsbeendigung in einem gängigen
              Format exportieren.
            </p>
            <p>7.3 Die Löschung wird dem Verantwortlichen auf Anfrage schriftlich bestätigt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 8 Kontrollrechte des Verantwortlichen</h2>
            <p className="mb-2">
              8.1 Der Verantwortliche hat das Recht, die Einhaltung der vereinbarten technischen und organisatorischen
              Maßnahmen sowie der Bestimmungen dieses AVV zu überprüfen. Der Auftragsverarbeiter stellt die hierfür
              erforderlichen Informationen zur Verfügung.
            </p>
            <p className="mb-2">
              8.2 Inspektionen und Audits sind mit einer Vorankündigungsfrist von mindestens 14 Tagen und unter Wahrung
              der Geschäftsgeheimnisse durchzuführen.
            </p>
            <p>
              8.3 Der Auftragsverarbeiter kann den Nachweis der Einhaltung auch durch Vorlage geeigneter
              Zertifizierungen oder Prüfberichte erbringen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 9 Haftung bei Datenschutzverletzungen</h2>
            <p className="mb-2">
              9.1 Der Auftragsverarbeiter haftet gegenüber dem Verantwortlichen für Schäden, die durch eine nicht
              DSGVO-konforme Verarbeitung entstehen, soweit er die Pflichtverletzung zu vertreten hat.
            </p>
            <p>
              9.2 Der Auftragsverarbeiter haftet nicht für Schäden, die auf unrichtige, unvollständige oder
              datenschutzrechtlich unzulässige Weisungen des Verantwortlichen zurückzuführen sind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">§ 10 Schlussbestimmungen</h2>
            <p className="mb-2">
              10.1 Sollten einzelne Bestimmungen dieses AVV unwirksam sein oder werden, bleibt die Wirksamkeit der
              übrigen Bestimmungen unberührt.
            </p>
            <p className="mb-2">10.2 Es gilt das Recht der Bundesrepublik Deutschland.</p>
            <p>10.3 Änderungen dieses AVV bedürfen der Textform.</p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e5e5e5] py-6 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868b]">
          <Link to="/impressum" className="hover:text-[#1d1d1f] transition-colors">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-[#1d1d1f] transition-colors">
            Datenschutz
          </Link>
          <Link to="/agb" className="hover:text-[#1d1d1f] transition-colors">
            AGB
          </Link>
          <Link to="/avv" className="hover:text-[#1d1d1f] transition-colors">
            AVV
          </Link>
        </div>
      </footer>
    </div>
  );
}
