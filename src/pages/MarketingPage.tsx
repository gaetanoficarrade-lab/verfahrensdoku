import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Euro, Clock, Check, X, ChevronDown, ChevronUp,
  Sparkles, FileText, History, Download, ShieldCheck, Palette, Menu, XIcon,
  ArrowDown,
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

/* ─── Reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Buttons ─── */
function PrimaryBtn({ children, to, className = '' }: { children: ReactNode; to: string; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 ${className}`}
      style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#e5b71a')}
      onMouseLeave={e => (e.currentTarget.style.background = C.yellow)}
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
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 500 : 0, opacity: open ? 1 : 0 }}>
        <p className="pb-5 leading-relaxed" style={{ color: C.textGray }}>{a}</p>
      </div>
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
        borderTop: highlighted ? `3px solid ${C.yellow}` : undefined,
      }}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.yellow, color: C.dark }}>Beliebt</span>
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

/* ═══════════════════════════════════════════════
   MARKETING PAGE
   ═══════════════════════════════════════════════ */
export default function MarketingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

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

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12"
        style={{ height: 64, background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}` }}
        aria-label="Hauptnavigation"
      >
        <Link to="/" className="flex items-center gap-2 font-bold text-xl shrink-0" style={{ color: C.dark }}>
          <img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-7 w-auto" />
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
        {/* ─── HERO ─── */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-20" style={{ background: C.white }}>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-6" style={{ color: C.yellow }}>
              Das erste vollständige VD-Tool im DACH-Raum
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-[64px] font-bold leading-[1.1] max-w-4xl mx-auto mb-6" style={{ color: C.dark }}>
              Die nächste Betriebsprüfung kommt. Bist du vorbereitet?
            </h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-lg md:text-xl max-w-[600px] mx-auto mb-10 leading-relaxed" style={{ color: C.textGray }}>
              Ohne ordnungsgemäße Verfahrensdokumentation verlierst du die Beweiskraft deiner gesamten Buchführung. Mit GoBD-Suite bist du auf der sicheren Seite – in weniger als einer Stunde.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryBtn to="/test-starten">Jetzt kostenlos testen</PrimaryBtn>
              <SecondaryBtn onClick={() => document.getElementById('funktionen')?.scrollIntoView({ behavior: 'smooth' })}>
                Wie es funktioniert <ArrowDown size={16} />
              </SecondaryBtn>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-12 text-sm" style={{ color: C.textGray }}>
              {['GoBD-konform seit 2014', 'KI-gestützte Erstellung', 'Fertig in unter 60 Minuten', 'Automatisch versioniert'].map(t => (
                <span key={t} className="flex items-center gap-1.5"><Check size={14} style={{ color: C.green }} /> {t}</span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ─── SCHMERZ ─── */}
        <section style={{ background: C.bgLight }} className="py-20 md:py-24 px-6" aria-labelledby="pain-headline">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 id="pain-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>
                Was passiert ohne Verfahrensdokumentation?
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { Icon: AlertTriangle, title: 'Finanzamt verwirft deine Buchführung', text: 'Der Prüfer kann deine gesamte digitale Buchführung als nicht ordnungsgemäß einstufen – und einfach schätzen.' },
                { Icon: Euro, title: 'Nachzahlungen die dein Business gefährden', text: 'Steuerliche Schätzungen liegen fast immer über deinen tatsächlichen Einnahmen. Das tut weh.' },
                { Icon: Clock, title: 'Stundenlanger Stress statt 5 Minuten vorlegen', text: 'Wer vorbereitet ist, übergibt ein Dokument und geht. Wer es nicht ist, erklärt sich stundenlang.' },
              ].map((c, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <article className="rounded-[18px] p-8 h-full" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
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

        {/* ─── LÖSUNG ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="solution-headline">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: C.yellow }}>Die Lösung</p>
                <h2 id="solution-headline" className="text-3xl md:text-[44px] lg:text-[52px] font-bold leading-[1.1] mb-6 break-words hyphens-auto" lang="de" style={{ color: C.dark }}>
                  Deine Verfahrens&shy;dokumentation. Fertig. Rechtssicher. In deiner Sprache.
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
              <div className="rounded-2xl flex items-center justify-center aspect-[4/3]" style={{ background: '#E8E8ED', border: `1px solid ${C.border}` }}>
                <span className="text-lg font-medium" style={{ color: C.textGray }}>App Screenshot</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── WIE ES FUNKTIONIERT ─── */}
        <section id="funktionen" style={{ background: C.bgLight }} className="py-20 md:py-28 px-6" aria-labelledby="steps-headline">
          <div className="max-w-5xl mx-auto text-center">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: C.yellow }}>So einfach geht es</p>
              <h2 id="steps-headline" className="text-3xl md:text-[48px] font-bold leading-tight mb-16" style={{ color: C.dark }}>
                In drei Schritten zur fertigen Verfahrensdokumentation
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { num: '1', icon: FileText, title: 'Onboarding ausfüllen', text: 'Beantworte 7 kurze Fragen zu deinem Unternehmen. Das dauert 5 Minuten und steuert welche Kapitel für dich relevant sind.' },
                { num: '2', icon: Sparkles, title: 'Kapitel beschreiben', text: 'Beschreibe in deinen eigenen Worten wie du arbeitest. Kein Fachjargon, keine Paragraphen. Die KI prüft und vervollständigt.' },
                { num: '3', icon: Download, title: 'PDF herunterladen', text: 'Deine fertige, GoBD-konforme Verfahrensdokumentation als professionelles PDF. Bereit für die nächste Prüfung.' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div className="flex flex-col items-center">
                    <span className="text-[80px] font-bold leading-none mb-2" style={{ color: C.yellow, opacity: 0.3 }} aria-hidden="true">{s.num}</span>
                    <s.icon size={32} className="mb-4" style={{ color: C.dark }} aria-hidden="true" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{s.title}</h3>
                    <p className="leading-relaxed" style={{ color: C.textGray }}>{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FÜR WEN ─── */}
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
                  <a href="#preise" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200" style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}>Für Dienstleister</a>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section style={{ background: C.bgLight }} className="py-20 md:py-28 px-6" aria-labelledby="features-headline">
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
                  <article className="rounded-[18px] p-8 h-full" style={{ background: C.white, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                    <f.Icon size={28} className="mb-4" style={{ color: C.yellow }} aria-hidden="true" />
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{f.title}</h3>
                    <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{f.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }} aria-labelledby="faq-headline">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 id="faq-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Häufige Fragen</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <FaqItem q="Brauche ich das wirklich?" a="Ja. Die GoBD verpflichten seit 2014 alle Unternehmen die digital buchen zur Verfahrensdokumentation. Seit 2025 wird das aktiv bei Betriebsprüfungen geprüft. Wer keine hat, riskiert die Anerkennung seiner gesamten Buchführung." />
                <FaqItem q="Ist das nicht Aufgabe meines Steuerberaters?" a="Nein. Die Verfahrensdokumentation muss das Unternehmen selbst erstellen, weil sie deine internen Abläufe beschreibt. Dein Steuerberater kann beraten – erstellen musst du sie." />
                <FaqItem q="Das klingt kompliziert." a="GoBD-Suite macht genau das einfach. Du beantwortest Fragen in normaler Sprache. Die KI übernimmt die fachliche Aufbereitung. Die meisten Nutzer sind in unter einer Stunde fertig." />
                <FaqItem q="Was wenn sich mein Prozess ändert?" a="Einfach das entsprechende Kapitel aktualisieren. Alle Änderungen werden automatisch mit Datum, Versionsnummer und Änderungsgrund dokumentiert. So bist du immer auf dem neuesten Stand." />
                <FaqItem q="Kann ich das Tool 7 Tage kostenlos testen?" a="Ja. Du kannst GoBD-Suite 7 Tage lang kostenlos und ohne Kreditkarte testen. Du siehst die vollständige Struktur und kannst zwei Kapitel mit KI-Unterstützung ausprobieren." />
                <FaqItem q="Was ist der Unterschied zwischen Berater und Agentur?" a="Der Berater-Plan ist für bis zu 5 Mandanten und ohne Whitelabel. Der Agentur-Plan bietet unbegrenzte Mandanten und vollständiges Whitelabel – dein Logo und dein Brand im Tool und im PDF." />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── PREISE ─── */}
        <section id="preise" style={{ background: C.bgLight }} className="py-20 md:py-28 px-6" aria-labelledby="pricing-headline">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 id="pricing-headline" className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-16" style={{ color: C.dark }}>Transparent. Fair. Skalierbar.</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
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

        {/* ─── FINAL CTA ─── */}
        <section className="py-20 md:py-28 px-6 text-center" style={{ background: C.dark }}>
          <Reveal>
            <h2 className="text-3xl md:text-[52px] font-bold leading-[1.1] mb-6" style={{ color: C.white }}>
              Jede Woche ohne Verfahrensdokumentation ist ein Risiko.
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>Starte heute. Kostenlos. Ohne Kreditkarte.</p>
            <PrimaryBtn to="/test-starten">Jetzt 7 Tage kostenlos testen</PrimaryBtn>
          </Reveal>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 px-6" style={{ background: C.dark, color: 'rgba(255,255,255,0.7)' }}>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-8 mb-4 brightness-0 invert" width={32} height={32} loading="lazy" />
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
          © 2025 GoBD-Suite · Alle Rechte vorbehalten
        </div>
      </footer>
    </div>
  );
}
