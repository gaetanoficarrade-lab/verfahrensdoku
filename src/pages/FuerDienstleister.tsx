import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CookieBanner, CookieSettingsButton } from '@/components/CookieBanner';
import mockupClients from '@/assets/mockup-clients.png';
import mockupPdf from '@/assets/mockup-pdf.png';
import {
  Check, X, ChevronDown, ChevronUp, Menu, XIcon, Star,
  UserPlus, FileText, Eye, CheckCircle2, Download,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

/* ─── Design tokens ─── */
const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF', bgLight: '#F5F5F7',
  green: '#34C759', textGray: '#6E6E73', border: '#E5E5E5',
} as const;

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{
      opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
    }}>{children}</div>
  );
}

function WaveDivider({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 60, background: to }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,0 C360,60 1080,0 1440,60 L1440,0 L0,0 Z" fill={from} />
      </svg>
    </div>
  );
}

function PrimaryBtn({ children, to, className = '' }: { children: ReactNode; to: string; className?: string }) {
  return (
    <Link to={to} className={`inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 ${className}`}
      style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.boxShadow = '0 0 20px rgba(250, 200, 30, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >{children}</Link>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left font-semibold text-lg transition-colors" style={{ color: C.dark }}>
        {q}{open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 800 : 0, opacity: open ? 1 : 0 }}>
        <p className="pb-5 leading-relaxed" style={{ color: C.textGray }}>{a}</p>
      </div>
    </div>
  );
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
};

