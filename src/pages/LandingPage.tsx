import { useState, useRef } from 'react';
import { CookieSettingsButton } from '@/components/CookieBanner';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Zap,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  Lock,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CookieBanner } from '@/components/CookieBanner';
import landingLogo from '@/assets/landing-logo.png';
import productHero from '@/assets/product-hero.png';
import productPdf from '@/assets/product-pdf.png';
import productAi from '@/assets/product-ai.png';

/* ── Animation presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Data ── */
const painPoints = [
  {
    icon: AlertTriangle,
    stat: '25.000 €',
    title: 'Bußgelder bei Betriebsprüfungen',
    desc: 'Ohne ordnungsgemäße Verfahrensdokumentation riskierst du Hinzuschätzungen und empfindliche Strafen.',
  },
  {
    icon: Clock,
    stat: '40+ Std.',
    title: 'Manuelle Arbeit pro Doku',
    desc: 'Viele verbringen Wochen mit einer einzigen Verfahrensdokumentation. Das muss nicht sein.',
  },
  {
    icon: FileText,
    stat: '80%',
    title: 'Sind veraltet oder fehlerhaft',
    desc: 'Einmal erstellt, nie aktualisiert – und damit im Ernstfall wertlos bei der Prüfung.',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Fertige Doku in Minuten',
    desc: 'Beantworte wenige Fragen und erhalte eine vollständige, prüfungssichere Verfahrensdokumentation – mit KI-Unterstützung bei der Texterstellung.',
    metric: '90% weniger Zeitaufwand',
  },
  {
    icon: Shield,
    title: 'Immer GoBD-konform',
    desc: '30 Pflichtkapitel, automatische Vollständigkeitsprüfung und Precheck. Du lieferst ab – gobdsuite sichert ab.',
    metric: '100% Abdeckung',
  },
  {
    icon: Users,
    title: 'Zusammenarbeit leicht gemacht',
    desc: 'Kunden und Teammitglieder beantworten Fragen direkt im Portal. Keine E-Mail-Schleifen, kein Nachfragen.',
    metric: 'Zero Reibungsverlust',
  },
  {
    icon: FileText,
    title: 'Ein Klick. Fertige PDF.',
    desc: 'GoBD-konforme Verfahrensdokumentation als professionelle PDF – auf Knopfdruck, mit deinem Branding.',
    metric: 'Sofort einsatzbereit',
  },
  {
    icon: Lock,
    title: 'Revisionssicher versioniert',
    desc: 'Jede Änderung wird dokumentiert. Inline-Versionierung und Audit-Log für volle Nachvollziehbarkeit.',
    metric: 'Prüfungsfest',
  },
  {
    icon: Building2,
    title: 'White-Label für Dienstleister',
    desc: 'Eigenes Logo, eigene Farben – deine Kunden sehen nur deine Marke. Komplett anpassbar.',
    metric: 'Dein Tool, deine Marke',
  },
];

