import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react';
import { CookieBanner, CookieSettingsButton } from '@/components/CookieBanner';
import mockupDashboard from '@/assets/mockup-dashboard.png';
import mockupEditor from '@/assets/mockup-editor.png';
import mockupPdf from '@/assets/mockup-pdf.png';
import mockupClients from '@/assets/mockup-clients.png';
import mockupOverview from '@/assets/mockup-overview.png';
import mockupOnboarding from '@/assets/mockup-onboarding.png';
import mockupSoloDashboard from '@/assets/mockup-solo-dashboard.png';
import productSolution from '@/assets/product-solution.png';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Euro, Clock, Check, X, ChevronDown, ChevronUp,
  Sparkles, FileText, History, Download, ShieldCheck, Palette, Menu, XIcon,
  ArrowDown, Star, ThumbsUp, Shield,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

/* ─── Design tokens ─── */
const C = {
  yellow: '#FAC81E',
  dark: '#44484E',
  white: '#FFFFFF',
  bgLight: '#F5F5F7',
  hoverDark: '#3A3D42',
  green: '#34C759',
  textGray: '#6E6E73',
  border: '#E5E5E5',
} as const;

/* ─── Reveal wrapper (upgraded: translateY(-20px → 0), 0.6s) ─── */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Counter hook ─── */
function useCountUp(end: number, duration = 1500, trigger = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, end, duration]);

  return value;
}

function CounterStat({ num, suffix, text }: { num: number; suffix: string; text: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.3);
  const count = useCountUp(num, 1500, isVisible);
  return (
    <div ref={ref}>
      <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: C.dark }}>
        {suffix === '< ' ? `< ${count}` : count}{suffix !== '< ' ? suffix : ''}
      </p>
      <p className="text-sm font-medium leading-snug" style={{ color: C.dark, opacity: 0.8 }}>{text}</p>
    </div>
  );
}

/* ─── Wave Divider ─── */
function WaveDivider({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 60, background: to, transform: flip ? 'scaleY(-1)' : undefined }}>
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0,0 C360,60 1080,0 1440,60 L1440,0 L0,0 Z" fill={from} />
      </svg>
    </div>
  );
}

/* ─── Glassmorphism style helper ─── */
const glass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
};

