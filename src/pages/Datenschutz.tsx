import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import landingLogo from '@/assets/landing-logo.png';

export default function Datenschutz() {
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
        <h1 className="text-3xl font-bold mb-12">Datenschutzerklärung</h1>

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
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">4. Externe Dienste</h2>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">HighLevel</h3>
            <p>
              Wir nutzen HighLevel für die Terminbuchung und Marketing-Automation. HighLevel ist ein US-amerikanischer
              Dienst. Die Datenübertragung in die USA erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission.
            </p>

            <h3 className="text-lg font-semibold text-[#1d1d1f] mt-6 mb-2">Zahlungsabwicklung</h3>
            <p>
              Für die Zahlungsabwicklung nutzen wir Stripe, Digistore24 und/oder CopeCart. Diese Anbieter verarbeiten
              deine Zahlungsdaten gemäß deren eigenen Datenschutzbestimmungen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">5. Deine Rechte</h2>
            <p className="mb-3">Du hast jederzeit das Recht:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Auskunft über deine gespeicherten personenbezogenen Daten zu erhalten</li>
              <li>Berichtigung unrichtiger Daten zu verlangen</li>
              <li>Löschung deiner Daten zu verlangen</li>
              <li>Die Verarbeitung deiner Daten einzuschränken</li>
              <li>Der Verarbeitung zu widersprechen</li>
              <li>Datenübertragbarkeit zu verlangen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">6. Kontakt</h2>
            <p>Bei Fragen zum Datenschutz kannst du dich jederzeit an uns wenden:</p>
            <p className="mt-3">
              E-Mail: kontakt@gaetanoficarra.de<br />
              WhatsApp: 0152 23856537
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