const steps = [
  {
    num: '01',
    title: 'Onboarding ausfüllen',
    desc: 'Beantworte wenige Fragen zu deinem Unternehmen oder Kunden – das System erkennt automatisch, welche Kapitel relevant sind.',
  },
  {
    num: '02',
    title: 'Inhalte erstellen lassen',
    desc: 'Auf Basis deiner Antworten werden professionelle, GoBD-konforme Kapitelinhalte generiert. Jedes Kapitel kannst du individuell anpassen.',
  },
  {
    num: '03',
    title: 'PDF exportieren',
    desc: 'Mit einem Klick wird die fertige Verfahrensdokumentation als PDF exportiert – bereit für die Betriebsprüfung.',
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => waitlistRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
    toast.success('Du bist auf der Liste! Wir melden uns bei dir.');
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased overflow-x-hidden selection:bg-[#e8a91a]/20">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={landingLogo} alt="gobdsuite" className="h-10 sm:h-12 object-contain" />
          <Button
            onClick={scrollToWaitlist}
            className="bg-[#1d1d1f] hover:bg-[#333] text-white rounded-full px-6 h-10 text-sm font-medium"
          >
            Auf die Warteliste
          </Button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-28 sm:pt-40 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6 sm:mb-8"
          >
            Verfahrensdokumentation.
            <br />
            <span className="text-[#e8a91a]">In Minuten statt Wochen.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-sm sm:text-base font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4"
          >
            Das erste vollumfängliche VD-Tool im DACH-Raum
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base sm:text-xl lg:text-2xl text-[#86868b] max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
          >
            gobdsuite erstellt GoBD-konforme Verfahrensdokumentationen –
            prüfungssicher, effizient und mit einem Klick als PDF.
            Für Steuerberater, Freelancer und alle, die ein Business führen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              onClick={scrollToWaitlist}
              className="bg-[#e8a91a] hover:bg-[#d49b15] text-white font-semibold rounded-full px-10 h-14 text-base shadow-lg shadow-[#e8a91a]/20"
            >
              Jetzt Platz sichern
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── HERO PRODUCT IMAGE ─── */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24 pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <img
            src={productHero}
            alt="gobdsuite Dashboard – Verfahrensdokumentation erstellen"
            className="w-full rounded-2xl shadow-2xl shadow-black/10 border border-[#e5e5e5]"
          />
        </motion.div>
      </section>

      {/* ─── STATS RIBBON ─── */}
      <section className="border-y border-[#e5e5e5] bg-[#fafafa]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '30', label: 'GoBD-Kapitel' },
              { value: '< 30 Min', label: 'pro Dokumentation' },
              { value: '100%', label: 'GoBD-konform' },
              { value: '0 €', label: 'Bußgeld-Risiko' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-2xl sm:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">{s.value}</div>
                <div className="text-sm text-[#86868b] uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-12 sm:mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              Das Problem
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Verfahrensdokumentation ist Pflicht.
              <br />
              <span className="text-[#86868b]">Aber niemand hat Zeit dafür.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-5">
            {painPoints.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="rounded-3xl bg-[#fafafa] border border-[#e5e5e5] p-10 hover:shadow-lg hover:shadow-black/5 transition-all duration-500"
              >
                <div className="text-4xl font-bold text-red-500 mb-4">{p.stat}</div>
                <h3 className="text-xl font-semibold mb-3">{p.title}</h3>
                <p className="text-[#86868b] leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HERO STATEMENT + AI IMAGE ─── */}
      <section className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp}>
              <p className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">Einzigartig im DACH-Raum</p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
                Die Software, die deine{' '}
                <span className="text-[#e8a91a]">Verfahrensdokumentation</span>{' '}
                revolutioniert.
              </h2>
              <p className="text-xl text-[#86868b] leading-relaxed">
                Für Steuerberater, Freelancer und alle Unternehmer, die keine Zeit mehr mit manueller Dokumentation verschwenden wollen.
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <img
                src={productAi}
                alt="KI-Textgenerierung in gobdsuite"
                className="w-full rounded-2xl shadow-xl shadow-black/5 border border-[#e5e5e5]"
              />
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              Die Lösung
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Alles was du brauchst.
              <br />
              <span className="text-[#86868b]">In einer Plattform.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="rounded-3xl border border-[#e5e5e5] p-10 sm:p-12 transition-all duration-500 hover:shadow-lg hover:shadow-black/5 group bg-[#fafafa]"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8a91a]/10 flex items-center justify-center shrink-0 group-hover:bg-[#e8a91a]/15 transition-colors">
                    <b.icon className="h-6 w-6 text-[#e8a91a]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#e8a91a] uppercase tracking-[0.15em] mb-2">{b.metric}</div>
                    <h3 className="text-2xl font-bold mb-3">{b.title}</h3>
                    <p className="text-[#86868b] leading-relaxed text-lg">{b.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS + PDF IMAGE ─── */}
      <section className="py-32 px-6 bg-[#fafafa]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              So funktioniert's
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Drei Schritte.
              <br />
              <span className="text-[#86868b]">Das war's.</span>
            </motion.h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection className="space-y-3">
              {steps.map((s) => (
                <motion.div
                  key={s.num}
                  variants={fadeUp}
                  className="flex gap-6 items-start rounded-2xl bg-white border border-[#e5e5e5] p-8 hover:shadow-md transition-all duration-500"
                >
                  <div className="text-5xl sm:text-6xl font-black text-[#e8a91a]/20 leading-none shrink-0">{s.num}</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                    <p className="text-[#86868b] leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatedSection>

            <AnimatedSection>
              <motion.div variants={fadeUp}>
                <img
                  src={productPdf}
                  alt="PDF-Export der Verfahrensdokumentation"
                  className="w-full rounded-2xl shadow-xl shadow-black/5 border border-[#e5e5e5]"
                />
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── PLANS TEASER ─── */}
      <section className="py-32 px-6">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
            Flexible Pläne
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Für jede Unternehmensgröße
            <br />
            <span className="text-[#86868b]">der passende Plan.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-[#86868b] leading-relaxed mb-10 max-w-xl mx-auto">
            Ob Freelancer, Steuerberater oder wachsendes Unternehmen – gobdsuite passt sich deinen Anforderungen an.
            Verschiedene Pläne, ein Ziel: maximale Effizienz bei der Verfahrensdokumentation.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            {['Solo', 'Berater', 'Agentur'].map((plan) => (
              <span
                key={plan}
                className="inline-flex items-center rounded-full border border-[#e5e5e5] bg-[#fafafa] px-6 py-3 text-sm font-medium text-[#1d1d1f]"
              >
                {plan}
              </span>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── URGENCY ─── */}
      <section className="py-32 px-6">
        <AnimatedSection>
          <motion.div
            variants={fadeUp}
            className="max-w-4xl mx-auto text-center relative rounded-[2rem] overflow-hidden bg-[#1d1d1f] text-white"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#e8a91a]/10 via-transparent to-[#e8a91a]/5 pointer-events-none" />

            <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                Die nächste Betriebsprüfung kommt.
                <br />
                <span className="text-[#e8a91a]">Bist du vorbereitet?</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                Ohne ordnungsgemäße Verfahrensdokumentation verlierst du die Beweiskraft deiner gesamten Buchführung.
                Mit gobdsuite bist du auf der sicheren Seite.
              </p>
              <Button
                onClick={scrollToWaitlist}
                className="bg-[#e8a91a] hover:bg-[#f5c842] text-black font-semibold rounded-full px-8 h-13 text-base shadow-[0_0_30px_rgba(232,169,26,0.3)] transition-all"
              >
                Jetzt Platz sichern
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── WAITLIST CTA ─── */}
      <section ref={waitlistRef} className="py-32 px-6 bg-[#fafafa]">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Sei unter den Ersten.
            </h2>
            <p className="text-[#86868b] mb-10 text-lg leading-relaxed">
              Trag dich jetzt auf die Warteliste ein und erhalte exklusiven Zugang,
              sobald gobdsuite startet – inklusive Early-Bird-Vorteil.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-green-50 border border-green-200 p-10"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">Du bist auf der Liste!</h3>
                <p className="text-green-700">Wir benachrichtigen dich, sobald es losgeht.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-full px-6 border-[#d2d2d7] bg-white text-base flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#e8a91a] hover:bg-[#d49b15] text-white font-semibold rounded-full h-13 px-8 text-base shrink-0"
                >
                  {loading ? 'Wird eingetragen...' : 'Eintragen'}
                </Button>
              </form>
            )}

            <p className="text-xs text-[#86868b] mt-6">
              Kein Spam. Keine Weitergabe. Jederzeit abbestellbar.
            </p>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 border-t border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <p>© {new Date().getFullYear()} gobdsuite. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap gap-6">
            <Link to="/datenschutz" className="hover:text-[#1d1d1f] transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-[#1d1d1f] transition-colors">Impressum</Link>
            <Link to="/agb" className="hover:text-[#1d1d1f] transition-colors">AGB</Link>
            <Link to="/avv" className="hover:text-[#1d1d1f] transition-colors">AVV</Link>
            <CookieSettingsButton />
          </div>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
