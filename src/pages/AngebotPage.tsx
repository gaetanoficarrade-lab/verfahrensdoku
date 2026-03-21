import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  AlertTriangle, Euro, FileX, Play, UserPlus, Sparkles, Download,
  Clock, TrendingUp, Globe, ShieldCheck, Cpu, BookOpen, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CookieBanner } from '@/components/CookieBanner';
import { useSEO } from '@/hooks/useSEO';
import landingLogo from '@/assets/landing-logo.png';

/* ── Colors (landing-specific, inline — no pollution of design system) ── */
const navy = '#0B1929';
const navyLight = '#132238';
const navyMid = '#0F1F33';
const teal = '#14B8A6';
const tealGlow = '#2DD4BF';
const slate = '#94A3B8';
const white = '#F8FAFC';

/* ── Animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Section({ children, className = '', dark = true, id }: { children: ReactNode; className?: string; dark?: boolean; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`px-4 sm:px-6 lg:px-8 ${className}`}
      style={{ background: dark ? navy : navyLight }}
    >
      <div className="mx-auto max-w-5xl">{children}</div>
    </motion.section>
  );
}

function MotionDiv({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <motion.div variants={fadeUp} className={className}>{children}</motion.div>;
}

const CTA_URL = '/test-starten';
const CTA_TEXT = 'Jetzt 7 Tage kostenlos testen';

function CtaButton({ large = false }: { large?: boolean }) {
  return (
    <Link to={CTA_URL}>
      <button
        className={`font-semibold rounded-lg transition-all duration-200 ${large ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-sm'}`}
        style={{ background: teal, color: navy, boxShadow: `0 0 24px ${teal}44` }}
        onMouseOver={e => { (e.target as HTMLElement).style.background = tealGlow; }}
        onMouseOut={e => { (e.target as HTMLElement).style.background = teal; }}
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
    <div style={{ background: navy, color: white, fontFamily: "'Inter', system-ui, sans-serif" }} className="min-h-screen">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 backdrop-blur-md" style={{ background: `${navy}E6` }}>
        <div className="mx-auto max-w-5xl flex items-center justify-between h-16">
          <Link to="/">
            <img src={landingLogo} alt="GoBD-Suite" className="h-8" />
          </Link>
          <CtaButton />
        </div>
      </nav>

      {/* ═══ BLOCK 1 – Hero ═══ */}
      <Section className="pt-32 pb-20 sm:pt-40 sm:pb-28" id="hero">
        <MotionDiv className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6" style={{ color: white }}>
            Du bist Buchhalter, Berater oder Consultant. Deine Kunden brauchen eine Verfahrensdokumentation.{' '}
            <span style={{ color: teal }}>Du hast kein skalierbares Tool dafür.</span>
          </h1>
          <p className="text-lg sm:text-xl mb-10" style={{ color: slate }}>
            Das kostet dich Aufträge, die du eigentlich schon hättest haben können.
          </p>
          <CtaButton large />
          <p className="mt-4 text-xs" style={{ color: slate }}>Keine Kreditkarte nötig</p>
        </MotionDiv>
      </Section>

      {/* ═══ BLOCK 2 – Der Konflikt ═══ */}
      <Section className="py-20 sm:py-28" dark={false} id="konflikt">
        <MotionDiv>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-center" style={{ color: white }}>
            Seit 2025 prüft das Finanzamt aktiv.{' '}
            <span style={{ color: teal }}>Die meisten Unternehmen sind nicht vorbereitet.</span>
          </h2>
          <p className="text-center max-w-3xl mx-auto mb-14" style={{ color: slate, lineHeight: 1.7 }}>
            Ohne ordnungsgemäße Verfahrensdokumentation drohen Bußgelder bis zu 25.000&nbsp;Euro, Hinzuschätzungen durch das Finanzamt und im schlimmsten Fall die Verwerfung der gesamten Buchführung. Deine Kunden wissen das nicht – oder sie hoffen, dass es niemand merkt. Eine VD manuell zu erstellen dauert 40&nbsp;Stunden, braucht tiefes Fachwissen und lässt sich kaum skalieren.
          </p>
        </MotionDiv>
        <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Euro, title: 'Bußgeld bis 25.000 €', text: 'Bei fehlender oder mangelhafter Verfahrensdokumentation drohen empfindliche Geldbußen.' },
            { icon: AlertTriangle, title: 'Hinzuschätzung', text: 'Das Finanzamt schätzt Umsätze und Gewinne – meist zu Ungunsten deines Kunden.' },
            { icon: FileX, title: 'Buchführungsverwerfung', text: 'Im schlimmsten Fall wird die gesamte Buchführung verworfen und neu geschätzt.' },
          ].map(({ icon: Icon, title, text }) => (
            <MotionDiv key={title}>
              <div className="rounded-xl p-6 h-full" style={{ background: navyMid, border: `1px solid ${teal}22` }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: `${teal}18` }}>
                  <Icon size={24} style={{ color: teal }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: white }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: slate }}>{text}</p>
              </div>
            </MotionDiv>
          ))}
        </motion.div>
      </Section>

      {/* ═══ BLOCK 3 – Der Mentor / Das Tool ═══ */}
      <Section className="py-20 sm:py-28" id="tool">
        <MotionDiv className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: white }}>
            GoBD-Suite gibt dir das <span style={{ color: teal }}>komplette Werkzeug.</span>
          </h2>
          <p className="text-lg" style={{ color: slate }}>
            Das einzige Tool im DACH-Raum für vollständige, prüfungssichere Verfahrensdokumentationen – in unter einer Stunde, unter deinem Brand.
          </p>
        </MotionDiv>
        <MotionDiv>
          <div
            className="rounded-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden"
            style={{ background: navyLight, border: `1px solid ${teal}22`, aspectRatio: '16/9', maxHeight: 440 }}
          >
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${teal}22`, border: `2px solid ${teal}` }}
              >
                <Play size={32} style={{ color: teal }} fill={teal} />
              </div>
              <p className="font-medium" style={{ color: slate }}>Demo ansehen – 4 Minuten</p>
            </div>
          </div>
        </MotionDiv>
        <MotionDiv className="text-center mt-10">
          <CtaButton large />
        </MotionDiv>
      </Section>

      {/* ═══ BLOCK 4 – So funktioniert es ═══ */}
      <Section className="py-20 sm:py-28" dark={false} id="schritte">
        <MotionDiv className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: white }}>
            In 3 Schritten zur fertigen <span style={{ color: teal }}>Verfahrensdokumentation</span>
          </h2>
        </MotionDiv>
        <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-8">
          {[
            { num: '01', icon: UserPlus, title: 'Kunden einladen', text: 'Kunden anlegen und per Link ins Portal einladen. Der Kunde beschreibt seine Prozesse selbst – keine Fachkenntnisse nötig.' },
            { num: '02', icon: Sparkles, title: 'KI erstellt Kapitel', text: 'Die KI erstellt automatisch alle relevanten Kapitel. Du prüfst, passt an, finalisierst.' },
            { num: '03', icon: Download, title: 'PDF exportieren', text: 'Ein Klick – professionelles PDF mit deinem Logo. Prüfungssicher, revisionssicher, sofort lieferbar.' },
          ].map(({ num, icon: Icon, title, text }) => (
            <MotionDiv key={num}>
              <div className="text-center">
                <span className="text-5xl font-black" style={{ color: `${teal}33` }}>{num}</span>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mt-2 mb-4" style={{ background: `${teal}18` }}>
                  <Icon size={26} style={{ color: teal }} />
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: white }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: slate }}>{text}</p>
              </div>
            </MotionDiv>
          ))}
        </motion.div>
      </Section>

      {/* ═══ BLOCK 5 – FAQ ═══ */}
      <Section className="py-20 sm:py-28" id="faq">
        <MotionDiv className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: white }}>
            Häufige Fragen
          </h2>
        </MotionDiv>
        <MotionDiv className="max-w-2xl mx-auto">
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
                className="rounded-xl px-6 border-0"
                style={{ background: navyLight, border: `1px solid ${teal}15` }}
              >
                <AccordionTrigger className="hover:no-underline py-5" style={{ color: white }}>
                  {q}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="pb-2 leading-relaxed" style={{ color: slate }}>{a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </MotionDiv>
      </Section>

      {/* ═══ BLOCK 6 – Trust ═══ */}
      <Section className="py-20 sm:py-28" dark={false} id="trust">
        <MotionDiv className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: white }}>
            Gebaut für den <span style={{ color: teal }}>DACH-Markt</span>
          </h2>
        </MotionDiv>
        <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-14">
          {[
            { icon: Globe, label: 'Gehostet in Deutschland' },
            { icon: ShieldCheck, label: 'DSGVO-konform' },
            { icon: BookOpen, label: '5 Hauptkapitel / 30 Unterkapitel' },
            { icon: Cpu, label: 'KI-gestützt mit GPT-4' },
          ].map(({ icon: Icon, label }) => (
            <MotionDiv key={label}>
              <div className="rounded-xl p-5 text-center h-full" style={{ background: navyMid, border: `1px solid ${teal}15` }}>
                <Icon size={28} className="mx-auto mb-3" style={{ color: teal }} />
                <p className="text-sm font-medium" style={{ color: white }}>{label}</p>
              </div>
            </MotionDiv>
          ))}
        </motion.div>
        <MotionDiv>
          <div className="rounded-xl p-8 text-center" style={{ background: navyMid, border: `1px dashed ${teal}33` }}>
            <p className="italic text-lg" style={{ color: slate }}>"Testimonial folgt"</p>
            <p className="text-sm mt-2" style={{ color: `${slate}88` }}>— Kundenstimme Platzhalter</p>
          </div>
        </MotionDiv>
      </Section>

      {/* ═══ BLOCK 7 – Transformation ═══ */}
      <Section className="py-20 sm:py-28" id="transformation">
        <MotionDiv className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl mx-auto" style={{ color: white }}>
            Stell dir vor, du kannst jedem neuen Kunden ab sofort sagen:{' '}
            <span style={{ color: teal }}>"Ich kümmere mich auch um deine Verfahrensdokumentation."</span>
          </h2>
          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: slate }}>
            Fertig in einer Woche. Prüfungssicher. Professionell. Unter deinem Logo. Während andere Berater noch in Word rumkopieren, lieferst du ein Dokument, das sich sehen lassen kann.
          </p>
        </MotionDiv>
        <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-6">
          {/* Ohne */}
          <MotionDiv>
            <div className="rounded-xl p-8 h-full" style={{ background: '#1E293B', border: '1px solid #334155' }}>
              <h3 className="font-bold text-lg mb-5" style={{ color: '#F87171' }}>Ohne GoBD-Suite</h3>
              <ul className="space-y-3">
                {['Manuelle Erstellung in Word', '40+ Stunden pro Dokument', 'Kein skalierbares Angebot möglich', 'Kein einheitliches Branding'].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm" style={{ color: slate }}>
                    <span style={{ color: '#F87171' }}>✕</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </MotionDiv>
          {/* Mit */}
          <MotionDiv>
            <div className="rounded-xl p-8 h-full" style={{ background: navyMid, border: `1px solid ${teal}33` }}>
              <h3 className="font-bold text-lg mb-5" style={{ color: teal }}>Mit GoBD-Suite</h3>
              <ul className="space-y-3">
                {['KI-gestützte Erstellung', 'Unter einer Stunde pro VD', 'Skalierbares Angebot für alle Kunden', 'Eigenes Logo & Branding'].map(t => (
                  <li key={t} className="flex items-start gap-3 text-sm" style={{ color: white }}>
                    <span style={{ color: teal }}>✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </MotionDiv>
        </motion.div>
      </Section>

      {/* ═══ BLOCK 8 – Pricing CTA ═══ */}
      <Section className="py-20 sm:py-28" dark={false} id="pricing">
        <MotionDiv className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: white }}>
            Teste GoBD-Suite <span style={{ color: teal }}>7 Tage kostenlos.</span>
          </h2>
          <p className="mt-4 text-lg" style={{ color: slate }}>
            Keine Kreditkarte. Kein Risiko. Einfach rein und selbst sehen, wie schnell eine VD fertig ist.
          </p>
        </MotionDiv>
        <MotionDiv className="flex justify-center">
          <div className="rounded-2xl p-8 sm:p-10 w-full max-w-md" style={{ background: navyMid, border: `2px solid ${teal}44` }}>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: teal }}>Berater-Plan</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-5xl font-black" style={{ color: white }}>399&nbsp;€</span>
              <span className="text-lg mb-1" style={{ color: slate }}>/Monat</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Bis zu 5 Kunden',
                'Kundenportal mit Self-Service',
                'Team-Funktionen',
                'KI-Texterstellung für alle Kapitel',
                'PDF-Export mit deinem Logo',
                'Mindestlaufzeit 3 Monate',
              ].map(t => (
                <li key={t} className="flex items-start gap-3 text-sm" style={{ color: white }}>
                  <span style={{ color: teal }}>✓</span> {t}
                </li>
              ))}
            </ul>
            <Link to={CTA_URL} className="block">
              <button
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200"
                style={{ background: teal, color: navy }}
                onMouseOver={e => { (e.target as HTMLElement).style.background = tealGlow; }}
                onMouseOut={e => { (e.target as HTMLElement).style.background = teal; }}
              >
                {CTA_TEXT}
              </button>
            </Link>
          </div>
        </MotionDiv>
      </Section>

      {/* ═══ BLOCK 9 – Footer CTA ═══ */}
      <Section className="py-16 sm:py-20" id="footer-cta">
        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Clock, text: 'Unter einer Stunde pro VD' },
            { icon: TrendingUp, text: 'Ab dem ersten Kunden rentabel' },
            { icon: Globe, text: 'Gehostet in Deutschland' },
          ].map(({ icon: Icon, text }) => (
            <MotionDiv key={text}>
              <div className="flex items-center gap-4 justify-center">
                <Icon size={24} style={{ color: teal }} />
                <span className="font-medium" style={{ color: white }}>{text}</span>
              </div>
            </MotionDiv>
          ))}
        </motion.div>
        <MotionDiv className="text-center mb-16">
          <CtaButton large />
        </MotionDiv>

        {/* Minimal footer */}
        <div className="border-t pt-8 text-center text-sm" style={{ borderColor: `${teal}15`, color: slate }}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/impressum" className="hover:underline" style={{ color: slate }}>Impressum</Link>
            <span>|</span>
            <Link to="/datenschutz" className="hover:underline" style={{ color: slate }}>Datenschutz</Link>
            <span>|</span>
            <span>© 2025 GoBD-Suite</span>
          </div>
        </div>
      </Section>

      <CookieBanner />
    </div>
  );
}
