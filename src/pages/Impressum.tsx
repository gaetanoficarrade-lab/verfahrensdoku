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

        <h1 className="text-3xl font-bold mb-4">Impressum</h1>
        <p className="text-sm text-[#86868b] mb-12">Stand: März 2026</p>

        <div className="space-y-10 text-[#86868b] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Angaben gemäß § 5 TMG</h2>
            <p>
              Gaetano Ficarra<br />
              Marketing-Systemberater für Selbstständige
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Anschrift</h2>
            <p>
              Elverdisser Str. 51<br />
              33729 Bielefeld<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Kontakt</h2>
            <p>
              WhatsApp: 0152 23856537<br />
              E-Mail: kontakt@gaetanoficarra.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Berufsbezeichnung</h2>
            <p>
              Marketing-Systemberater<br />
              Zertifizierter HighLevel Admin
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e8a91a] hover:text-[#d49b15] underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-3">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
              allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
              verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
              zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
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
