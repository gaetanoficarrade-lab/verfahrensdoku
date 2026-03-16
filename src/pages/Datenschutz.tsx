import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import landingLogo from '@/assets/landing-logo.png';

export default function Datenschutz() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased">
      <nav className="border-b border-[#e5e5e5]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/">
            <img src={landingLogo} alt="GoBD-Suite Logo" className="h-10 object-contain" />
          </Link>
          <Link to="/" className="text-sm text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Datenschutzerklärung</h1>
        <p className="text-sm text-[#86868b] mb-12">Stand: März 2026</p>

        <div className="space-y-10 text-[#86868b] leading-relaxed">
          {/* 1. Überblick */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">1. Datenschutz auf einen Blick</h2>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit deinen personenbezogenen Daten passiert,
              wenn du diese Website besuchst. Personenbezogene Daten sind alle Daten, mit denen du persönlich identifiziert
              werden kannst.
            </p>
          </section>

          {/* 2. Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">2. Verantwortlicher</h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="mt-3">
              Gaetano Ficarra<br />
              Elverdisser Str. 51<br />
              33729 Bielefeld<br />
              Deutschland
            </p>
            <p className="mt-3">
              E-Mail: kontakt@gaetanoficarra.de<br />
              WhatsApp: 0152 23856537
            </p>
          </section>

          {/* 3. Datenerfassung */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">3. Welche Daten erfassen wir?</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">a) Server-Logfiles</h3>
            <p>
              Beim Besuch unserer Website werden automatisch folgende Daten erfasst: IP-Adresse, Datum und Uhrzeit
              der Anfrage, Zeitzonendifferenz zur GMT, Inhalt der Anforderung (besuchte Seite), HTTP-Statuscode,
              übertragene Datenmenge, Referrer-URL, Browser und Betriebssystem.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
              an der sicheren und effizienten Bereitstellung der Website).
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Speicherdauer:</strong> Server-Logfiles werden nach 30 Tagen automatisch gelöscht.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">b) Registrierung und Nutzerkonto</h3>
            <p>
              Bei der Registrierung erheben wir: E-Mail-Adresse, Passwort (verschlüsselt gespeichert),
              Unternehmensname und Kontaktdaten.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Speicherdauer:</strong> Bis zur Löschung des Nutzerkontos bzw. 30 Tage nach
              Vertragsbeendigung (Export-Frist gemäß AGB).
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">c) Verfahrensdokumentationen</h3>
            <p>
              Im Rahmen der Nutzung des Dienstes werden betriebliche Daten zur Buchführung und IT-Infrastruktur
              verarbeitet, soweit diese im Rahmen der Verfahrensdokumentation eingegeben werden.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">d) Kundendaten (Berater/Agentur)</h3>
            <p>
              Berater und Agenturen verarbeiten über den Dienst personenbezogene Daten ihrer Kunden
              (Stammdaten, Onboarding-Informationen). In diesem Fall agieren wir als Auftragsverarbeiter
              gemäß Art. 28 DSGVO. Details regelt der gesonderte{' '}
              <Link to="/avv" className="text-[#e8a91a] hover:text-[#d49b15] underline">Auftragsverarbeitungsvertrag (AVV)</Link>.
            </p>
          </section>

          {/* 4. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">4. Cookies und lokale Speicherung</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Was sind Cookies?</h3>
            <p>
              Cookies sind kleine Textdateien, die auf deinem Endgerät gespeichert werden. Wir verwenden außerdem
              den localStorage deines Browsers, um funktionsrelevante Daten zu speichern.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Notwendige Cookies & Speichereinträge</h3>
            <p className="mb-3">
              Diese sind für den Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden.
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#e5e5e5] rounded-lg">
                <thead>
                  <tr className="bg-[#f5f5f7] text-left text-[#1d1d1f]">
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Name</th>
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Zweck</th>
                    <th className="px-4 py-2 font-semibold border-b border-[#e5e5e5]">Speicherdauer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2 font-mono text-xs">cookie_consent</td>
                    <td className="px-4 py-2">Speichert deine Cookie-Einstellungen</td>
                    <td className="px-4 py-2">Dauerhaft (localStorage)</td>
                  </tr>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2 font-mono text-xs">sb-*-auth-token</td>
                    <td className="px-4 py-2">Authentifizierung und Sitzungsverwaltung</td>
                    <td className="px-4 py-2">Bis zum Logout / Sitzungsablauf</td>
                  </tr>
                  <tr className="border-b border-[#e5e5e5]">
                    <td className="px-4 py-2 font-mono text-xs">sidebar:state</td>
                    <td className="px-4 py-2">Zustand der Navigation (auf-/zugeklappt)</td>
                    <td className="px-4 py-2">Dauerhaft (localStorage)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-xs">first-steps-*</td>
                    <td className="px-4 py-2">Fortschritt des Onboarding-Assistenten</td>
                    <td className="px-4 py-2">Dauerhaft (localStorage)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Optionale Cookies</h3>
            <p>
              Optionale Cookies (Analyse, Marketing) werden nur gesetzt, wenn du dem über unseren Cookie-Banner
              ausdrücklich zustimmst (Opt-in). Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
              Du kannst deine Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer widerrufen.
            </p>
            <p className="mt-2">
              Wir nutzen aktuell keine Analyse- oder Marketing-Cookies.
            </p>
          </section>

          {/* 5. Drittanbieter */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">5. Drittanbieter und externe Dienste</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Netcup GmbH (Hosting)</h3>
            <p>
              Das Hosting der Anwendung erfolgt bei Netcup GmbH auf Servern in deutschen Rechenzentren.
              Die Infrastruktur umfasst Self-hosted Supabase (Datenbank, Authentifizierung, Edge Functions).
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Standort:</strong> Deutschland<br />
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">OpenAI, Inc. (KI-Textgenerierung)</h3>
            <p>
              Wir nutzen die API von OpenAI (GPT-4) zur KI-gestützten Textgenerierung und Prüfung von Kapitelinhalten.
              Deine Eingaben werden zur Verarbeitung an OpenAI übermittelt.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Standort:</strong> USA<br />
              <strong className="text-[#1d1d1f]">Garantien:</strong> EU-US Data Privacy Framework (DPF) und EU-Standardvertragsklauseln (SCCs)<br />
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Resend, Inc. (E-Mail-Versand)</h3>
            <p>
              Für den Versand transaktionaler E-Mails (Einladungen, Statusmeldungen) nutzen wir Resend, Inc.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Standort:</strong> USA<br />
              <strong className="text-[#1d1d1f]">Garantien:</strong> EU-US Data Privacy Framework (DPF)<br />
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Funnelpay / Stripe (Zahlungsabwicklung)</h3>
            <p>
              Für die Zahlungsabwicklung nutzen wir Funnelpay bzw. Stripe. Diese Anbieter verarbeiten
              deine Zahlungsdaten gemäß deren eigenen Datenschutzbestimmungen.
            </p>
            <p className="mt-2">
              <strong className="text-[#1d1d1f]">Standort:</strong> EU<br />
              <strong className="text-[#1d1d1f]">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            </p>
          </section>

          {/* 6. Aufbewahrungsfristen */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">6. Aufbewahrungsfristen</h2>
            <p>Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li>Vertragsdaten: Für die Dauer des Vertragsverhältnisses zzgl. 30 Tage Export-Frist</li>
              <li>Rechnungsdaten: 10 Jahre (handels- und steuerrechtliche Aufbewahrungspflichten)</li>
              <li>Server-Logfiles: 30 Tage</li>
              <li>Cookie-Einwilligungen: Bis zum Widerruf</li>
            </ul>
            <p className="mt-3">
              Nach Ablauf der jeweiligen Fristen werden die Daten gelöscht, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          {/* 7. Keine externen Ressourcen ohne Einwilligung */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">7. Keine externen Ressourcen ohne Einwilligung</h2>
            <p>
              Wir laden keine Schriftarten, Skripte oder Medien von externen Servern (z.B. Google Fonts, Google Analytics,
              Facebook Pixel, YouTube). Alle Schriftarten sind lokal auf unserem Server gespeichert.
              Externe Dienste wie Analyse- oder Marketing-Tools werden nur mit deiner ausdrücklichen Einwilligung aktiviert.
            </p>
          </section>

          {/* 8. Rechte */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">8. Deine Rechte</h2>
            <p className="mb-3">Du hast jederzeit folgende Rechte bezüglich deiner personenbezogenen Daten:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong className="text-[#1d1d1f]">Auskunftsrecht</strong> (Art. 15 DSGVO) – Welche Daten wir über dich gespeichert haben</li>
              <li><strong className="text-[#1d1d1f]">Berichtigung</strong> (Art. 16 DSGVO) – Korrektur unrichtiger Daten</li>
              <li><strong className="text-[#1d1d1f]">Löschung</strong> (Art. 17 DSGVO) – Löschung deiner Daten („Recht auf Vergessenwerden")</li>
              <li><strong className="text-[#1d1d1f]">Einschränkung</strong> (Art. 18 DSGVO) – Einschränkung der Verarbeitung</li>
              <li><strong className="text-[#1d1d1f]">Datenübertragbarkeit</strong> (Art. 20 DSGVO) – Export deiner Daten in einem gängigen Format</li>
              <li><strong className="text-[#1d1d1f]">Widerspruch</strong> (Art. 21 DSGVO) – Widerspruch gegen die Verarbeitung</li>
              <li><strong className="text-[#1d1d1f]">Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) – Jederzeit mit Wirkung für die Zukunft</li>
            </ul>
          </section>

          {/* 9. Beschwerderecht */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">9. Recht auf Beschwerde bei einer Aufsichtsbehörde</h2>
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung deiner
              personenbezogenen Daten zu beschweren (Art. 77 DSGVO).
            </p>
            <p className="mt-3">
              Die für uns zuständige Aufsichtsbehörde ist:<br />
              Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)<br />
              Kavalleriestraße 2–4<br />
              40213 Düsseldorf<br />
              <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer" className="text-[#e8a91a] hover:text-[#d49b15] underline">
                www.ldi.nrw.de
              </a>
            </p>
          </section>

          {/* 10. Kontakt */}
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">10. Kontakt</h2>
            <p>Bei Fragen zum Datenschutz kannst du dich jederzeit an uns wenden:</p>
            <p className="mt-3">
              Gaetano Ficarra<br />
              E-Mail: kontakt@gaetanoficarra.de<br />
              WhatsApp: 0152 23856537
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e5e5e5] py-6 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-[#86868b]">
          <Link to="/impressum" className="hover:text-[#1d1d1f] transition-colors">Impressum</Link>
          <Link to="/datenschutz" className="hover:text-[#1d1d1f] transition-colors">Datenschutz</Link>
          <Link to="/agb" className="hover:text-[#1d1d1f] transition-colors">AGB</Link>
          <Link to="/avv" className="hover:text-[#1d1d1f] transition-colors">AVV</Link>
        </div>
      </footer>
    </div>
  );
}
