import { useState, useEffect, useMemo, type ReactNode } from 'react';
import SocialProofNotification from '@/components/SocialProofNotification';
import { Link } from 'react-router-dom';
import { CookieBanner, CookieSettingsButton } from '@/components/CookieBanner';
import MarketingNav from '@/components/MarketingNav';
import {
  Check, X, ChevronDown, ChevronUp, Menu, XIcon,
  Scale, Calendar, AlertTriangle, BookOpen, Cpu, Settings, ShieldCheck, FileText,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';

/* ─── Design tokens ─── */
const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF', bgLight: '#F5F5F7',
  green: '#34C759', red: '#FF3B30', textGray: '#6E6E73', border: '#E5E5E5',
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
export default function VerfahrensdokumentationErstellen() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = 'vd-lp-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes heroSlideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const howToSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "HowTo",
    "name": "Verfahrensdokumentation erstellen",
    "description": "So erstellst du eine GoBD-konforme Verfahrensdokumentation Schritt für Schritt",
    "totalTime": "PT60M",
    "step": [
      { "@type": "HowToStep", "name": "Registrieren und Onboarding", "text": "Registriere dich kostenlos und beantworte 7 kurze Fragen zu deinem Unternehmen." },
      { "@type": "HowToStep", "name": "Kapitel beschreiben", "text": "Beschreibe in eigenen Worten wie dein Business läuft. Die KI erstellt den GoBD-konformen Text." },
      { "@type": "HowToStep", "name": "PDF herunterladen", "text": "Lade deine fertige, GoBD-konforme Verfahrensdokumentation als PDF herunter." },
    ],
  }), []);

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Was muss in eine Verfahrensdokumentation?", "acceptedAnswer": { "@type": "Answer", "text": "Eine GoBD-konforme Verfahrensdokumentation muss alle relevanten Bereiche der digitalen Buchführung abdecken: Unternehmensbeschreibung, Organisation, IT-Systeme, Prozesse und internes Kontrollsystem." } },
      { "@type": "Question", "name": "Wer muss eine Verfahrensdokumentation erstellen?", "acceptedAnswer": { "@type": "Answer", "text": "Jedes Unternehmen das digital bucht ist seit 2014 zur Verfahrensdokumentation verpflichtet. Das gilt für GmbH, UG, Einzelunternehmer und Freelancer gleichermaßen." } },
      { "@type": "Question", "name": "Wie lange dauert die Erstellung einer Verfahrensdokumentation?", "acceptedAnswer": { "@type": "Answer", "text": "Mit GoBD-Suite sind die meisten Nutzer in 45 bis 90 Minuten fertig. Ohne Tool kann die manuelle Erstellung mehrere Tage dauern." } },
    ],
  }), []);

  useSEO({
    title: 'Verfahrensdokumentation erstellen 2025 – GoBD-konform, KI-gestützt | GoBD-Suite',
    description: 'Verfahrensdokumentation erstellen leicht gemacht: GoBD-Suite führt dich Schritt für Schritt durch alle 30 Kapitel. KI-gestützt, GoBD-konform, fertig in 60 Minuten.',
    canonical: 'https://gobd-suite.de/verfahrensdokumentation-erstellen',
    keywords: 'Verfahrensdokumentation erstellen, Verfahrensdokumentation GoBD, Verfahrensdokumentation Pflicht, GoBD-Suite',
    author: 'Gaetano Ficarra', robots: 'index, follow',
    ogTitle: 'Verfahrensdokumentation erstellen 2025 – So geht es richtig',
    ogDescription: 'GoBD-konforme Verfahrensdokumentation in 60 Minuten erstellen. KI-gestützt, alle 30 Kapitel, fertig als PDF.',
    ogType: 'website', ogLocale: 'de_DE', ogImage: 'https://gobd-suite.de/images/logo.png',
    jsonLd: [howToSchema, faqSchema],
  });

  const akkordeonItems = [
    { title: 'Allgemeine Beschreibung', text: 'Was macht dein Unternehmen? Wie entstehen Geschäftsvorgänge? Welche Dokumente entstehen dabei? Dieser Teil beschreibt dein Business aus buchhalterischer Sicht.', Icon: BookOpen },
    { title: 'Anwenderdokumentation', text: 'Wie ist deine Buchführung organisiert? Wer ist verantwortlich? Welche Software nutzt du? Wie werden Belege erfasst und verarbeitet?', Icon: FileText },
    { title: 'Technische Systemdokumentation', text: 'Welche IT-Systeme setzt du ein? Wie fließen Daten zwischen den Systemen? Wie machst du Backups? Wie ist der Datenzugriff geregelt?', Icon: Cpu },
    { title: 'Betriebsdokumentation', text: 'Wie läuft der tägliche Betrieb ab? Rechnungseingang, Rechnungsausgang, Zahlungsverkehr, Archivierung – alle Prozesse müssen beschrieben werden.', Icon: Settings },
    { title: 'Internes Kontrollsystem (IKS)', text: 'Wie stellst du sicher dass alles korrekt läuft? Welche Kontrollen gibt es? Wie werden Fehler erkannt und korrigiert?', Icon: ShieldCheck },
  ];

  const comparisonRows = [
    { feature: 'Zeitaufwand', manuell: '3–5 Tage', tool: '45–90 Minuten' },
    { feature: 'Fachkenntnisse nötig', manuell: 'Ja (GoBD-Kenntnisse)', tool: 'Nein' },
    { feature: 'Vollständigkeit', manuell: 'Unsicher', tool: 'Garantiert (30 Kapitel)' },
    { feature: 'Aktualisierung', manuell: 'Manuell, aufwendig', tool: 'Per Klick' },
    { feature: 'Versionierung', manuell: 'Selbst organisieren', tool: 'Automatisch' },
    { feature: 'Prüfungssicherheit', manuell: 'Abhängig von Kenntnissen', tool: 'GoBD-konform' },
    { feature: 'Kosten', manuell: 'Arbeitszeit + ggf. Berater', tool: 'Ab 980 € einmalig' },
  ];

  const steps = [
    { n: '01', title: 'Registrieren (2 Minuten)', text: 'Erstelle deinen kostenlosen Testzugang unter /test-starten. Keine Kreditkarte nötig. Du hast sofort Zugang zum Tool.' },
    { n: '02', title: 'Onboarding ausfüllen (5 Minuten)', text: 'Beantworte 7 kurze Fragen zu deinem Unternehmen: Rechtsform, Branche, welche Software du nutzt, ob du Mitarbeiter hast und ähnliches. Das Tool weiß danach welche der 30 Kapitel für dich relevant sind – nicht relevante werden automatisch professionell ausgeschlossen.' },
    { n: '03', title: 'Hauptkapitel beschreiben (20–40 Minuten)', text: 'Für jedes relevante Kapitel siehst du gezielte Leitfragen. Du beantwortest sie in deinen eigenen Worten – wie du einem Freund erklärst wie dein Business läuft. Kein Juristendeutsch, kein Fachjargon.' },
    { n: '04', title: 'KI-Text generieren (automatisch)', text: 'Mit einem Klick wandelt die KI deine Beschreibung in einen professionellen, GoBD-konformen Fachtext um. Du kannst den Text bearbeiten und anpassen.' },
    { n: '05', title: 'Texte prüfen und anpassen (10–20 Minuten)', text: 'Lies die generierten Texte durch und prüfe ob sie deinen tatsächlichen Ablauf korrekt beschreiben. Passe an wo nötig. Du bist für die inhaltliche Richtigkeit verantwortlich.' },
    { n: '06', title: 'Dokument finalisieren', text: 'Wenn alle Kapitel ausgefüllt sind, finalisierst du das Dokument. Es bekommt eine Versionsnummer und ist revisionssicher archiviert.' },
    { n: '07', title: 'PDF herunterladen', text: 'Deine fertige Verfahrensdokumentation als professionelles PDF mit Deckblatt, Inhaltsverzeichnis und Änderungshistorie. Bereit für die nächste Betriebsprüfung.' },
  ];

  const mistakes = [
    { bad: 'Die Verfahrensdokumentation einmal erstellen und nie aktualisieren', good: 'Die Verfahrensdokumentation muss bei jeder wesentlichen Änderung aktualisiert werden. GoBD-Suite versioniert alle Änderungen automatisch.' },
    { bad: 'Zu allgemein und oberflächlich beschreiben', good: 'Ein sachkundiger Dritter muss deinen Ablauf nachvollziehen können. GoBD-Suite prüft die Vollständigkeit mit KI.' },
    { bad: 'Nur die Buchhaltungssoftware beschreiben', good: 'Alle relevanten Systeme müssen rein: Zahlungsanbieter, Cloud-Dienste, E-Mail-Archivierung, Backups.' },
    { bad: 'Keine Versionierung und Änderungshistorie', good: 'Jede Änderung muss dokumentiert werden. GoBD-Suite macht das automatisch bei jeder Speicherung.' },
    { bad: 'Die Verfahrensdokumentation dem Steuerberater überlassen', good: 'Der Steuerberater kennt deine internen Abläufe nicht. Die Verfahrensdokumentation muss das Unternehmen selbst erstellen.' },
  ];

  const faqs = [
    { q: 'Was ist eine Verfahrensdokumentation?', a: 'Eine Verfahrensdokumentation ist ein Dokument das beschreibt wie ein Unternehmen seine digitale Buchführung organisiert. Sie ist Bestandteil der GoBD und seit 2015 für alle Unternehmen Pflicht die digital buchen. Sie beschreibt Abläufe, Systeme, Verantwortlichkeiten und Kontrollmechanismen.' },
    { q: 'Wer muss eine Verfahrensdokumentation erstellen?', a: 'Jedes Unternehmen das digital bucht – unabhängig von Größe oder Rechtsform. Freelancer, Einzelunternehmer, GmbH, UG – alle sind gleichermaßen verpflichtet. Wer Buchhaltungssoftware, Zahlungsanbieter oder digitale Belege nutzt, braucht eine Verfahrensdokumentation.' },
    { q: 'Was passiert ohne Verfahrensdokumentation?', a: 'Bei einer Betriebsprüfung kann das Finanzamt die Buchführung als nicht ordnungsgemäß einstufen und die Beweiskraft verwerfen. Das bedeutet: Das Finanzamt schätzt deine Einnahmen – und Schätzungen liegen fast immer über den tatsächlichen Werten. Das Ergebnis sind Steuernachzahlungen.' },
    { q: 'Wie oft muss die Verfahrensdokumentation aktualisiert werden?', a: 'Bei jeder wesentlichen Änderung deiner IT-Systeme oder Geschäftsprozesse. Also zum Beispiel wenn du eine neue Software einführst, deinen Zahlungsanbieter wechselst oder Prozesse änderst. Eine jährliche Überprüfung ist empfehlenswert.' },
    { q: 'Muss der Steuerberater die Verfahrensdokumentation erstellen?', a: 'Nein – und er kann es auch gar nicht. Die Verfahrensdokumentation beschreibt deine internen Abläufe die nur du kennst. Dein Steuerberater weiß nicht wie du intern arbeitest. Du bist als Unternehmer verantwortlich für die Erstellung.' },
    { q: 'Wie lang muss eine Verfahrensdokumentation sein?', a: 'Es gibt keine Mindestlänge – aber sie muss vollständig sein. Ein sachkundiger Dritter muss anhand der Verfahrensdokumentation deine gesamten buchhalterischen Abläufe nachvollziehen können. GoBD-Suite-Dokumente umfassen typischerweise 20 bis 50 Seiten je nach Komplexität.' },
    { q: 'Wie lange muss die Verfahrensdokumentation aufbewahrt werden?', a: '10 Jahre – genauso wie alle anderen steuerrelevanten Unterlagen gemäß § 147 AO. GoBD-Suite archiviert alle Versionen revisionssicher und dauerhaft.' },
    { q: 'Kann ich eine Vorlage verwenden?', a: 'Vorlagen sind problematisch weil sie nicht auf dein spezifisches Business zugeschnitten sind. Das Finanzamt erkennt generische Vorlagen. GoBD-Suite erstellt kein generisches Dokument sondern eine individuelle Verfahrensdokumentation auf Basis deiner tatsächlichen Abläufe.' },
  ];

  return (
    <div className="font-sans" style={{ color: C.dark }}>
      <SocialProofNotification />
      <MarketingNav />

      <main>
        {/* ═══ 1. HERO ═══ */}
        <section className="min-h-[90vh] flex items-center justify-center px-6 lg:px-12 pt-24 pb-20 relative overflow-hidden text-center" style={{ background: C.white }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(250, 200, 30, 0.15), transparent)' }} />
          <div className="max-w-4xl mx-auto relative z-10" style={{ animation: 'heroSlideUp 0.8s ease-out both' }}>
            <Reveal>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: C.yellow, color: C.dark }}>
                Verfahrensdokumentation erstellen
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="text-4xl md:text-[52px] lg:text-[60px] font-bold leading-[1.08] tracking-tight mb-6" style={{ color: C.dark }}>
                Die komplette Anleitung zur <span style={{ background: 'rgba(250,200,30,0.2)', borderRadius: 4, padding: '0 6px' }}>GoBD-konformen</span> Verfahrensdokumentation – und wie du sie in 60 Minuten fertig hast
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-lg leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: C.textGray }}>
                Seit 2014 Pflicht, seit 2025 aktiv geprüft. Hier erfährst du was eine Verfahrensdokumentation ist, was reinmuss und wie du sie schnell und korrekt erstellst.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <PrimaryBtn to="/test-starten">Jetzt mit GoBD-Suite erstellen</PrimaryBtn>
                <a href="#was-ist-vd" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 hover:opacity-80" style={{ border: `1px solid ${C.dark}`, color: C.dark, borderRadius: 980, padding: '12px 24px', background: 'transparent' }}>Erst mehr erfahren ↓</a>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" style={{ color: C.dark }}>
                {['GoBD-konform nach aktuellem Stand 2025', 'Alle 30 Kapitel abgedeckt', 'KI-gestützte Erstellung', 'Fertig in unter 60 Minuten'].map(t => (
                  <span key={t} className="flex items-center gap-1.5"><Check size={14} style={{ color: C.green }} /> {t}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 2. WAS IST EINE VD ═══ */}
        <WaveDivider from={C.white} to={C.white} />
        <section id="was-ist-vd" className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold leading-tight mb-10" style={{ color: C.dark }}>Was ist eine Verfahrensdokumentation?</h2></Reveal>
            <Reveal delay={0.1}>
              <div className="text-left text-lg leading-relaxed space-y-4" style={{ color: C.textGray }}>
                <p>Eine Verfahrensdokumentation – auch VD oder Verfahrensbeschreibung genannt – ist ein Dokument das beschreibt wie ein Unternehmen seine digitale Buchführung organisiert und durchführt.</p>
                <p>Sie ist Bestandteil der GoBD (Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff) und seit 2014 für alle Unternehmen Pflicht die digital buchen.</p>
                <p>Das Finanzamt will damit sicherstellen dass deine digitale Buchführung nachvollziehbar, vollständig und unveränderbar ist.</p>
              </div>
            </Reveal>
          </div>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5 mt-14">
            {[
              { Icon: Scale, title: 'Rechtsgrundlage', text: 'GoBD, Randziffer 151 ff. In Kraft seit 01.01.2015, aktualisiert zum 01.01.2020' },
              { Icon: Calendar, title: 'Seit wann Pflicht?', text: 'Seit 01.01.2015 für alle Unternehmen die DV-gestützte Buchführungssysteme nutzen' },
              { Icon: AlertTriangle, title: 'Was droht ohne VD?', text: 'Verwerfung der Buchführung, Schätzung durch das Finanzamt, Nachzahlungen' },
            ].map((b, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-[16px] p-6 text-center h-full" style={{ ...glass }}>
                  <div className="flex justify-center mb-3"><div className="h-10 w-10 flex items-center justify-center rounded-xl" style={{ background: 'rgba(250,200,30,0.12)' }}><b.Icon size={20} style={{ color: C.yellow }} /></div></div>
                  <h3 className="font-bold mb-2" style={{ color: C.dark }}>{b.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.textGray }}>{b.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══ 3. WER BRAUCHT EINE VD ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-6" style={{ color: C.dark }}>Wer braucht eine Verfahrensdokumentation?</h2></Reveal>
            <Reveal delay={0.1}>
              <div className="max-w-2xl mx-auto text-center mb-14">
                <p className="text-lg leading-relaxed mb-2" style={{ color: C.textGray }}>Kurze Antwort: <strong style={{ color: C.dark }}>Jeder der digital bucht.</strong></p>
                <p className="leading-relaxed" style={{ color: C.textGray }}>Die GoBD unterscheiden nicht nach Unternehmensgröße, Rechtsform oder Branche. Ob du ein großes Unternehmen führst oder als Freelancer alleine arbeitest – die Pflicht gilt für alle gleich.</p>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {['Einzelunternehmer & Freelancer', 'GmbH & UG', 'Selbstständige & Solopreneure', 'Personengesellschaften (GbR, OHG, KG)', 'Vereine mit wirtschaftlichem Geschäftsbetrieb', 'Alle die Buchhaltungssoftware nutzen'].map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="rounded-[16px] p-6 h-full flex items-start gap-3" style={{ ...glass }}>
                    <Check size={20} className="shrink-0 mt-0.5" style={{ color: C.green }} />
                    <p className="font-medium text-[15px]" style={{ color: C.dark }}>{t}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.5}>
              <p className="text-center font-semibold mt-10" style={{ color: C.dark }}>
                Wenn du Lexoffice, DATEV, sevDesk, Funnelpay, Stripe oder ähnliche Tools nutzt – brauchst du eine Verfahrensdokumentation.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══ 4. WAS MUSS REIN ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-4" style={{ color: C.dark }}>Was muss in eine Verfahrensdokumentation?</h2></Reveal>
            <Reveal delay={0.1}><p className="text-center text-lg mb-12 leading-relaxed" style={{ color: C.textGray }}>Die GoBD definieren fünf Hauptbereiche die eine vollständige Verfahrensdokumentation abdecken muss:</p></Reveal>
            <div className="space-y-0">
              {akkordeonItems.map((item, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <AkkordeonItem title={item.title} text={item.text} Icon={item.Icon} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.5}>
              <p className="text-center text-sm mt-10" style={{ color: C.textGray }}>GoBD-Suite deckt automatisch alle 30 Unterkapitel dieser fünf Bereiche ab – angepasst an dein individuelles Business.</p>
            </Reveal>
          </div>
        </section>

        {/* ═══ 5. MANUELL VS MIT TOOL ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Verfahrensdokumentation manuell erstellen oder mit Tool?</h2></Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[18px] overflow-hidden" style={{ background: C.white, boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: C.bgLight }}>
                      <th className="text-left px-6 py-4 font-semibold" style={{ color: C.dark }}></th>
                      <th className="text-center px-4 py-4 font-semibold" style={{ color: C.textGray }}>Manuell</th>
                      <th className="text-center px-4 py-4 font-semibold" style={{ color: C.dark, background: 'rgba(250,200,30,0.1)' }}>Mit GoBD-Suite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((r, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                        <td className="px-6 py-3.5 font-medium" style={{ color: C.dark }}>{r.feature}</td>
                        <td className="text-center px-4 py-3.5" style={{ color: C.textGray }}>{r.manuell}</td>
                        <td className="text-center px-4 py-3.5 font-medium" style={{ color: C.dark, background: 'rgba(250,200,30,0.04)' }}>{r.tool}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="text-center mt-10">
                <PrimaryBtn to="/test-starten">Jetzt mit GoBD-Suite erstellen</PrimaryBtn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 6. SCHRITT FÜR SCHRITT ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-4" style={{ color: C.dark }}>Verfahrensdokumentation erstellen: Schritt für Schritt</h2></Reveal>
            <Reveal delay={0.1}><p className="text-center text-lg mb-14 leading-relaxed" style={{ color: C.textGray }}>So erstellst du eine GoBD-konforme Verfahrensdokumentation mit GoBD-Suite:</p></Reveal>
            <div className="space-y-0">
              {steps.map((s, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="flex gap-6 relative">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl font-bold text-sm" style={{ background: 'rgba(250,200,30,0.12)', color: C.yellow }}>{s.n}</div>
                      {i < steps.length - 1 && <div className="w-px flex-1 my-2" style={{ background: C.border }} />}
                    </div>
                    <div className="pb-10">
                      <h3 className="text-lg font-bold mt-1 mb-2" style={{ color: C.dark }}>{s.title}</h3>
                      <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{s.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 7. HÄUFIGE FEHLER ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Die häufigsten Fehler bei der Verfahrensdokumentation</h2></Reveal>
            <div className="space-y-5">
              {mistakes.map((m, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="rounded-[16px] p-6" style={{ ...glass }}>
                    <div className="flex items-start gap-3 mb-3">
                      <X size={18} className="shrink-0 mt-0.5" style={{ color: C.red }} />
                      <p className="font-semibold" style={{ color: C.dark }}>{m.bad}</p>
                    </div>
                    <div className="flex items-start gap-3 ml-0 pl-0 sm:ml-7 sm:pl-0">
                      <Check size={18} className="shrink-0 mt-0.5" style={{ color: C.green }} />
                      <p className="text-[15px] leading-relaxed" style={{ color: C.textGray }}>{m.good}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 8. TOOL-VORSTELLUNG ═══ */}
        <WaveDivider from={C.bgLight} to={C.white} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-5xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-4" style={{ color: C.dark }}>GoBD-Suite: Das einfachste Tool zur Verfahrensdokumentation</h2></Reveal>
            <Reveal delay={0.1}><p className="text-center text-lg mb-14 leading-relaxed max-w-2xl mx-auto" style={{ color: C.textGray }}>Statt wochenlanger manueller Arbeit: GoBD-Suite führt dich durch alle 30 Kapitel und erstellt das fertige Dokument in deiner Sprache.</p></Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { title: 'KI versteht Alltagssprache', text: 'Beschreibe wie dein Business läuft – die KI erstellt den GoBD-konformen Text.' },
                { title: 'Automatisch auf dich zugeschnitten', text: 'Das Onboarding bestimmt welche Kapitel für dich relevant sind. Nicht relevante werden automatisch professionell ausgeschlossen.' },
                { title: 'Immer aktuell', text: 'Bei Änderungen einfach Kapitel aktualisieren. Alle Versionen bleiben erhalten und abrufbar.' },
                { title: 'Professionelles PDF', text: 'Mit Deckblatt, Inhaltsverzeichnis, Änderungshistorie und Versionsnummer. Bereit für die Betriebsprüfung.' },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="rounded-[16px] p-8 h-full" style={{ ...glass }}>
                    <h3 className="font-bold text-lg mb-3" style={{ color: C.dark }}>{f.title}</h3>
                    <p className="leading-relaxed text-[15px]" style={{ color: C.textGray }}>{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.5}>
              <div className="flex flex-wrap justify-center gap-3 mt-12">
                <PrimaryBtn to="/test-starten">Kostenlos testen</PrimaryBtn>
                <a href="/#preise" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200 hover:opacity-80" style={{ border: `1px solid ${C.dark}`, color: C.dark, borderRadius: 980, padding: '12px 24px', background: 'transparent' }}>Preise ansehen</a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══ 9. FAQ ═══ */}
        <WaveDivider from={C.white} to={C.bgLight} />
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-3xl mx-auto">
            <Reveal><h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>Häufige Fragen zur Verfahrensdokumentation</h2></Reveal>
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 0.04}><FaqItem q={f.q} a={f.a} /></Reveal>
            ))}
          </div>
        </section>

        {/* ═══ 10. FINALER CTA ═══ */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.dark }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal><h2 className="text-3xl md:text-[44px] font-bold leading-tight mb-4" style={{ color: C.white }}>Hör auf zu warten.<br className="hidden md:inline" /> Deine Verfahrensdokumentation kann heute fertig sein.</h2></Reveal>
            <Reveal delay={0.1}><p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>7 Tage kostenlos testen. Ohne Kreditkarte. Ohne Risiko.</p></Reveal>
            <Reveal delay={0.2}><PrimaryBtn to="/test-starten">Jetzt kostenlos starten</PrimaryBtn></Reveal>
            <Reveal delay={0.3}><p className="text-sm mt-6" style={{ color: 'rgba(255,255,255,0.6)' }}>Solo ab 980 € einmalig · Berater ab 399 €/Monat · Agentur ab 799 €/Monat</p></Reveal>
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
              <li><Link to="/fuer-dienstleister" className="hover:text-white transition-colors">Für Dienstleister</Link></li>
              <li><Link to="/verfahrensdokumentation-erstellen" className="hover:text-white transition-colors text-white font-semibold">VD erstellen – Anleitung</Link></li>
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

/* ─── Akkordeon component ─── */
function AkkordeonItem({ title, text, Icon }: { title: string; text: string; Icon: React.ComponentType<any> }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left font-semibold text-lg transition-colors gap-3" style={{ color: C.dark }}>
        <span className="flex items-center gap-3">
          <Icon size={20} style={{ color: C.yellow }} /> {title}
        </span>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 400 : 0, opacity: open ? 1 : 0 }}>
        <p className="pb-5 pl-9 leading-relaxed" style={{ color: C.textGray }}>{text}</p>
      </div>
    </div>
  );
}
