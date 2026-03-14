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
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

        <div className="prose prose-neutral max-w-none text-[#86868b] space-y-6">
          <h2 className="text-xl font-semibold text-[#1d1d1f]">1. Datenschutz auf einen Blick</h2>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit deinen personenbezogenen Daten passiert,
            wenn du diese Website besuchst. Personenbezogene Daten sind alle Daten, mit denen du persönlich identifiziert werden kannst.
          </p>

          <h2 className="text-xl font-semibold text-[#1d1d1f]">2. Verantwortliche Stelle</h2>
          <p>
            gobdsuite<br />
            [Dein vollständiger Name / Firmenname]<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br />
            E-Mail: [deine@email.de]
          </p>

          <h2 className="text-xl font-semibold text-[#1d1d1f]">3. Datenerfassung auf dieser Website</h2>
          <h3 className="text-lg font-semibold text-[#1d1d1f]">Cookies</h3>
          <p>
            Unsere Website verwendet Cookies. Das sind kleine Textdateien, die dein Webbrowser auf deinem Endgerät speichert.
            Cookies helfen uns dabei, unser Angebot nutzerfreundlicher und effektiver zu gestalten.
          </p>

          <h3 className="text-lg font-semibold text-[#1d1d1f]">Wartelisten-Anmeldung</h3>
          <p>
            Wenn du dich auf unsere Warteliste einträgst, speichern wir deine E-Mail-Adresse zum Zweck der Kontaktaufnahme
            bezüglich unseres Produktstarts. Die Daten werden nicht an Dritte weitergegeben und können jederzeit gelöscht werden.
          </p>

          <h2 className="text-xl font-semibold text-[#1d1d1f]">4. Hosting</h2>
          <p>
            Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser
            Website erfasst werden, werden auf den Servern des Hosters gespeichert.
          </p>

          <h2 className="text-xl font-semibold text-[#1d1d1f]">5. Deine Rechte</h2>
          <p>
            Du hast jederzeit das Recht auf unentgeltliche Auskunft über deine gespeicherten personenbezogenen Daten, deren
            Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
          </p>
        </div>
      </main>
    </div>
  );
}