/* ═══════════════════════════════════════════════ */
export default function FuerDienstleister() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = 'dl-lp-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes heroSlideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org", "@type": "WebPage",
    "name": "GoBD-Suite für Berater und Agenturen",
    "description": "Verfahrensdokumentation als Dienstleistung anbieten mit GoBD-Suite. Whitelabel, unbegrenzte Mandanten, neue Einnahmequelle.",
    "url": "https://vd.gaetanoficarra.de/fuer-dienstleister",
    "mainEntity": {
      "@type": "SoftwareApplication", "name": "GoBD-Suite",
      "offers": [
        { "@type": "Offer", "name": "Berater Plan", "price": "399", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
        { "@type": "Offer", "name": "Agentur Plan", "price": "799", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
      ],
    },
  }), []);

  useSEO({
    title: 'Verfahrensdokumentation als Dienstleistung anbieten – GoBD-Suite für Berater & Agenturen',
    description: 'Biete deinen Mandanten GoBD-konforme Verfahrensdokumentationen an. Mit GoBD-Suite als Berater oder Agentur neue Einnahmen generieren. Whitelabel inklusive.',
    canonical: 'https://vd.gaetanoficarra.de/fuer-dienstleister',
    keywords: 'Verfahrensdokumentation Dienstleister, GoBD Berater, Verfahrensdokumentation Whitelabel, GoBD-Suite Agentur',
    author: 'Gaetano Ficarra', robots: 'index, follow',
    ogTitle: 'GoBD-Suite für Berater & Agenturen – Verfahrensdokumentation als Dienstleistung',
    ogDescription: 'Neue Einnahmequelle für Steuerberater, Buchhalter und Consultants. Whitelabel. Unbegrenzte Mandanten.',
    ogType: 'website', ogLocale: 'de_DE', ogImage: 'https://vd.gaetanoficarra.de/og-image.png',
    jsonLd: [jsonLd],
  });

  const timelineSteps = [
    { Icon: UserPlus, title: 'Mandant anlegen und einladen', text: 'Du legst den Mandanten in GoBD-Suite an und schickst ihm per Klick eine Einladung. Er bekommt sofort Zugang zu seinem Portal.' },
    { Icon: FileText, title: 'Mandant füllt Leitfragen aus', text: 'Dein Mandant beschreibt in seinem Portal in eigenen Worten wie sein Business läuft. Die KI unterstützt und prüft dabei.' },
    { Icon: Eye, title: 'Du prüfst und ergänzt', text: 'In deinem Berater-Portal siehst du alle Kapitel deiner Mandanten. Du kannst Hinweise geben, Texte bearbeiten und Kapitel freigeben.' },
    { Icon: CheckCircle2, title: 'Dokument finalisieren', text: 'Mit einem Klick finalisierst du das Dokument. Es bekommt eine Versionsnummer und ist revisionssicher archiviert.' },
    { Icon: Download, title: 'Professionelles PDF unter deinem Brand', text: 'Das fertige PDF trägt dein Logo und deine Kontaktdaten – nicht GoBD-Suite. Dein Mandant sieht nur dein Brand.' },
  ];

  const comparisonRows = [
    { feature: 'Mandanten', berater: 'Bis zu 5', agentur: 'Unbegrenzt' },
    { feature: 'Whitelabel', berater: false, agentur: true },
    { feature: 'Eigenes Logo im PDF', berater: false, agentur: true },
    { feature: 'Berater-Portal', berater: true, agentur: true },
    { feature: 'KI-Funktionen', berater: true, agentur: true },
    { feature: 'PDF-Export', berater: true, agentur: true },
    { feature: 'Preis monatlich', berater: '399 €/Monat', agentur: '799 €/Monat' },
    { feature: 'Preis jährlich', berater: '332 €/Monat', agentur: '665 €/Monat' },
    { feature: 'Mindestlaufzeit', berater: '3 Monate', agentur: '3 Monate' },
  ];

  const faqs = [
    { q: 'Wie viel kann ich pro VD verdienen?', a: 'Das liegt bei dir. Die meisten Dienstleister berechnen zwischen 800 € und 2.500 € pro Verfahrensdokumentation je nach Komplexität des Mandanten. Mit dem Berater-Plan (399 €/Monat) bist du bereits mit einem einzigen Mandanten im Plus.' },
    { q: 'Sehen meine Mandanten dass ich GoBD-Suite nutze?', a: 'Nein – beim Agentur-Plan sehen deine Mandanten ausschließlich dein Brand. Dein Logo, deine Kontaktdaten, deine Domain. GoBD-Suite ist dein unsichtbares Werkzeug.' },
    { q: 'Wie viel Aufwand habe ich pro Mandant?', a: 'Minimal. Dein Mandant füllt die Leitfragen selbst aus. Du prüfst die Kapitel, gibst bei Bedarf Hinweise und finalisierst das Dokument. Pro Mandant rechne mit 1 bis 3 Stunden Aufwand insgesamt.' },
    { q: 'Kann ich unbegrenzt viele Mandanten anlegen?', a: 'Mit dem Agentur-Plan ja. Der Berater-Plan ist auf 5 Mandanten begrenzt. Ein Upgrade von Berater auf Agentur ist jederzeit möglich.' },
    { q: 'Was passiert wenn ein Mandant seine VD aktualisieren muss?', a: 'Du öffnest das entsprechende Kapitel, passt den Text an und finalisierst eine neue Version. Alle Änderungen werden automatisch in der Änderungshistorie dokumentiert. Das dauert meist nur wenige Minuten.' },
  ];

  const CellVal = ({ val }: { val: boolean | string }) => {
    if (typeof val === 'boolean') return val ? <Check size={16} style={{ color: C.green }} /> : <X size={16} style={{ color: C.textGray }} />;
    return <span>{val}</span>;
  };

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12"
        style={{ height: 64, background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.3s ease' }}
        aria-label="Hauptnavigation"
      >
        <Link to="/" className="flex items-center gap-2 font-bold text-xl shrink-0"><img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-14 w-auto" /></Link>
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium" style={{ color: C.dark }}>
          <Link to="/#funktionen" className="hover:opacity-70 transition-opacity">Funktionen</Link>
          <Link to="/#fuer-wen" className="hover:opacity-70 transition-opacity font-bold" style={{ color: C.yellow }}>Für wen?</Link>
          <Link to="/#preise" className="hover:opacity-70 transition-opacity">Preise</Link>
          <Link to="/blog" className="hover:opacity-70 transition-opacity">Blog</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/auth" className="text-[15px] font-medium hover:opacity-70 transition-opacity" style={{ color: C.dark }}>Anmelden</Link>
          <PrimaryBtn to="/test-starten">Kostenlos testen</PrimaryBtn>
        </div>
        <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menü öffnen">
          {mobileMenu ? <XIcon size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileMenu && (
        <div className="fixed inset-0 z-40 flex flex-col pt-20 px-8 gap-6 text-lg font-medium md:hidden" style={{ background: C.white, color: C.dark }}>
          <Link to="/#funktionen" onClick={() => setMobileMenu(false)}>Funktionen</Link>
          <Link to="/#fuer-wen" onClick={() => setMobileMenu(false)}>Für wen?</Link>
          <Link to="/#preise" onClick={() => setMobileMenu(false)}>Preise</Link>
          <Link to="/blog" onClick={() => setMobileMenu(false)}>Blog</Link>
          <hr style={{ borderColor: C.border }} />
          <Link to="/auth" onClick={() => setMobileMenu(false)}>Anmelden</Link>
          <PrimaryBtn to="/test-starten">Kostenlos testen</PrimaryBtn>
        </div>
      )}

      <main>
        {/* ═══ 1. HERO ═══ */}
        <section className="min-h-[90vh] flex items-center px-6 lg:px-12 pt-24 pb-20 relative overflow-hidden" style={{ background: C.white }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(250, 200, 30, 0.15), transparent)' }} />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">
            <div style={{ animation: 'heroSlideUp 0.8s ease-out both' }}>
              <Reveal>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: C.yellow, color: C.dark }}>
                  Für Steuerberater, Buchhalter & Consultants
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-[52px] lg:text-[60px] font-bold leading-[1.08] tracking-tight mb-6" style={{ color: C.dark }}>
                  Biete deinen Mandanten <span style={{ background: 'rgba(250,200,30,0.2)', borderRadius: 4, padding: '0 6px' }}>GoBD-konforme</span> Verfahrensdokumentationen an.<br className="hidden md:inline" /> Unter deinem Namen.
                </h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-lg leading-relaxed mb-8 max-w-xl" style={{ color: C.textGray }}>
                  GoBD-Suite gibt dir die Infrastruktur um Verfahrensdokumentationen als professionelle Dienstleistung anzubieten. Deine Mandanten füllen aus, du prüfst und finalisierst – fertig ist ein Dokument das einer Betriebsprüfung standhält.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-wrap gap-3 mb-8">
                  <PrimaryBtn to="/test-starten">Jetzt kostenlos testen</PrimaryBtn>
                  <a href="#preise" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 hover:opacity-80" style={{ border: `1px solid ${C.dark}`, color: C.dark, borderRadius: 980, padding: '12px 24px', background: 'transparent' }}>Pläne vergleichen</a>
                </div>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: C.dark }}>
                  {['Whitelabel unter deinem Brand', 'Unbegrenzte Mandanten (Agentur)', 'Mandanten laden und verwalten', 'PDF mit deinem Logo'].map(t => (
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
                <img src={mockupClients} alt="GoBD-Suite Mandantenübersicht – Berater-Portal mit Kundenliste" className="w-full h-auto" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 2. DIE CHANCE ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Eine Pflicht deiner Mandanten.<br className="hidden md:inline" /> Deine neue Einnahmequelle.</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <Reveal>
                <p className="text-lg leading-relaxed" style={{ color: C.textGray }}>
                  Seit 2025 prüft das Finanzamt aktiv ob Verfahrensdokumentationen vorliegen. Die meisten deiner Mandanten haben keine.
                </p>
                <p className="text-lg leading-relaxed mt-4" style={{ color: C.textGray }}>
                  Das ist deine Chance: Biete die Erstellung als Dienstleistung an. Der Markt ist riesig – und kaum ein Dienstleister ist bereits positioniert.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="rounded-[18px] p-8" style={{ ...glass }}>
                  <p className="text-sm font-semibold mb-4" style={{ color: C.dark }}>Beispielrechnung Berater-Plan:</p>
                  <ul className="space-y-3 text-[15px]" style={{ color: C.dark }}>
                    <li className="flex justify-between"><span>5 Mandanten × 1.500 € VD-Erstellung</span><span className="font-semibold">7.500 €</span></li>
                    <li className="flex justify-between"><span>Laufende Aktualisierungen × 5</span><span className="font-semibold">500 €/Jahr</span></li>
                    <li className="flex justify-between" style={{ color: C.textGray }}><span>Dein Aufwand: Tool-Kosten</span><span>399 €/Monat</span></li>
                  </ul>
                  <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                    <p className="font-bold text-lg" style={{ color: C.dark }}>Ab dem ersten Mandanten rentabel.</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══ 3. SO FUNKTIONIERT DIE ZUSAMMENARBEIT ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Wie du mit GoBD-Suite als Dienstleister arbeitest</h2>
            </Reveal>
            <div className="space-y-0">
              {timelineSteps.map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="flex gap-6 relative">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(250,200,30,0.12)' }}>
                        <s.Icon size={22} style={{ color: C.yellow }} />
                      </div>
                      {i < timelineSteps.length - 1 && <div className="w-px flex-1 my-2" style={{ background: C.border }} />}
                    </div>
                    <div className="pb-10">
                      <span className="text-xs font-bold" style={{ color: C.yellow }}>Schritt {i + 1}</span>
                      <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: C.dark }}>{s.title}</h3>
                      <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 4. WHITELABEL SHOWCASE ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <h2 className="text-3xl md:text-[44px] font-bold leading-[1.1] mb-8" style={{ color: C.dark }}>Dein Brand. Dein Dokument.<br className="hidden md:inline" /> Dein Mandant.</h2>
                <p className="leading-relaxed mb-6" style={{ color: C.textGray }}>
                  Mit dem Agentur-Plan läuft alles unter deinem Namen:
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    'Dein Logo auf dem PDF-Deckblatt',
                    'Deine Kontaktdaten im Dokument',
                    'Dein Firmenname in der Fußzeile',
                    'Deine Domain im Einladungslink',
                    'Kein Hinweis auf GoBD-Suite',
                  ].map(t => (
                    <li key={t} className="flex items-center gap-2 text-[15px]" style={{ color: C.dark }}>
                      <Check size={16} style={{ color: C.green }} /> {t}
                    </li>
                  ))}
                </ul>
                <p className="leading-relaxed" style={{ color: C.textGray }}>
                  Für deine Mandanten bist du der Anbieter – GoBD-Suite ist dein unsichtbares Werkzeug.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <img src={mockupPdf} alt="GoBD-Suite – PDF-Deckblatt mit Whitelabel-Branding und individuellem Logo" className="w-full h-auto" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 5. FÜR WEN GENAU ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Perfekt für dich wenn du...</h2></Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                '...Steuerberater oder Buchhalter bist und deinen Mandanten einen Mehrwert bieten willst',
                '...als Unternehmensberater oder Consultant eine neue Dienstleistung aufbauen willst',
                '...Marketing-Berater bist und Kunden bei der Digitalisierung begleitest',
                '...eine Agentur führst und skalierbare Zusatzleistungen suchst',
                '...Freelancer bist der VDs als Nebenleistung anbieten will',
                '...bereits Mandanten betreust und diese absichern willst',
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

        {/* ═══ 6. VERGLEICH ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Berater oder Agentur –<br className="hidden md:inline" /> was passt zu dir?</h2></Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[18px] overflow-hidden" style={{ background: C.white, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: C.bgLight }}>
                      <th className="text-left px-6 py-4 font-semibold" style={{ color: C.dark }}>Feature</th>
                      <th className="text-center px-4 py-4 font-semibold" style={{ color: C.dark }}>Berater</th>
                      <th className="text-center px-4 py-4 font-semibold" style={{ color: C.dark, background: 'rgba(250,200,30,0.1)' }}>Agentur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((r, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td className="px-6 py-3.5 font-medium" style={{ color: C.dark }}>{r.feature}</td>
                        <td className="text-center px-4 py-3.5" style={{ color: C.textGray }}><div className="flex justify-center"><CellVal val={r.berater} /></div></td>
                        <td className="text-center px-4 py-3.5" style={{ color: C.dark, background: 'rgba(250,200,30,0.04)' }}><div className="flex justify-center"><CellVal val={r.agentur} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <PrimaryBtn to="/test-starten">Berater starten</PrimaryBtn>
                <PrimaryBtn to="/test-starten">Agentur starten</PrimaryBtn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 7. TESTIMONIALS ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Was andere Dienstleister sagen</h2></Reveal>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { quote: 'Ich biete die VD-Erstellung jetzt als feste Leistung an. Mit GoBD-Suite dauert ein Mandat keine 2 Stunden – ich berechne 1.500 € und bin ab dem zweiten Mandanten im Plus.', name: 'Sandra K.', role: 'Steuerberaterin, München' },
                { quote: 'Der Agentur-Plan mit Whitelabel ist genau was ich gesucht habe. Meine Kunden sehen nur mein Brand, der Aufwand ist minimal und die Marge ist hervorragend.', name: 'Thomas R.', role: 'Unternehmensberater, Hamburg' },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="rounded-[18px] p-8 h-full" style={{ ...glass }}>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, j) => <Star key={j} size={16} fill={C.yellow} stroke={C.yellow} />)}
                    </div>
                    <p className="leading-relaxed mb-6" style={{ color: C.dark }}>"{t.quote}"</p>
                    <p className="font-semibold text-sm" style={{ color: C.dark }}>{t.name}</p>
                    <p className="text-xs" style={{ color: C.textGray }}>{t.role}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="text-center text-xs mt-8" style={{ color: C.textGray, opacity: 0.7 }}>
                * Die dargestellten Ergebnisse können variieren. Individuelle Ergebnisse hängen von verschiedenen Faktoren ab.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══ 8. PREISE ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section id="preise" className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-4xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-10" style={{ color: C.dark }}>Wähle deinen Plan</h2></Reveal>
            <Reveal delay={0.1}>
              {/* Toggle */}
              <div className="flex items-center justify-center gap-3 mb-14">
                <div className="inline-flex rounded-full p-1" style={{ background: C.white, border: `1px solid ${C.border}` }}>
                  <button onClick={() => setAnnual(false)} className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300" style={{ background: !annual ? C.yellow : 'transparent', color: C.dark }}>Monatlich</button>
                  <button onClick={() => setAnnual(true)} className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2" style={{ background: annual ? C.yellow : 'transparent', color: C.dark }}>
                    Jährlich
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.green, color: '#fff' }}>–17 %</span>
                  </button>
                </div>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* Berater */}
              <Reveal>
                <div className="rounded-[18px] p-8 flex flex-col h-full" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: C.dark }}>Berater</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold transition-all duration-300" style={{ color: C.dark }}>{annual ? '332 €' : '399 €'}</span>
                    <span className="text-sm" style={{ color: C.textGray }}>/Monat</span>
                  </div>
                  <p className="text-xs mb-6" style={{ color: C.textGray }}>{annual ? '3.990 € jährlich · 17 % gespart' : '3 Monate Mindestlaufzeit · danach monatlich kündbar'}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {[
                      { t: 'Bis zu 5 Mandanten', ok: true }, { t: 'Berater-Portal', ok: true }, { t: 'Alle KI-Funktionen', ok: true },
                      { t: 'Mandanten-Einladungen', ok: true }, { t: 'PDF-Export', ok: true }, { t: 'Automatische Versionierung', ok: true }, { t: 'Kein Whitelabel', ok: false },
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[15px]" style={{ color: f.ok ? C.dark : C.textGray }}>
                        {f.ok ? <Check size={16} style={{ color: C.green }} /> : <X size={16} style={{ color: C.textGray }} />} {f.t}
                      </li>
                    ))}
                  </ul>
                  <PrimaryBtn to="/test-starten" className="w-full text-center justify-center">Jetzt testen</PrimaryBtn>
                </div>
              </Reveal>

              {/* Agentur */}
              <Reveal delay={0.1}>
                <div className="rounded-[18px] p-8 flex flex-col h-full relative" style={{ background: C.white, boxShadow: '0 4px 32px rgba(0,0,0,0.10)', borderTop: `4px solid ${C.yellow}` }}>
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.yellow, color: C.dark }}>Empfohlen</span>
                  <h3 className="text-xl font-bold mb-2" style={{ color: C.dark }}>Agentur</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold transition-all duration-300" style={{ color: C.dark }}>{annual ? '665 €' : '799 €'}</span>
                    <span className="text-sm" style={{ color: C.textGray }}>/Monat</span>
                  </div>
                  <p className="text-xs mb-6" style={{ color: C.textGray }}>{annual ? '7.990 € jährlich · 17 % gespart' : '3 Monate Mindestlaufzeit · danach monatlich kündbar'}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {[
                      { t: 'Unbegrenzte Mandanten', ok: true }, { t: 'Whitelabel (Logo + Brand)', ok: true }, { t: 'Eigene Domain im PDF', ok: true },
                      { t: 'Alle Berater-Features', ok: true }, { t: 'Prioritäts-Support', ok: true },
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-[15px]" style={{ color: C.dark }}>
                        <Check size={16} style={{ color: C.green }} /> {f.t}
                      </li>
                    ))}
                  </ul>
                  <PrimaryBtn to="/test-starten" className="w-full text-center justify-center">Jetzt testen</PrimaryBtn>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.2}>
              <p className="text-center mt-10 text-sm" style={{ color: C.textGray }}>Alle Pläne mit 7 Tagen kostenlosem Test · Keine Kreditkarte nötig</p>
              <p className="text-center mt-2 text-xs" style={{ color: C.textGray, opacity: 0.7 }}>Alle Preise zzgl. gesetzlich gültiger MwSt. · Dieses Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB.</p>
            </Reveal>
          </div>
        </section>

        {/* ═══ 9. FAQ ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Häufige Fragen von Dienstleistern</h2></Reveal>
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.05}><FaqItem q={f.q} a={f.a} /></Reveal>
            ))}
          </div>
        </section>

        {/* ═══ 10. FINALER CTA ═══ */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.dark }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h2 className="text-3xl md:text-[44px] font-bold leading-tight mb-4" style={{ color: C.white }}>
                Deine Mandanten brauchen eine Verfahrensdokumentation.<br className="hidden md:inline" /> Du kannst der Anbieter sein.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>Starte heute mit 7 Tagen kostenlosem Test. Kein Risiko. Keine Kreditkarte.</p>
            </Reveal>
            <Reveal delay={0.2}><PrimaryBtn to="/test-starten">Jetzt kostenlos testen</PrimaryBtn></Reveal>
            <Reveal delay={0.3}>
              <p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.6)' }}>Berater ab 399 €/Monat · Agentur mit Whitelabel ab 799 €/Monat</p>
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
              <li><Link to="/fuer-selbststaendige" className="hover:text-white transition-colors">Für Selbstständige</Link></li>
              <li><Link to="/fuer-dienstleister" className="hover:text-white transition-colors text-white font-semibold">Für Dienstleister</Link></li>
              <li><p className="text-sm mt-3">info@gobd-suite.de</p></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} GoBD-Suite · Alle Rechte vorbehalten
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
