import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CookieBanner, CookieSettingsButton } from '@/components/CookieBanner';
import MarketingNav from '@/components/MarketingNav';
import mockupSoloDashboard from '@/assets/mockup-solo-dashboard.png';
import {
  AlertTriangle, Euro, Clock, Check, ChevronDown, ChevronUp,
  Menu, XIcon, Star,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

/* ─── Design tokens ─── */
const C = {
  yellow: '#FAC81E',
  dark: '#44484E',
  white: '#FFFFFF',
  bgLight: '#F5F5F7',
  green: '#34C759',
  textGray: '#6E6E73',
  border: '#E5E5E5',
} as const;

/* ─── Reveal ─── */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ─── Wave Divider ─── */
function WaveDivider({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 60, background: to }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,0 C360,60 1080,0 1440,60 L1440,0 L0,0 Z" fill={from} />
      </svg>
    </div>
  );
}

/* ─── Primary Button ─── */
function PrimaryBtn({ children, to, className = '' }: { children: ReactNode; to: string; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 ${className}`}
      style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.boxShadow = '0 0 20px rgba(250, 200, 30, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </Link>
  );
}

function SecondaryBtn({ children, to }: { children: ReactNode; to: string }) {
  return (
    <a href={to} className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 hover:opacity-80"
      style={{ border: `1px solid ${C.dark}`, color: C.dark, borderRadius: 980, padding: '12px 24px', background: 'transparent' }}>
      {children}
    </a>
  );
}

/* ─── FAQ ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left font-semibold text-lg transition-colors" style={{ color: C.dark }}>
        {q}
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 800 : 0, opacity: open ? 1 : 0 }}>
        <p className="pb-5 leading-relaxed" style={{ color: C.textGray }}>{a}</p>
      </div>
    </div>
  );
}

/* ─── Glassmorphism ─── */
const glass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */
export default function FuerSelbststaendige() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = 'solo-lp-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes heroSlideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Verfahrensdokumentation für Selbstständige",
    "description": "GoBD-konforme Verfahrensdokumentation für Selbstständige erstellen mit KI-Unterstützung",
    "url": "https://gobd-suite.de/fuer-selbststaendige",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "GoBD-Suite",
      "offers": { "@type": "Offer", "name": "Solo Plan", "price": "980", "priceCurrency": "EUR" },
    },
  }), []);

  useSEO({
    title: 'Verfahrensdokumentation für Selbstständige – GoBD-konform in 60 Minuten | GoBD-Suite',
    description: 'Als Selbstständiger GoBD-konform werden ohne Steuerberater. GoBD-Suite erstellt deine Verfahrensdokumentation KI-gestützt in unter einer Stunde. Jetzt testen.',
    canonical: 'https://gobd-suite.de/fuer-selbststaendige',
    keywords: 'Verfahrensdokumentation Selbstständige, GoBD Freelancer, Verfahrensdokumentation erstellen, GoBD-konform',
    author: 'Gaetano Ficarra',
    robots: 'index, follow',
    ogTitle: 'Verfahrensdokumentation für Selbstständige – GoBD-Suite',
    ogDescription: 'GoBD-konform in 60 Minuten. Ohne Steuerberater. Ohne Juristendeutsch.',
    ogType: 'website',
    ogLocale: 'de_DE',
    ogImage: 'https://gobd-suite.de/og-image.png',
    jsonLd: [jsonLd],
  });

  const problemPoints = [
    { Icon: AlertTriangle, title: 'Die Verfahrensdokumentation ist deine Pflicht', text: 'Nicht die deines Steuerberaters. Du als Unternehmer bist verantwortlich – weil nur du weißt wie dein Business wirklich läuft.' },
    { Icon: Clock, title: 'Seit 2025 wird es aktiv geprüft', text: 'Betriebsprüfer fragen gezielt nach der Verfahrensdokumentation. Wer keine hat, riskiert die Anerkennung seiner gesamten digitalen Buchführung.' },
    { Icon: Euro, title: 'Ohne VD kann das Finanzamt schätzen', text: 'Und Schätzungen liegen fast immer über deinen tatsächlichen Einnahmen. Das bedeutet Nachzahlungen die weh tun.' },
  ];

  const timelineSteps = [
    { num: '01', title: 'Kostenlos registrieren', text: 'In 2 Minuten. Ohne Kreditkarte. 7 Tage alles testen.' },
    { num: '02', title: 'Onboarding ausfüllen', text: '7 kurze Fragen zu deinem Unternehmen. Das Tool weiß danach welche Kapitel für dich relevant sind.' },
    { num: '03', title: 'Kapitel beschreiben', text: 'Beschreibe in normaler Sprache wie du arbeitest. Die KI prüft, ergänzt und schreibt den GoBD-konformen Text.' },
    { num: '04', title: 'PDF herunterladen', text: 'Deine fertige Verfahrensdokumentation als professionelles PDF. Bereit für die nächste Betriebsprüfung.' },
  ];

  const chapters = [
    { title: 'Allgemeine Unternehmensbeschreibung', content: 'Wer du bist, was du machst, wie Aufträge entstehen und welche Dokumente dabei entstehen.' },
    { title: 'Organisation und Zuständigkeiten', content: 'Wie deine Buchführung organisiert ist, wer verantwortlich ist und wie Dokumente weitergegeben werden.' },
    { title: 'IT-Systeme und Datenverarbeitung', content: 'Welche Software du nutzt, wie Daten zwischen Systemen fließen und wie du Backups machst.' },
    { title: 'Prozesse und Arbeitsabläufe', content: 'Wie Rechnungen entstehen, wie Zahlungen ablaufen und wie Belege archiviert werden.' },
    { title: 'Internes Kontrollsystem', content: 'Wie du sicherstellst dass alles korrekt läuft und wie Fehler erkannt und korrigiert werden.' },
  ];

  const [openChapter, setOpenChapter] = useState<number | null>(0);

  const faqs = [
    { q: 'Brauche ich das wirklich als Freelancer?', a: 'Ja. Die GoBD gelten für jeden der digital bucht – egal ob GmbH, UG oder Einzelunternehmer. Als Freelancer bist du genauso verpflichtet wie ein großes Unternehmen. Der Unterschied: Bei dir ist die VD meist einfacher weil weniger Systeme im Einsatz sind. GoBD-Suite passt das Dokument automatisch an deine Situation an.' },
    { q: 'Kann ich die VD wirklich selbst erstellen ohne Steuerberater?', a: 'Ja – und das ist sogar der richtige Weg. Die Verfahrensdokumentation muss das Unternehmen selbst erstellen weil nur du weißt wie dein Business wirklich läuft. Dein Steuerberater kennt deine internen Abläufe nicht. GoBD-Suite führt dich durch den gesamten Prozess.' },
    { q: 'Was wenn sich mein Business ändert?', a: 'Einfach das betreffende Kapitel aktualisieren. Du hast 12 Monate Zugang und kannst unbegrenzt Revisionen machen. Alle Änderungen werden automatisch mit Datum dokumentiert – genau wie es die GoBD verlangen.' },
    { q: 'Wie lange dauert die Erstellung wirklich?', a: 'Die meisten Selbstständigen sind in 45 bis 90 Minuten fertig. Das hängt davon ab wie komplex deine Systeme sind. Das Onboarding dauert 5 Minuten, dann bearbeitest du die Kapitel in deinem Tempo.' },
    { q: 'Was passiert nach 12 Monaten?', a: 'Du kannst deinen Zugang für 199 €/Jahr verlängern. So hast du immer Zugriff auf deine Verfahrensdokumentation und kannst sie bei Bedarf aktualisieren. Wenn du nicht verlängerst, kannst du dein PDF vorher herunterladen und lokal speichern.' },
  ];

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      <MarketingNav />

      <main>
        {/* ═══ HERO ═══ */}
        <section className="min-h-[90vh] flex items-center px-6 lg:px-12 pt-24 pb-20 relative overflow-hidden" style={{ background: C.white }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(250, 200, 30, 0.15), transparent)' }} />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">
            <div style={{ animation: 'heroSlideUp 0.8s ease-out both' }}>
              <Reveal>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: C.yellow, color: C.dark }}>
                  Für Selbstständige & Freelancer
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-[52px] lg:text-[60px] font-bold leading-[1.08] tracking-tight mb-6" style={{ color: C.dark }}>
                  Deine Verfahrens-<br className="hidden md:inline" />dokumentation.<br className="hidden md:inline" />
                  Selbst erstellt.<br className="hidden md:inline" />
                  <span style={{ background: 'rgba(250, 200, 30, 0.2)', borderRadius: 4, padding: '0 6px' }}>GoBD-konform.</span><br className="hidden md:inline" />
                  In 60 Minuten.
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: C.textGray }}>
                  Du brauchst keinen Steuerberater und kein Juristendeutsch. GoBD-Suite führt dich Schritt für Schritt durch alle 30 GoBD-Kapitel – du erzählst wie dein Business läuft, die KI schreibt das fertige Dokument.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-wrap gap-3 mb-8">
                  <PrimaryBtn to="/test-starten">Jetzt kostenlos testen</PrimaryBtn>
                  <SecondaryBtn to="#preis">Solo-Plan ansehen</SecondaryBtn>
                </div>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: C.dark }}>
                  {['Einmalig zahlen', '12 Monate Zugang', 'Unbegrenzte Revisionen', 'Keine monatlichen Kosten'].map(t => (
                    <span key={t} className="flex items-center gap-1.5"><Check size={14} style={{ color: C.green }} /> {t}</span>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <img src={mockupSoloDashboard} alt="GoBD-Suite Solo Dashboard – Projektübersicht mit Fortschrittsanzeige" className="w-full h-auto" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ FÜR WEN GENAU ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Perfekt für dich wenn du...</h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                '...als Freelancer oder Solopreneur arbeitest',
                '...deine Buchhaltung digital führst',
                '...keinen Steuerberater für die VD beauftragen willst',
                '...bei der nächsten Betriebsprüfung vorbereitet sein willst',
                '...keine Zeit für Bürokratie verschwenden willst',
                '...eine einmalige Lösung ohne Abo suchst',
              ].map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="rounded-[16px] p-6 h-full flex items-start gap-3" style={{ ...glass }}>
                    <Check size={20} className="shrink-0 mt-0.5" style={{ color: C.green }} />
                    <p className="font-medium text-[15px]" style={{ color: C.dark }}>{t}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DAS PROBLEM ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Was die meisten Selbstständigen nicht wissen</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8">
              {problemPoints.map((p, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'rgba(250, 200, 30, 0.12)' }}>
                      <p.Icon size={28} style={{ color: C.yellow }} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold mb-3" style={{ color: C.dark }}>{p.title}</h3>
                    <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ SO FUNKTIONIERT ES ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>So erstellst du deine VD mit GoBD-Suite</h2>
            </Reveal>
            <div className="grid md:grid-cols-4 gap-8">
              {timelineSteps.map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="text-center md:text-left">
                    <span className="text-[48px] font-bold leading-none block mb-3" style={{ color: C.yellow, opacity: 0.35 }}>{s.num}</span>
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{s.title}</h3>
                    <p className="text-[15px] leading-relaxed" style={{ color: C.textGray }}>{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ WAS DU BEKOMMST ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Reveal>
                <h2 className="text-3xl md:text-[44px] font-bold leading-[1.1] mb-10" style={{ color: C.dark }}>Was in deiner Verfahrensdokumentation steckt</h2>
              </Reveal>
              <div>
                {chapters.map((ch, i) => (
                  <Reveal key={i} delay={i * 0.05}>
                    <div style={{ borderBottom: `1px solid ${C.border}` }}>
                      <button
                        onClick={() => setOpenChapter(openChapter === i ? null : i)}
                        className="w-full flex items-center justify-between py-4 text-left font-semibold transition-colors"
                        style={{ color: C.dark }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-sm font-bold" style={{ color: C.yellow }}>Kapitel {i + 1}</span>
                          {ch.title}
                        </span>
                        {openChapter === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: openChapter === i ? 200 : 0, opacity: openChapter === i ? 1 : 0 }}>
                        <p className="pb-4 leading-relaxed text-[15px]" style={{ color: C.textGray }}>{ch.content}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.3}>
                <p className="mt-6 text-xs leading-relaxed" style={{ color: C.textGray, opacity: 0.7 }}>
                  Insgesamt 30 Unterkapitel · Automatisch an dein Business angepasst · Nicht relevante Kapitel werden professionell ausgeschlossen
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="rounded-xl overflow-hidden sticky top-24" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <img src={mockupSoloDashboard} alt="GoBD-Suite – Kapitelübersicht im Solo-Dashboard" className="w-full h-auto" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ TESTIMONIAL ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="text-[72px] font-serif leading-none block mb-6" style={{ color: C.yellow }}>"</span>
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8" style={{ color: C.dark }}>
                Ich hatte keine Ahnung dass ich als Freelancer eine Verfahrensdokumentation brauche. GoBD-Suite hat mir in 50 Minuten ein Dokument erstellt das mein Steuerberater als sehr gut bewertet hat.
              </p>
              <div className="flex justify-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={C.yellow} stroke={C.yellow} />)}
              </div>
              <p className="font-semibold" style={{ color: C.dark }}>Marcus T.</p>
              <p className="text-sm" style={{ color: C.textGray }}>Freelance Designer, Berlin</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-xs mt-6" style={{ color: C.textGray, opacity: 0.7 }}>
                * Die dargestellten Ergebnisse können variieren. Individuelle Ergebnisse hängen von verschiedenen Faktoren ab.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══ PREIS ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section id="preis" className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-lg mx-auto text-center">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold leading-tight mb-14" style={{ color: C.dark }}>Ein Plan. Einmalig. Fertig.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[20px] p-8 md:p-10 text-left relative" style={{ background: C.white, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', borderTop: `4px solid ${C.yellow}` }}>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: C.yellow, color: C.dark }}>Für Selbstständige</span>
                <h3 className="text-xl font-bold mb-4" style={{ color: C.dark }}>Solo</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold" style={{ color: C.dark }}>980 €</span>
                  <span className="text-sm" style={{ color: C.textGray }}>einmalig</span>
                </div>
                <p className="text-sm mb-1" style={{ color: C.textGray }}>12 Monate Zugang</p>
                <p className="text-xs mb-8" style={{ color: C.textGray, opacity: 0.7 }}>Renewal nach 12 Monaten: 199 €/Jahr</p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    '1 Verfahrensdokumentation',
                    'Alle 30 GoBD-Kapitel',
                    'KI-gestützte Texterstellung',
                    'Unbegrenzte Revisionen',
                    'PDF-Export',
                    'Automatische Versionierung',
                    '12 Monate Zugang',
                    '7 Tage kostenlos testen',
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2 text-[15px]" style={{ color: C.dark }}>
                      <Check size={16} style={{ color: C.green }} /> {t}
                    </li>
                  ))}
                </ul>
                <PrimaryBtn to="/test-starten" className="w-full text-center justify-center">Jetzt kostenlos testen</PrimaryBtn>
                <p className="text-center text-xs mt-4" style={{ color: C.textGray }}>
                  Keine Kreditkarte nötig · Kein Abo · Einmalig zahlen
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-center mt-6 text-xs" style={{ color: C.textGray, opacity: 0.7 }}>
                Alle Preise zzgl. gesetzlich gültiger MwSt. · Dieses Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Häufige Fragen von Selbstständigen</h2>
            </Reveal>
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <FaqItem q={f.q} a={f.a} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ FINALER CTA ═══ */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.dark }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h2 className="text-3xl md:text-[44px] font-bold leading-tight mb-8" style={{ color: C.white }}>
                Deine Betriebsprüfung kann morgen kommen.<br className="hidden md:inline" />
                Deine Verfahrensdokumentation kann heute fertig sein.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <PrimaryBtn to="/test-starten">Jetzt in 60 Minuten absichern</PrimaryBtn>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                7 Tage kostenlos · Keine Kreditkarte · Solo-Plan ab 980 € einmalig
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 px-6" style={{ background: C.dark, color: 'rgba(255,255,255,0.7)' }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/images/logo-light.png" alt="GoBD-Suite Logo" className="h-10 w-auto mb-4" loading="lazy" />
            <p className="text-sm leading-relaxed">Die erste vollständige Verfahrensdokumentations-Lösung für Selbstständige und Dienstleister im DACH-Raum.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#funktionen" className="hover:text-white transition-colors">Funktionen</Link></li>
              <li><Link to="/#preise" className="hover:text-white transition-colors">Preise</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/test-starten" className="hover:text-white transition-colors">Kostenlos testen</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link to="/agb" className="hover:text-white transition-colors">AGB</Link></li>
              <li><Link to="/avv" className="hover:text-white transition-colors">AVV</Link></li>
              <li><CookieSettingsButton /></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Für dich</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/fuer-selbststaendige" className="hover:text-white transition-colors text-white font-semibold">Für Selbstständige</Link></li>
              <li><Link to="/fuer-dienstleister" className="hover:text-white transition-colors">Für Dienstleister</Link></li>
              <li><p className="text-sm mt-3">info@gobd-suite.de</p></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <p className="mb-3"><Link to="/fuer-dienstleister" className="hover:text-white transition-colors">Du bist Dienstleister? Hier entlang →</Link></p>
          © {new Date().getFullYear()} GoBD-Suite · Alle Rechte vorbehalten
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