/* ─── Primary Button with glow ─── */
function PrimaryBtn({ children, to, className = '' }: { children: ReactNode; to: string; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 ${className}`}
      style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#e5b71a';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(250, 200, 30, 0.4)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = C.yellow;
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </Link>
  );
}

function SecondaryBtn({ children, onClick, to, className = '' }: { children: ReactNode; onClick?: () => void; to?: string; className?: string }) {
  const style: React.CSSProperties = { border: `1px solid ${C.dark}`, color: C.dark, borderRadius: 980, padding: '12px 24px', background: 'transparent' };
  const cls = `inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 hover:opacity-80 ${className}`;
  if (to) return <Link to={to} className={cls} style={style}>{children}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
}

/* ─── FAQ Accordion ─── */
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

/* ─── Star Rating ─── */
function Stars() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={C.yellow} stroke={C.yellow} />)}
    </div>
  );
}

/* ─── Price Card ─── */
function PriceCard({ name, price, unit, sub, features, highlighted = false }: {
  name: string; price: string; unit: string; sub: string;
  features: { text: string; ok: boolean }[];
  highlighted?: boolean;
}) {
  return (
    <div
      className="rounded-[18px] p-8 flex flex-col h-full relative"
      style={{
        background: C.white,
        boxShadow: highlighted ? '0 4px 32px rgba(0,0,0,0.10)' : '0 2px 16px rgba(0,0,0,0.06)',
        borderTop: highlighted ? `4px solid ${C.yellow}` : undefined,
      }}
    >
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.yellow, color: C.dark }}>Beliebt</span>
      )}
      <h3 className="text-xl font-bold mb-2" style={{ color: C.dark }}>{name}</h3>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-4xl font-bold" style={{ color: C.dark }}>{price}</span>
        <span className="text-sm" style={{ color: C.textGray }}>{unit}</span>
      </div>
      <p className="text-xs mb-6" style={{ color: C.textGray }}>{sub}</p>
      <ul className="space-y-2 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[15px]" style={{ color: f.ok ? C.dark : C.textGray }}>
            {f.ok ? <Check size={16} style={{ color: C.green }} /> : <X size={16} style={{ color: C.textGray }} />}
            {f.text}
          </li>
        ))}
      </ul>
      <PrimaryBtn to="/test-starten" className="w-full text-center">Jetzt starten</PrimaryBtn>
    </div>
  );
}

/* ─── Sticky Steps hook ─── */
function useActiveStep(count: number) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const setRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    refs.current[i] = el;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = refs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    refs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  return { active, setRef };
}

/* ═══════════════════════════════════════════════
   MARKETING PAGE
   ═══════════════════════════════════════════════ */
export default function MarketingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* 6. Nav scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* 5. Sticky steps */
  const steps = [
    { num: '1', icon: FileText, title: 'Onboarding ausfüllen', text: 'Beantworte 7 kurze Fragen zu deinem Unternehmen. Das dauert 5 Minuten und steuert welche Kapitel für dich relevant sind.', img: mockupOnboarding },
    { num: '2', icon: Sparkles, title: 'Kapitel beschreiben', text: 'Beschreibe in deinen eigenen Worten wie du arbeitest. Kein Fachjargon, keine Paragraphen. Die KI prüft und vervollständigt.', img: mockupEditor },
    { num: '3', icon: Download, title: 'PDF herunterladen', text: 'Deine fertige, GoBD-konforme Verfahrensdokumentation als professionelles PDF. Bereit für die nächste Prüfung.', img: mockupPdf },
  ];
  const { active: activeStep, setRef: setStepRef } = useActiveStep(steps.length);

  const jsonLdSchemas = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "GoBD-Suite",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Das erste vollständige Verfahrensdokumentations-Tool im DACH-Raum. KI-gestützt und GoBD-konform.",
      "url": "https://vd.gaetanoficarra.de",
      "offers": [
        { "@type": "Offer", "name": "Solo", "price": "980", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1Y" } },
        { "@type": "Offer", "name": "Berater", "price": "399", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
        { "@type": "Offer", "name": "Agentur", "price": "799", "priceCurrency": "EUR", "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" } },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Brauche ich eine Verfahrensdokumentation?", "acceptedAnswer": { "@type": "Answer", "text": "Ja. Die GoBD verpflichten seit 2014 alle Unternehmen die digital buchen zur Verfahrensdokumentation. Seit 2025 wird das aktiv bei Betriebsprüfungen geprüft." } },
        { "@type": "Question", "name": "Ist die Verfahrensdokumentation Aufgabe meines Steuerberaters?", "acceptedAnswer": { "@type": "Answer", "text": "Nein. Die Verfahrensdokumentation muss das Unternehmen selbst erstellen, weil sie die internen Abläufe beschreibt." } },
        { "@type": "Question", "name": "Wie lange dauert die Erstellung mit GoBD-Suite?", "acceptedAnswer": { "@type": "Answer", "text": "Die meisten Nutzer sind in unter einer Stunde fertig. Du beantwortest Fragen in normaler Sprache, die KI übernimmt die fachliche Aufbereitung." } },
        { "@type": "Question", "name": "Was passiert wenn sich mein Prozess ändert?", "acceptedAnswer": { "@type": "Answer", "text": "Einfach das entsprechende Kapitel aktualisieren. Alle Änderungen werden automatisch mit Datum und Versionsnummer dokumentiert." } },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "GoBD-Suite",
      "url": "https://vd.gaetanoficarra.de",
      "logo": "https://vd.gaetanoficarra.de/images/logo.png",
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer service", "availableLanguage": "German" },
    },
  ], []);

  useSEO({
    title: 'GoBD-Suite – Verfahrensdokumentation erstellen | GoBD-konform & KI-gestützt',
    description: 'GoBD-Suite ist das erste vollständige Verfahrensdokumentations-Tool im DACH-Raum. KI-gestützt, GoBD-konform, fertig in unter einer Stunde. Jetzt kostenlos testen.',
    canonical: 'https://vd.gaetanoficarra.de',
    keywords: 'Verfahrensdokumentation, GoBD, GoBD-konform, Verfahrensdokumentation erstellen, GoBD Tool, Buchhaltung Software, Betriebsprüfung',
    author: 'Gaetano Ficarra',
    robots: 'index, follow',
    ogTitle: 'GoBD-Suite – Verfahrensdokumentation erstellen',
    ogDescription: 'Das erste vollständige VD-Tool im DACH-Raum. KI-gestützt, GoBD-konform, fertig in unter einer Stunde.',
    ogType: 'website',
    ogLocale: 'de_DE',
    ogImage: 'https://vd.gaetanoficarra.de/og-image.png',
    twitterCard: 'summary_large_image',
    twitterTitle: 'GoBD-Suite',
    twitterDescription: 'Das erste vollständige VD-Tool im DACH-Raum.',
    jsonLd: jsonLdSchemas,
  });

  /* ─── Float keyframes (injected once) ─── */
  useEffect(() => {
    const id = 'marketing-float-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes heroFloat {
        0%, 100% { transform: perspective(1200px) rotateY(-8deg) rotateX(2deg) translateY(0px); box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
        50% { transform: perspective(1200px) rotateY(-8deg) rotateX(2deg) translateY(-10px); box-shadow: 0 35px 70px rgba(0,0,0,0.10); }
      }
      @keyframes heroSlideUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      {/* ─── 1. NAV (6. transparent → glass on scroll) ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12"
        style={{
          height: 64,
          background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.3s ease',
        }}
        aria-label="Hauptnavigation"
      >
        <Link to="/" className="flex items-center gap-2 font-bold text-xl shrink-0" style={{ color: C.dark }}>
          <img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-14 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium" style={{ color: C.dark }}>
          <a href="#funktionen" className="hover:opacity-70 transition-opacity">Funktionen</a>
          <a href="#fuer-wen" className="hover:opacity-70 transition-opacity">Für wen?</a>
          <a href="#preise" className="hover:opacity-70 transition-opacity">Preise</a>
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

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-40 flex flex-col pt-20 px-8 gap-6 text-lg font-medium md:hidden" style={{ background: C.white, color: C.dark }}>
          <a href="#funktionen" onClick={() => setMobileMenu(false)}>Funktionen</a>
          <a href="#fuer-wen" onClick={() => setMobileMenu(false)}>Für wen?</a>
          <a href="#preise" onClick={() => setMobileMenu(false)}>Preise</a>
          <Link to="/blog" onClick={() => setMobileMenu(false)}>Blog</Link>
          <hr style={{ borderColor: C.border }} />
          <Link to="/auth" onClick={() => setMobileMenu(false)}>Anmelden</Link>
          <PrimaryBtn to="/test-starten">Kostenlos testen</PrimaryBtn>
        </div>
      )}

      <main>
        {/* ─── 2. HERO (with radial gradient + slide-up + highlight) ─── */}
        <section
          className="min-h-[90vh] flex items-center px-6 lg:px-12 pt-24 pb-20 relative overflow-hidden"
          style={{ background: C.white }}
        >
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(250, 200, 30, 0.15), transparent)' }} />

          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">
            {/* Left */}
            <div style={{ animation: 'heroSlideUp 0.8s ease-out both' }}>
              <Reveal>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: C.yellow, color: C.dark }}>
                  Das erste VD-Tool im DACH-Raum
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <h1 className="text-4xl md:text-[48px] lg:text-[56px] font-bold leading-[1.1] mb-6" style={{ color: C.dark }}>
                  Das Finanzamt kann deine gesamte Buchführung verwerfen.<br />
                  <span style={{ color: C.textGray }}>Auch ohne einen einzigen Fehler.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="text-lg md:text-xl max-w-[540px] mb-10 leading-relaxed" style={{ color: C.textGray }}>
                  Der Grund: Fehlende Verfahrensdokumentation. Seit 2025 wird das aktiv geprüft. GoBD-Suite schützt dich – in unter einer Stunde.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="flex flex-wrap items-center gap-4">
                  <PrimaryBtn to="/test-starten">Jetzt kostenlos testen</PrimaryBtn>
                  <SecondaryBtn onClick={() => document.getElementById('funktionen')?.scrollIntoView({ behavior: 'smooth' })}>
                    Wie es funktioniert <ArrowDown size={16} />
                  </SecondaryBtn>
                </div>
                <p className="mt-4 text-sm font-semibold" style={{ color: C.green }}>
                  30 Tage Zufriedenheitsgarantie – kein Risiko
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-sm" style={{ color: C.textGray }}>
                  {['GoBD-konform seit 2014', 'KI-gestützte Erstellung', 'Fertig in unter 60 Minuten', 'Automatisch versioniert'].map(t => (
                    <span key={t} className="flex items-center gap-1.5"><Check size={14} style={{ color: C.green }} /> {t}</span>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* Right: Dashboard mockup (9. floating animation) */}
            <Reveal delay={0.25} className="hidden lg:block">
              <div
                className="rounded-xl overflow-hidden"
                style={{ animation: 'heroFloat 3s ease-in-out infinite' }}
              >
                {/* macOS dots */}
                <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ background: '#f0f0f0' }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <img src={mockupDashboard} alt="GoBD-Suite Dashboard mit Mandanten- und Projektübersicht" className="w-full h-auto" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave: white → agitation ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 3. AGITATION (8. gradient bg) ─── */}
        <section style={{ background: `linear-gradient(180deg, ${C.bgLight} 0%, ${C.white} 100%)` }} className="py-20 md:py-24 px-6" aria-labelledby="pain-headline">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 id="pain-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>
                Was passiert ohne <span style={{ background: 'rgba(250, 200, 30, 0.2)', borderRadius: 4, padding: '0 6px' }}>Verfahrensdokumentation</span>?
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { Icon: AlertTriangle, title: 'Finanzamt verwirft deine Buchführung', text: 'Der Prüfer kann deine gesamte digitale Buchführung als nicht ordnungsgemäß einstufen – und einfach schätzen.' },
                { Icon: Euro, title: 'Nachzahlungen die dein Business gefährden', text: 'Steuerliche Schätzungen liegen fast immer über deinen tatsächlichen Einnahmen. Das tut weh.' },
                { Icon: Clock, title: 'Stundenlanger Stress statt 5 Minuten vorlegen', text: 'Wer vorbereitet ist, übergibt ein Dokument und geht. Wer es nicht ist, erklärt sich stundenlang.' },
              ].map((c, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <article className="rounded-[18px] p-8 h-full" style={{ ...glass }}>
                    <c.Icon size={32} style={{ color: C.yellow }} className="mb-4" aria-hidden="true" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{c.title}</h3>
                    <p className="leading-relaxed" style={{ color: C.textGray }}>{c.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="text-center font-bold mt-14 max-w-[700px] mx-auto text-lg leading-relaxed" style={{ color: C.dark }}>
                Seit 2025 prüft das Finanzamt aktiv ob eine Verfahrensdokumentation vorliegt. Die meisten Selbstständigen haben keine.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── 4. SOCIAL PROOF ZAHLEN (3. counter animation) ─── */}
        <section className="py-16 md:py-20 px-6" style={{ background: C.yellow }}>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center">
            <CounterStat num={30} suffix="" text="GoBD-Kapitel vollständig abgedeckt" />
            <CounterStat num={60} suffix="< " text="Bis zur fertigen Verfahrensdokumentation" />
            <CounterStat num={10} suffix=" Jahre" text="Aufbewahrungspflicht automatisch erfüllt" />
            <CounterStat num={100} suffix="%" text="GoBD-konform nach aktuellem Stand 2025" />
          </div>
        </section>

        {/* ─── Wave: yellow → white ─── */}
        <WaveDivider from={C.yellow} to={C.white} />

        {/* ─── 5. LÖSUNG ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="solution-headline">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: C.yellow }}>Die Lösung</p>
                <h2 id="solution-headline" className="text-3xl md:text-[44px] lg:text-[52px] font-bold leading-[1.1] mb-6" style={{ color: C.dark }}>
                  Deine Verfahrens-<br className="hidden md:inline" />dokumentation. Fertig. Rechtssicher. In deiner Sprache.
                </h2>
                <p className="leading-relaxed mb-8" style={{ color: C.textGray }}>
                  GoBD-Suite ist das erste vollständige Verfahrensdokumentations-Tool im DACH-Raum. Du beantwortest Fragen wie in einem Gespräch – die KI erstellt daraus das fertige, GoBD-konforme Dokument. Kein Juristendeutsch. Kein Steuerberater nötig.
                </p>
                <ul className="space-y-3">
                  {[
                    'KI versteht Alltagssprache – kein Fachjargon nötig',
                    'Alle 30 GoBD-Kapitel automatisch abgedeckt',
                    'Fertige PDF auf Knopfdruck',
                    'Änderungen werden automatisch versioniert und dokumentiert',
                  ].map(t => (
                    <li key={t} className="flex items-start gap-2 text-[15px]" style={{ color: C.dark }}>
                      <Check size={18} className="mt-0.5 shrink-0" style={{ color: C.green }} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
                <img src={productSolution} alt="GoBD-Suite Kapitel-Editor mit Sidebar und KI-gestütztem Texteditor" className="w-full h-auto" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave: white → bgLight ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 6. WIE ES FUNKTIONIERT (5. sticky step activation) ─── */}
        <section id="funktionen" style={{ background: `linear-gradient(180deg, ${C.bgLight} 0%, ${C.white} 100%)` }} className="py-20 md:py-28 px-6" aria-labelledby="steps-headline">
          <div className="max-w-5xl mx-auto text-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: C.yellow }}>So einfach geht es</p>
              <h2 id="steps-headline" className="text-3xl md:text-[48px] font-bold leading-tight mb-16" style={{ color: C.dark }}>
                In drei Schritten zur fertigen Verfahrensdokumentation
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div
                    ref={setStepRef(i)}
                    className="flex flex-col items-center transition-all duration-500"
                    style={{
                      opacity: activeStep === i ? 1 : 0.4,
                      transform: activeStep === i ? 'scale(1)' : 'scale(0.95)',
                    }}
                  >
                    <span className="text-[80px] font-bold leading-none mb-2" style={{ color: C.yellow, opacity: 0.3 }} aria-hidden="true">{s.num}</span>
                    <s.icon size={32} className="mb-4" style={{ color: C.dark }} aria-hidden="true" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{s.title}</h3>
                    <p className="leading-relaxed mb-4" style={{ color: C.textGray }}>{s.text}</p>
                    {s.img && (
                      <div className="rounded-xl overflow-hidden mt-2" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                        <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                        </div>
                        <img src={s.img} alt={s.title} className="w-full h-auto" loading="lazy" />
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Wave: white → white ─── */}
        <WaveDivider from={C.white} to={C.white} />

        {/* ─── 7. FÜR WEN ─── */}
        <section id="fuer-wen" className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="audience-headline">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 id="audience-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>
                Für Selbstständige. Für Dienstleister. Für alle.
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-6">
              <Reveal>
                <article className="rounded-[18px] p-8 h-full" style={{ background: C.white, border: `1px solid ${C.border}` }}>
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: C.bgLight, color: C.dark }}>Solo-Plan</span>
                  <h3 className="text-xl font-bold mb-4" style={{ color: C.dark }}>Du willst deine VD selbst erstellen</h3>
                  <ul className="space-y-2 mb-8">
                    {['Kein Steuerberater nötig', 'Einmalig zahlen, 12 Monate nutzen', 'Unbegrenzte Revisionen', 'Fertig in unter einer Stunde'].map(t => (
                      <li key={t} className="flex items-center gap-2 text-[15px]" style={{ color: C.textGray }}><Check size={16} style={{ color: C.green }} /> {t}</li>
                    ))}
                  </ul>
                  <a href="#preise" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200" style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}>Solo-Plan ansehen</a>
                  <div className="rounded-xl overflow-hidden mt-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <img src={mockupSoloDashboard} alt="GoBD-Suite Solo Dashboard mit Projektfortschritt" className="w-full h-auto" loading="lazy" />
                  </div>
                </article>
              </Reveal>
              <Reveal delay={0.1}>
                <article className="rounded-[18px] p-8 h-full" style={{ background: C.white, border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.yellow }}>
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4" style={{ background: C.yellow, color: C.dark }}>Berater & Agentur</span>
                  <h3 className="text-xl font-bold mb-4" style={{ color: C.dark }}>Du willst VDs als Dienstleistung anbieten</h3>
                  <ul className="space-y-2 mb-8">
                    {['Mehrere Mandanten verwalten', 'Whitelabel unter deinem Brand (Agentur)', 'Neue Einnahmequelle für dein Business', 'Mandanten füllen selbst aus – du prüfst und finalisierst'].map(t => (
                      <li key={t} className="flex items-center gap-2 text-[15px]" style={{ color: C.textGray }}><Check size={16} style={{ color: C.green }} /> {t}</li>
                    ))}
                  </ul>
                  <a href="#preise" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 mb-6" style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}>Für Dienstleister</a>
                  <div className="rounded-xl overflow-hidden mt-6" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                    </div>
                    <img src={mockupClients} alt="GoBD-Suite Mandantenübersicht mit mehreren Kunden" className="w-full h-auto" loading="lazy" />
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── Wave: white → bgLight ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 8. FEATURES (4. glassmorphism cards, 8. gradient bg) ─── */}
        <section style={{ background: `linear-gradient(180deg, ${C.bgLight} 0%, ${C.white} 100%)` }} className="py-20 md:py-28 px-6" aria-labelledby="features-headline">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 id="features-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>
                Alles was du brauchst. Nichts was du nicht brauchst.
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { Icon: Sparkles, title: 'KI versteht deine Sprache', text: 'Du erzählst wie dein Business läuft – die KI schreibt den GoBD-konformen Text.' },
                { Icon: FileText, title: '30 Kapitel automatisch abgedeckt', text: 'Alle GoBD-relevanten Bereiche werden vollständig dokumentiert.' },
                { Icon: History, title: 'Automatische Versionierung', text: 'Jede Änderung wird mit Datum und Grund dokumentiert. Immer prüfungsbereit.' },
                { Icon: Download, title: 'Professionelles PDF', text: 'Auf Knopfdruck. Mit Deckblatt, Inhaltsverzeichnis und Änderungshistorie.' },
                { Icon: ShieldCheck, title: 'Negativvermerke inklusive', text: 'Nicht relevante Kapitel werden automatisch korrekt ausgeschlossen – kein leeres Kapitel.' },
                { Icon: Palette, title: 'Whitelabel für Dienstleister', text: 'Dein Logo, dein Brand, deine Domain im PDF. Für Agentur-Kunden.' },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <article className="rounded-[18px] p-8 h-full" style={{ ...glass }}>
                    <f.Icon size={28} className="mb-4" style={{ color: C.yellow }} aria-hidden="true" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{f.title}</h3>
                    <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{f.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.5}>
              <div className="mt-14 max-w-3xl mx-auto rounded-xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
                <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: '#f0f0f0' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                </div>
                <img src={mockupOverview} alt="GoBD-Suite Berater-Übersicht mit Ampel-Status für alle Kapitel" className="w-full h-auto" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave: white → white ─── */}
        <WaveDivider from={C.white} to={C.white} />

        {/* ─── 9. TESTIMONIALS (4. glassmorphism) ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="testimonials-headline">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 id="testimonials-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>
                Was andere Selbstständige sagen
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  quote: 'Ich hatte keine Ahnung dass ich eine Verfahrensdokumentation brauche. GoBD-Suite hat mir in 45 Minuten ein professionelles Dokument erstellt das ich direkt beim Finanzamt vorlegen kann.',
                  name: 'Marcus T.',
                  role: 'Freelance Designer, Berlin',
                },
                {
                  quote: 'Als Steuerberaterin empfehle ich meinen Mandanten jetzt GoBD-Suite. Die Qualität der generierten Dokumente ist beeindruckend – und ich spare enorm viel Zeit.',
                  name: 'Sandra K.',
                  role: 'Steuerberaterin, München',
                },
                {
                  quote: 'Der Agentur-Plan ist perfekt für mein Business. Ich erstelle jetzt VDs für meine Kunden unter meinem eigenen Brand. Neue Einnahmequelle mit minimalem Aufwand.',
                  name: 'Thomas R.',
                  role: 'Marketing-Consultant, Hamburg',
                },
              ].map((t, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <article className="rounded-[18px] p-8 h-full flex flex-col" style={{ ...glass, background: 'rgba(245, 245, 247, 0.7)' }}>
                    <Stars />
                    <p className="leading-relaxed flex-1 mb-6 text-[15px]" style={{ color: C.dark }}>"{t.quote}"</p>
                    <div>
                      <p className="font-bold text-sm" style={{ color: C.dark }}>{t.name}</p>
                      <p className="text-xs" style={{ color: C.textGray }}>{t.role}</p>
                    </div>
                  </article>
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

        {/* ─── Wave: white → bgLight ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 11. PREISE (8. gradient bg) ─── */}
        <section id="preise" style={{ background: `linear-gradient(180deg, ${C.bgLight} 0%, ${C.white} 50%, ${C.bgLight} 100%)` }} className="py-20 md:py-28 px-6" aria-labelledby="pricing-headline">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 id="pricing-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Transparent. Fair. Skalierbar.</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6 items-stretch">
              <Reveal>
                <PriceCard name="Solo" price="980 €" unit="einmalig" sub="12 Monate Zugang · Renewal 199 €/Jahr" features={[
                  { text: '1 Mandant (du selbst)', ok: true }, { text: 'Alle 30 Kapitel', ok: true }, { text: 'KI-Unterstützung', ok: true },
                  { text: 'Unbegrenzte Revisionen', ok: true }, { text: 'PDF-Export', ok: true }, { text: 'Kein Whitelabel', ok: false }, { text: 'Kein Berater-Portal', ok: false },
                ]} />
              </Reveal>
              <Reveal delay={0.1}>
                <PriceCard name="Agentur" price="799 €" unit="/Monat" sub="zzgl. 590 € Setup Fee · Jederzeit kündbar" highlighted features={[
                  { text: 'Unbegrenzte Mandanten', ok: true }, { text: 'Whitelabel (Logo + Brand)', ok: true }, { text: 'Eigene Domain im PDF', ok: true },
                  { text: 'Alle Berater-Features', ok: true }, { text: 'Prioritäts-Support', ok: true }, { text: 'Upgrade ohne erneute Setup Fee', ok: true },
                ]} />
              </Reveal>
              <Reveal delay={0.2}>
                <PriceCard name="Berater" price="399 €" unit="/Monat" sub="zzgl. 590 € Setup Fee · Jederzeit kündbar" features={[
                  { text: 'Bis zu 5 Mandanten', ok: true }, { text: 'Berater-Portal', ok: true }, { text: 'Alle KI-Funktionen', ok: true },
                  { text: 'Mandanten-Einladungen', ok: true }, { text: 'PDF-Export', ok: true }, { text: 'Kein Whitelabel', ok: false },
                ]} />
              </Reveal>
            </div>
            <Reveal delay={0.3}>
              <p className="text-center mt-10 text-sm" style={{ color: C.textGray }}>Alle Pläne mit 7 Tagen kostenlosem Test · Keine Kreditkarte für den Test nötig</p>
              <p className="text-center mt-2">
                <Link to="/test-starten" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: C.dark }}>→ Kostenlos testen</Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave: bgLight → white ─── */}
        <WaveDivider from={C.bgLight} to={C.white} />

        {/* ─── 12. GARANTIE ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="guarantee-headline">
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <Shield size={56} style={{ color: C.yellow }} className="mx-auto mb-6" aria-hidden="true" />
              <h2 id="guarantee-headline" className="text-3xl md:text-[48px] font-bold leading-tight mb-14" style={{ color: C.dark }}>
                Unsere Versprechen an dich
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 gap-6">
              <Reveal>
                <div className="rounded-[18px] p-8 h-full text-left" style={{ ...glass, background: 'rgba(245, 245, 247, 0.7)' }}>
                  <ThumbsUp size={28} style={{ color: C.yellow }} className="mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold mb-3" style={{ color: C.dark }}>100% Zufriedenheitsgarantie</h3>
                  <p className="leading-relaxed mb-4" style={{ color: C.textGray }}>
                    Wenn das Tool nicht das tut was es soll, es zu kompliziert ist oder technische Probleme auftreten die wir nicht lösen können – bekommst du dein Geld zurück. Melde dich einfach bei uns.
                  </p>
                  <p className="text-xs leading-relaxed max-w-[300px]" style={{ color: C.textGray, opacity: 0.7 }}>
                    Die Garantie gilt für technische Mängel und Funktionsprobleme – nicht für bereits fertig erstellte Verfahrensdokumentationen.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="rounded-[18px] p-8 h-full text-left" style={{ ...glass, background: 'rgba(245, 245, 247, 0.7)' }}>
                  <ShieldCheck size={28} style={{ color: C.yellow }} className="mb-4" aria-hidden="true" />
                  <h3 className="text-xl font-bold mb-3" style={{ color: C.dark }}>GoBD-konforme Struktur. Deine Verantwortung.</h3>
                  <p className="leading-relaxed mb-4" style={{ color: C.textGray }}>
                    GoBD-Suite erstellt dein Dokument nach der aktuellen GoBD-Struktur Stand 2025. Die inhaltliche Richtigkeit hängt von deinen Angaben ab. Prüfe den generierten Text und passe ihn an deine tatsächlichen Abläufe an – du bist als Unternehmer verantwortlich für den Inhalt deiner Verfahrensdokumentation.
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: C.textGray, opacity: 0.7 }}>
                    GoBD-Suite übernimmt keine Haftung für die steuerliche Anerkennung deiner Verfahrensdokumentation. Das Tool ersetzt keine steuerliche Beratung.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── 13. DRINGLICHKEIT / FINALER CTA ─── */}
        <section className="py-20 md:py-28 px-6 text-center" style={{ background: C.dark }}>
          <Reveal>
            <p className="text-2xl md:text-3xl font-bold leading-tight mb-4" style={{ color: C.white }}>
              Jede Woche ohne Verfahrensdokumentation ist ein vermeidbares Risiko.
            </p>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Das Finanzamt wartet nicht. Deine Verfahrensdokumentation kann heute fertig sein.
            </p>
            <PrimaryBtn to="/test-starten">Jetzt in 60 Minuten absichern</PrimaryBtn>
          </Reveal>
        </section>

        {/* ─── Wave: dark → white ─── */}
        <WaveDivider from={C.dark} to={C.white} />

        {/* ─── 14. FAQ ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="faq-headline">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 id="faq-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Häufige Fragen</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <FaqItem q="Brauche ich das wirklich?" a="Ja – und zwar seit 2014. Die GoBD verpflichten alle Unternehmen die digital buchen zur Verfahrensdokumentation. Seit 2025 wird das aktiv bei Betriebsprüfungen kontrolliert. Wer keine hat, riskiert dass das Finanzamt seine gesamte digitale Buchführung als nicht ordnungsgemäß einstuft – und schätzt statt prüft. Das bedeutet fast immer Nachzahlungen. Mit GoBD-Suite bist du in unter einer Stunde abgesichert." />
                <FaqItem q="Ist das nicht Aufgabe meines Steuerberaters?" a="Nein. Die Verfahrensdokumentation muss das Unternehmen selbst erstellen, weil sie deine internen Abläufe beschreibt – nicht die des Steuerberaters. Dein Steuerberater kann beraten, aber erstellen musst du sie. GoBD-Suite führt dich Schritt für Schritt durch den gesamten Prozess." />
                <FaqItem q="Das klingt kompliziert." a="Genau dafür wurde GoBD-Suite entwickelt. Du beantwortest Fragen in normaler Sprache – so wie du einem Freund erklärst wie dein Business läuft. Die KI übernimmt die fachliche Aufbereitung. Die meisten Nutzer sind in unter einer Stunde fertig. Teste es 7 Tage kostenlos und überzeuge dich selbst." />
                <FaqItem q="Was wenn sich mein Prozess ändert?" a="Einfach das entsprechende Kapitel aktualisieren. Alle Änderungen werden automatisch mit Datum, Versionsnummer und Änderungsgrund dokumentiert. So bist du immer auf dem neuesten Stand – und kannst bei einer Prüfung lückenlos nachweisen was sich wann geändert hat." />
                <FaqItem q="Kann ich das Tool kostenlos testen?" a="Ja. Du kannst GoBD-Suite 7 Tage lang kostenlos und ohne Kreditkarte testen. Du siehst die vollständige Struktur und kannst zwei Kapitel mit KI-Unterstützung ausprobieren. Starte jetzt – es dauert 2 Minuten." />
                <FaqItem q="Was ist der Unterschied zwischen Berater und Agentur?" a="Der Berater-Plan ist für bis zu 5 Mandanten ohne Whitelabel – ideal zum Einstieg als Dienstleister. Der Agentur-Plan bietet unbegrenzte Mandanten und vollständiges Whitelabel: dein Logo, dein Brand, deine Domain im PDF. Upgrade jederzeit möglich ohne erneute Setup Fee." />
                <FaqItem q="Wann gilt die Zufriedenheitsgarantie?" a="Wenn das Tool technische Probleme hat, nicht das tut was es soll oder zu kompliziert ist und wir das Problem nicht lösen können – bekommst du dein Geld zurück. Melde dich einfach bei uns. Die Garantie gilt nicht für bereits vollständig erstellte Verfahrensdokumentationen, da die Leistung dann erbracht wurde." />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ─── 15. FOOTER ─── */}
      <footer className="py-16 px-6" style={{ background: C.dark, color: 'rgba(255,255,255,0.7)' }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/images/logo-light.png" alt="GoBD-Suite Logo" className="h-10 w-auto mb-4" loading="lazy" />
            <p className="text-sm leading-relaxed">Die erste vollständige Verfahrensdokumentations-Lösung für Selbstständige und Dienstleister im DACH-Raum.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Produkt</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#funktionen" className="hover:text-white transition-colors">Funktionen</a></li>
              <li><a href="#preise" className="hover:text-white transition-colors">Preise</a></li>
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
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Kontakt</h4>
            <p className="text-sm">info@gobd-suite.de</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} GoBD-Suite · Alle Rechte vorbehalten
        </div>
      </footer>
    </div>
  );
}
