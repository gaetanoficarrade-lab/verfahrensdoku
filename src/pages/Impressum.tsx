import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import landingLogo from '@/assets/landing-logo.png';

export default function Impressum() {
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
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <div className="prose prose-neutral max-w-none text-[#86868b] space-y-6">
          <p>
            <strong className="text-[#1d1d1f]">Angaben gemäß § 5 TMG</strong>
          </p>
          <p>
            gobdsuite<br />
            [Dein vollständiger Name / Firmenname]<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]
          </p>
          <p>
            <strong className="text-[#1d1d1f]">Kontakt</strong><br />
            E-Mail: [deine@email.de]<br />
            Telefon: [Telefonnummer]
          </p>
          <p>
            <strong className="text-[#1d1d1f]">Umsatzsteuer-ID</strong><br />
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
            [USt-IdNr.]
          </p>
          <p>
            <strong className="text-[#1d1d1f]">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</strong><br />
            [Name]<br />
            [Adresse]
          </p>
        </div>
      </main>
    </div>
  );
}
