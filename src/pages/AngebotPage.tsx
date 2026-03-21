import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle, Euro, FileX, Play, UserPlus, Sparkles, Download,
  Clock, TrendingUp, Globe, ShieldCheck, Cpu, BookOpen, Check, X,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CookieBanner } from '@/components/CookieBanner';
import { useSEO } from '@/hooks/useSEO';
import landingLogo from '@/assets/landing-logo.png';

/* ── Brand palette ── */
const gold = '#e8a91a';
const goldLight = '#f5c842';
const dark = '#1d1d1f';
const darkSoft = '#2d2d2f';
const warmGray = '#86868b';
const lightBg = '#faf9f6';
const white = '#ffffff';

/* ── Animation ── */
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.13 } } };

function Section({ children, className = '', variant = 'light', id }: { children: ReactNode; className?: string; variant?: 'light' | 'white' | 'dark'; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const bg = variant === 'dark' ? dark : variant === 'white' ? white : lightBg;
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`px-5 sm:px-8 lg:px-12 ${className}`}
      style={{ background: bg }}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

function M({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div variants={fadeUp} className={className}>{children}</motion.div>;
}

const CTA_URL = '/test-starten';
const CTA_TEXT = 'Jetzt 7 Tage kostenlos testen';

function CtaButton({ large = false }: { large?: boolean }) {
  return (
    <Link to={CTA_URL}>
      <button
        className={`font-semibold rounded-full transition-all duration-300 hover:shadow-lg ${large ? 'px-10 py-4 text-base sm:text-lg' : 'px-7 py-3 text-sm'}`}
        style={{
          background: gold,
          color: white,
          boxShadow: '0 4px 20px rgba(232,169,26,0.25)',
        }}
        onMouseOver={e => { (e.target as HTMLElement).style.background = goldLight; }}
        onMouseOut={e => { (e.target as HTMLElement).style.background = gold; }}
      >
        {CTA_TEXT}
      </button>
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════════ */

export default function AngebotPage() {
  useSEO({
    title: 'GoBD-Suite für Dienstleister – Verfahrensdokumentation als Service anbieten',
    description: 'Verfahrensdokumentation als Dienstleistung anbieten. KI-gestützt, GoBD-konform, White-Label-fähig. 7 Tage kostenlos testen.',
    canonical: 'https://gobd-suite.de/angebot/',
  });

  return (
    <div style={{ color: dark }} className="min-h-screen antialiased selection:bg-[#e8a91a]/20">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl border-b" style={{ background: `${white}E6`, borderColor: '#e5e5e5' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between h-16 px-5 sm:px-8 lg:px-12">
          <Link to="/">
            <img src={landingLogo} alt="GoBD-Suite" className="h-10 sm:h-12 object-contain" />
          </Link>
          <CtaButton />
        </div>
      </nav>

      {/* ═══ BLOCK 1 – Hero ═══ */}
      <Section className="pt-32 pb-20 sm:pt-44 sm:pb-32" variant="white" id="hero">
        <M className="max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-6" style={{ color: gold }}>
            Für Dienstleister & Berater
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-6" style={{ color: dark }}>
            Du bist Buchhalter, Berater oder Consultant. Deine Kunden brauchen eine Verfahrensdokumentation.{' '}
            <span style={{ color: gold }}>Du hast kein skalierbares Tool dafür.</span>
          </h1>
          <p className="text-lg sm:text-xl mb-10 leading-relaxed" style={{ color: warmGray }}>
            Das kostet dich Aufträge, die du eigentlich schon hättest haben können.
          </p>
          <CtaButton large />
          <p className="mt-4 text-xs font-medium" style={{ color: warmGray }}>Keine Kreditkarte nötig</p>
        </M>
      </Section>

      {/* ═══ BLOCK 2 – Der Konflikt ═══ */}
      <Section className="py-24 sm:py-32" variant="light" id="konflikt">
        <M>
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold mb-5 text-center leading-tight" style={{ color: dark }}>
            Seit 2025 prüft das Finanzamt aktiv.
          </h2>
          <p className="text-center text-lg sm:text-xl max-w-2xl mx-auto mb-16" style={{ color: warmGray, lineHeight: 1.7 }}>
            Ohne ordnungsgemäße Verfahrensdokumentation drohen Bußgelder bis zu 25.000&nbsp;Euro, Hinzuschätzungen durch das Finanzamt und im schlimmsten Fall die Verwerfung der gesamten Buchführung.
          </p>
        </M>
        <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Euro, title: 'Bußgeld bis 25.000 €', text: 'Bei fehlender oder mangelhafter Verfahrensdokumentation drohen empfindliche Geldbußen.' },
            { icon: AlertTriangle, title: 'Hinzuschätzung', text: 'Das Finanzamt schätzt Umsätze und Gewinne – meist zu Ungunsten deines Kunden.' },
            { icon: FileX, title: 'Buchführungsverwerfung', text: 'Im schlimmsten Fall wird die gesamte Buchführung verworfen und neu geschätzt.' },
          ].map(({ icon: Icon, title, text }) => (
            <M key={title}>
              <div className="rounded-2xl p-7 h-full bg-white border border-[#e5e5e5] hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${gold}15` }}>
                  <Icon size={22} style={{ color: gold }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: dark }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: warmGray }}>{text}</p>
              </div>
            </M>
          ))}
        </motion.div>
      </Section>

      {/* ═══ BLOCK 3 – Der Mentor ═══ */}
      <Section className="py-24 sm:py-32" variant="dark" id="tool">
        <M className="text-center mb-14 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold mb-5 leading-tight" style={{ color: white }}>
            GoBD-Suite gibt dir das{' '}
            <span style={{ color: gold }}>komplette Werkzeug.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a1a1a6' }}>
            Das einzige Tool im DACH-Raum für vollständige, prüfungssichere Verfahrensdokumentationen – in unter einer Stunde, unter deinem Brand.
          </p>
        </M>
        <M>
          <div className="max-w-4xl mx-auto">
            <div
              className="rounded-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden"
              style={{ background: darkSoft, border: '1px solid #3a3a3c', aspectRatio: '16/9', maxHeight: 440 }}
            >
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${gold}22`, border: `2px solid ${gold}` }}
                >
                  <Play size={32} style={{ color: gold }} fill={gold} />
                </div>
                <p className="font-medium" style={{ color: '#a1a1a6' }}>Demo ansehen – 4 Minuten</p>
              </div>
            </div>
          </div>
        </M>
        <M className="text-center mt-12">
          <CtaButton large />
        </M>
      </Section>

      {/* ═══ BLOCK 4 – So funktioniert es ═══ */}
      <Section className="py-24 sm:py-32" variant="white" id="schritte">
        <M className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight" style={{ color: dark }}>
            In 3 Schritten zur fertigen{' '}
            <span style={{ color: gold }}>Verfahrensdokumentation</span>
          </h2>
        </M>
        <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-10">
          {[
            { num: '01', icon: UserPlus, title: 'Kunden einladen', text: 'Kunden anlegen und per Link ins Portal einladen. Der Kunde beschreibt seine Prozesse selbst – keine Fachkenntnisse nötig.' },
            { num: '02', icon: Sparkles, title: 'KI erstellt Kapitel', text: 'Die KI erstellt automatisch alle relevanten Kapitel. Du prüfst, passt an, finalisierst.' },
            { num: '03', icon: Download, title: 'PDF exportieren', text: 'Ein Klick – professionelles PDF mit deinem Logo. Prüfungssicher, revisionssicher, sofort lieferbar.' },
          ].map(({ num, icon: Icon, title, text }) => (
            <M key={num}>
              <div className="text-center">
                <span className="text-6xl font-black tracking-tight" style={{ color: `${gold}25` }}>{num}</span>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mt-3 mb-5" style={{ background: `${gold}12` }}>
                  <Icon size={26} style={{ color: gold }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: dark }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: warmGray }}>{text}</p>
              </div>
            </M>
          ))}
        </motion.div>
      </Section>

      {/* ═══ BLOCK 5 – FAQ ═══ */}
      <Section className="py-24 sm:py-32" variant="light" id="faq">
        <M className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold" style={{ color: dark }}>
            Häufige Fragen
          </h2>
        </M>
        <M className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: 'Ich habe keine Ahnung von GoBD.', a: 'Das Tool führt dich durch jeden Schritt. Du brauchst kein Vorwissen – das System erkennt automatisch, welche Kapitel relevant sind.' },
              { q: 'Rechnet sich das wirklich?', a: 'Eine VD kostet deinen Kunden 800 bis 2.500 Euro. Du zahlst 399 Euro im Monat. Nach dem ersten Kunden bist du im Plus.' },
              { q: 'Was wenn sich Gesetze ändern?', a: 'Das Tool wird laufend aktualisiert. Du musst nichts selbst im Blick behalten.' },
              { q: 'Ich habe schon genug Tools.', a: 'GoBD-Suite ist kein zusätzlicher Aufwand – es ist eine neue Einnahmequelle, die sich in deinen bestehenden Workflow einfügt.' },
            ].map(({ q, a }, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl px-6 bg-white border border-[#e5e5e5] data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-5 font-medium" style={{ color: dark }}>
                  {q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="pb-3 leading-relaxed text-sm" style={{ color: warmGray }}>{a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </M>
      </Section>

      {/* ═══ BLOCK 6 – Trust ═══ */}
      <Section className="py-24 sm:py-32" variant="white" id="trust">
        <M className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold" style={{ color: dark }}>
            Gebaut für den <span style={{ color: gold }}>DACH-Markt</span>
          </h2>
        </M>
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-16">
          {[
            { icon: Globe, label: 'Gehostet in Deutschland' },
            { icon: ShieldCheck, label: 'DSGVO-konform' },
            { icon: BookOpen, label: '5 Hauptkapitel · 30 Unterkapitel' },
            { icon: Cpu, label: 'KI-gestützt mit GPT-4' },
          ].map(({ icon: Icon, label }) => (
            <M key={label}>
              <div className="rounded-2xl p-6 text-center h-full border border-[#e5e5e5] bg-[#faf9f6] hover:shadow-sm transition-shadow">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: `${gold}15` }}>
                  <Icon size={22} style={{ color: gold }} />
                </div>
                <p className="text-sm font-medium" style={{ color: dark }}>{label}</p>
              </div>
            </M>
          ))}
        </motion.div>
        <M>
          <div className="rounded-2xl p-10 text-center border border-dashed border-[#d1d1d6]" style={{ background: lightBg }}>
            <p className="italic text-lg" style={{ color: warmGray }}>"Testimonial folgt"</p>
            <p className="text-sm mt-2" style={{ color: '#c7c7cc' }}>— Kundenstimme Platzhalter</p>
          </div>
        </M>
      </Section>

      {/* ═══ BLOCK 7 – Transformation ═══ */}
      <Section className="py-24 sm:py-32" variant="dark" id="transformation">
        <M className="text-center mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight max-w-3xl mx-auto" style={{ color: white }}>
            Stell dir vor, du kannst jedem neuen Kunden ab sofort sagen:{' '}
            <span style={{ color: gold }}>"Ich kümmere mich auch um deine Verfahrensdokumentation."</span>
          </h2>
          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: '#a1a1a6' }}>
            Fertig in einer Woche. Prüfungssicher. Professionell. Unter deinem Logo.
          </p>
        </M>
        <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6">
          {/* Ohne */}
          <M>
            <div className="rounded-2xl p-8 h-full" style={{ background: '#2a2a2c', border: '1px solid #3a3a3c' }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: '#ff6b6b' }}>Ohne GoBD-Suite</h3>
              <ul className="space-y-4">
                {['Manuelle Erstellung in Word', '40+ Stunden pro Dokument', 'Kein skalierbares Angebot möglich', 'Kein einheitliches Branding'].map(t => (
                  <li key={t} className="flex items-center gap-3 text-sm" style={{ color: '#a1a1a6' }}>
                    <X size={16} style={{ color: '#ff6b6b' }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </M>
          {/* Mit */}
          <M>
            <div className="rounded-2xl p-8 h-full" style={{ background: '#2a2a2c', border: `1px solid ${gold}44` }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: gold }}>Mit GoBD-Suite</h3>
              <ul className="space-y-4">
                {['KI-gestützte Erstellung', 'Unter einer Stunde pro VD', 'Skalierbares Angebot für alle Kunden', 'Eigenes Logo & Branding'].map(t => (
                  <li key={t} className="flex items-center gap-3 text-sm" style={{ color: '#e5e5e5' }}>
                    <Check size={16} style={{ color: gold }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </M>
        </motion.div>
      </Section>

      {/* ═══ BLOCK 8 – Pricing CTA ═══ */}
      <Section className="py-24 sm:py-32" variant="white" id="pricing">
        <M className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold" style={{ color: dark }}>
            Teste GoBD-Suite{' '}
            <span style={{ color: gold }}>7 Tage kostenlos.</span>
          </h2>
          <p className="mt-5 text-lg" style={{ color: warmGray }}>
            Keine Kreditkarte. Kein Risiko. Einfach rein und selbst sehen, wie schnell eine VD fertig ist.
          </p>
        </M>
        <M className="flex justify-center">
          <div className="rounded-3xl p-9 sm:p-12 w-full max-w-md bg-[#faf9f6] border border-[#e5e5e5] shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-2" style={{ color: gold }}>Berater-Plan</p>
            <div className="flex items-end gap-1 mb-7">
              <span className="text-5xl font-black tracking-tight" style={{ color: dark }}>399&nbsp;€</span>
              <span className="text-lg mb-1 font-medium" style={{ color: warmGray }}>/Monat</span>
            </div>
            <ul className="space-y-3.5 mb-9">
              {[
                'Bis zu 5 Kunden',
                'Kundenportal mit Self-Service',
                'Team-Funktionen',
                'KI-Texterstellung für alle Kapitel',
                'PDF-Export mit deinem Logo',
                'Mindestlaufzeit 3 Monate',
              ].map(t => (
                <li key={t} className="flex items-center gap-3 text-sm" style={{ color: dark }}>
                  <Check size={16} style={{ color: gold }} /> {t}
                </li>
              ))}
            </ul>
            <Link to={CTA_URL} className="block">
              <button
                className="w-full py-4 rounded-full font-semibold text-base transition-all duration-300 hover:shadow-lg"
                style={{ background: gold, color: white, boxShadow: '0 4px 20px rgba(232,169,26,0.25)' }}
                onMouseOver={e => { (e.target as HTMLElement).style.background = goldLight; }}
                onMouseOut={e => { (e.target as HTMLElement).style.background = gold; }}
              >
                {CTA_TEXT}
              </button>
            </Link>
          </div>
        </M>
      </Section>

      {/* ═══ BLOCK 9 – Footer CTA ═══ */}
      <Section className="py-20 sm:py-24" variant="light" id="footer-cta">
        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14">
          {[
            { icon: Clock, text: 'Unter einer Stunde pro VD' },
            { icon: TrendingUp, text: 'Ab dem ersten Kunden rentabel' },
            { icon: Globe, text: 'Gehostet in Deutschland' },
          ].map(({ icon: Icon, text }) => (
            <M key={text}>
              <div className="flex items-center gap-4 justify-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${gold}15` }}>
                  <Icon size={20} style={{ color: gold }} />
                </div>
                <span className="font-medium text-sm" style={{ color: dark }}>{text}</span>
              </div>
            </M>
          ))}
        </motion.div>
        <M className="text-center mb-20">
          <CtaButton large />
        </M>

        {/* Minimal footer */}
        <div className="border-t pt-8 text-center text-sm" style={{ borderColor: '#e5e5e5', color: warmGray }}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/impressum" className="hover:underline" style={{ color: warmGray }}>Impressum</Link>
            <span>|</span>
            <Link to="/datenschutz" className="hover:underline" style={{ color: warmGray }}>Datenschutz</Link>
            <span>|</span>
            <span>© 2025 GoBD-Suite</span>
          </div>
        </div>
      </Section>

      <CookieBanner />
    </div>
  );
}
