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
          <Link to="/landing">
            <img src={landingLogo} alt="gobdsuite" className="h-10 object-contain" />
          </Link>
          <Link to="/landing" className="text-sm text-[#86868b] hover:text-[#1d1d1f] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-4">Datenschutzerklärung</h1>
        <p className="text-sm text-[#86868b] mb-12">Stand: März 2026</p>

        <div className="space-y-10 text-[#86868b] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit deinen personenbezogenen Daten passiert,
              wenn du diese Website besuchst.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">2. Verantwortlicher</h2>
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="mt-3">
              Gaetano Ficarra<br />
              Elverdisser Str. 51<br />
              33729 Bielefeld
            </p>
            <p className="mt-3">
              WhatsApp: 0152 23856537<br />
              E-Mail: kontakt@gaetanoficarra.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">3. Datenerfassung auf dieser Website</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Hosting</h3>
            <p>
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden,
              werden auf den Servern des Hosters gespeichert.
            </p>
            <p className="mt-3">
              Das Hosting erfolgt auf Basis von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren
              und effizienten Bereitstellung dieser Website).
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Wartelisten-Anmeldung</h3>
            <p>
              Wenn du dich auf unsere Warteliste einträgst, speichern wir deine E-Mail-Adresse zum Zweck der
              Kontaktaufnahme bezüglich unseres Produktstarts. Die Daten werden nicht an Dritte weitergegeben
              und können jederzeit gelöscht werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">4. Cookies und lokale Speicherung</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">Was sind Cookies?</h3>
            <p>
              Cookies sind kleine Textdateien, die auf deinem Endgerät gespeichert werden. Wir verwenden außerdem
              den localStorage deines Browsers, um funktionsrelevante Daten zu speichern.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Essenzielle Cookies & Speichereinträge</h3>
            <p className="mb-3">
              Diese sind für den Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden.
              Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
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
                    <td className="px-4 py-2 font-mono text-xs">cookie-consent</td>
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
              ausdrücklich zustimmst (Opt-in). Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
              Du kannst deine Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer widerrufen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">5. Externe Dienste</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">OpenAI</h3>
            <p>
              Wir nutzen die API von OpenAI zur KI-gestützten Textgenerierung und Prüfung von Kapitelinhalten. 
              Deine Eingaben werden zur Verarbeitung an OpenAI in den USA übermittelt. Die Datenübertragung erfolgt
              auf Grundlage der EU-Standardvertragsklauseln und des EU-US Data Privacy Framework.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">HighLevel</h3>
            <p>
              Wir nutzen HighLevel für die Terminbuchung und Marketing-Automation. HighLevel ist ein US-amerikanischer
              Dienst. Die Datenübertragung in die USA erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Zahlungsabwicklung</h3>
            <p>
              Für die Zahlungsabwicklung nutzen wir Stripe, Digistore24 und/oder CopeCart. Diese Anbieter verarbeiten
              deine Zahlungsdaten gemäß deren eigenen Datenschutzbestimmungen.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Resend (E-Mail-Versand)</h3>
            <p>
              Für den Versand transaktionaler E-Mails (Einladungen, Statusmeldungen) nutzen wir Resend, Inc. 
              Die Datenübertragung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Supabase (Backend-Infrastruktur)</h3>
            <p>
              Die Anwendung nutzt Supabase für Datenbank, Authentifizierung und serverlose Funktionen. 
              Die Daten werden auf Servern in der EU (Frankfurt) verarbeitet.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Netcup (Hosting)</h3>
            <p>
              Das Hosting der Anwendung erfolgt bei Netcup GmbH auf Servern in deutschen Rechenzentren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">6. Deine Rechte</h2>
            <p className="mb-3">Du hast jederzeit das Recht:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Auskunft über deine gespeicherten personenbezogenen Daten zu erhalten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten zu verlangen (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten zu verlangen (Art. 17 DSGVO)</li>
              <li>Die Verarbeitung deiner Daten einzuschränken (Art. 18 DSGVO)</li>
              <li>Der Verarbeitung zu widersprechen (Art. 21 DSGVO)</li>
              <li>Datenübertragbarkeit zu verlangen (Art. 20 DSGVO)</li>
              <li>Eine erteilte Einwilligung jederzeit zu widerrufen (Art. 7 Abs. 3 DSGVO)</li>
              <li>Sich bei einer Aufsichtsbehörde zu beschweren (Art. 77 DSGVO)</li>
            </ul>
            <p className="mt-3">
              Die zuständige Aufsichtsbehörde ist die Landesbeauftragte für Datenschutz und Informationsfreiheit
              Nordrhein-Westfalen (LDI NRW).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">7. Kontakt</h2>
            <p>Bei Fragen zum Datenschutz kannst du dich jederzeit an uns wenden:</p>
            <p className="mt-3">
              E-Mail: kontakt@gaetanoficarra.de<br />
              WhatsApp: 0152 23856537
            </p>
          </section>
        </div>
      </main>

      {/* Footer with legal links */}
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
