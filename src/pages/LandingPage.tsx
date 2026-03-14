import { useState, useRef } from 'react';
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
  Bot,
  Lock,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import landingLogo from '@/assets/landing-logo.png';

/* ── Animation presets ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } },
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
    desc: 'Steuerberater verbringen Wochen mit einer einzigen Verfahrensdokumentation. Das muss nicht sein.',
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
    icon: Bot,
    title: 'KI schreibt deine Doku',
    desc: 'Professionelle Verfahrensdokumentationen in Minuten. Die KI kennt alle GoBD-Anforderungen und formuliert prüfungssichere Texte.',
    metric: '90% weniger Zeitaufwand',
  },
  {
    icon: Shield,
    title: 'Immer GoBD-konform',
    desc: '30 Pflichtkapitel, KI-Precheck, automatische Vollständigkeitsprüfung. Du lieferst ab – die KI sichert ab.',
    metric: '100% Abdeckung',
  },
  {
    icon: Users,
    title: 'Mandanten arbeiten mit',
    desc: 'Deine Mandanten beantworten Fragen direkt im Portal. Keine E-Mail-Schleifen, kein Nachfragen.',
    metric: 'Zero Reibungsverlust',
  },
  {
    icon: Zap,
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
    title: 'White-Label für Kanzleien',
    desc: 'Eigenes Logo, eigene Farben – deine Mandanten sehen nur deine Marke. Komplett anpassbar.',
    metric: 'Dein Tool, deine Marke',
  },
];

const steps = [
  {
    num: '01',
    title: 'Onboarding ausfüllen',
    desc: 'Beantworte wenige Fragen zu deinem Mandanten – die KI erkennt automatisch, welche Kapitel relevant sind.',
  },
  {
    num: '02',
    title: 'KI generiert die Texte',
    desc: 'Auf Basis der Antworten erstellt die KI professionelle, GoBD-konforme Kapitelinhalte. Jedes Kapitel kannst du individuell anpassen.',
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
    <div className="min-h-screen bg-[#000000] text-white antialiased overflow-x-hidden selection:bg-[#e8a91a]/30">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#000000]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between">
          <img src={landingLogo} alt="gobdsuite" className="h-7 object-contain" />
          <button
            onClick={scrollToWaitlist}
            className="text-sm font-medium text-[#e8a91a] hover:text-white transition-colors"
          >
            Warteliste →
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-12">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e8a91a]/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative z-10 text-center max-w-5xl"
        >
          <img src={landingLogo} alt="gobdsuite" className="h-12 sm:h-14 object-contain mx-auto mb-10" />

          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.02] mb-8">
            Verfahrensdokumentation.
            <br />
            <span className="bg-gradient-to-r from-[#e8a91a] to-[#f5c842] bg-clip-text text-transparent">
              In Minuten statt Wochen.
            </span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            gobdsuite erstellt GoBD-konforme Verfahrensdokumentationen per KI – 
            vollautomatisch, prüfungssicher und mit einem Klick als PDF.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={scrollToWaitlist}
              className="bg-[#e8a91a] hover:bg-[#f5c842] text-black font-semibold rounded-full px-8 h-13 text-base shadow-[0_0_30px_rgba(232,169,26,0.3)] hover:shadow-[0_0_40px_rgba(232,169,26,0.4)] transition-all"
            >
              Jetzt Platz sichern
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 z-10"
        >
          <ChevronDown className="h-6 w-6 text-white/20 animate-bounce" />
        </motion.div>
      </section>

      {/* ─── STATS RIBBON ─── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '30', label: 'GoBD-Kapitel' },
              { value: '< 30 Min', label: 'pro Dokumentation' },
              { value: '100%', label: 'GoBD-konform' },
              { value: '0 €', label: 'Bußgeld-Risiko' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2">{s.value}</div>
                <div className="text-sm text-white/40 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              Das Problem
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Verfahrensdokumentation ist Pflicht.
              <br />
              <span className="text-white/30">Aber niemand hat Zeit dafür.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-4">
            {painPoints.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="rounded-3xl bg-white/[0.03] border border-white/5 p-10 hover:bg-white/[0.05] transition-all duration-500 group"
              >
                <div className="text-4xl font-bold text-red-500/80 mb-4">{p.stat}</div>
                <h3 className="text-xl font-semibold mb-3 text-white/90">{p.title}</h3>
                <p className="text-white/40 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HERO STATEMENT ─── */}
      <section className="py-32 px-6">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
          >
            Die Software, die deine{' '}
            <span className="bg-gradient-to-r from-[#e8a91a] to-[#f5c842] bg-clip-text text-transparent">
              Verfahrensdokumentation
            </span>{' '}
            revolutioniert.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-white/40 mt-8 max-w-2xl mx-auto leading-relaxed">
            Für Steuerberater, Kanzleien und Unternehmen, die keine Zeit mehr mit manueller Dokumentation verschwenden wollen.
          </motion.p>
        </AnimatedSection>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              Die Lösung
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Alles was du brauchst.
              <br />
              <span className="text-white/30">In einer Plattform.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className={`rounded-3xl border border-white/5 p-10 sm:p-12 transition-all duration-500 hover:border-[#e8a91a]/20 group ${
                  i === 0 ? 'md:col-span-2 bg-gradient-to-br from-[#e8a91a]/10 to-transparent' : 'bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8a91a]/10 flex items-center justify-center shrink-0 group-hover:bg-[#e8a91a]/20 transition-colors">
                    <b.icon className="h-6 w-6 text-[#e8a91a]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#e8a91a] uppercase tracking-[0.15em] mb-2">{b.metric}</div>
                    <h3 className="text-2xl font-bold mb-3">{b.title}</h3>
                    <p className="text-white/40 leading-relaxed text-lg">{b.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
              So funktioniert's
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Drei Schritte.
              <br />
              <span className="text-white/30">Das war's.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="space-y-2">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                className="flex gap-8 items-start rounded-3xl bg-white/[0.02] border border-white/5 p-10 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="text-6xl sm:text-7xl font-black text-[#e8a91a]/15 leading-none shrink-0">{s.num}</div>
                <div className="pt-2">
                  <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                  <p className="text-white/40 text-lg leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PLANS TEASER ─── */}
      <section className="py-32 px-6 bg-white/[0.01]">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <motion.p variants={fadeUp} className="text-sm font-semibold text-[#e8a91a] uppercase tracking-[0.2em] mb-4">
            Flexible Pläne
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Für jede Kanzleigröße
            <br />
            <span className="text-white/30">der passende Plan.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/40 leading-relaxed mb-10 max-w-xl mx-auto">
            Ob Einzelkämpfer oder große Kanzlei – gobdsuite passt sich deinen Anforderungen an. 
            Verschiedene Pläne, ein Ziel: maximale Effizienz bei der Verfahrensdokumentation.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
            {['Solo', 'Berater', 'Agentur'].map((plan) => (
              <span
                key={plan}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/70"
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
            className="max-w-4xl mx-auto text-center relative rounded-[2rem] overflow-hidden"
          >
            {/* Glow background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#e8a91a]/15 via-transparent to-[#e8a91a]/5 pointer-events-none" />
            <div className="absolute inset-0 border border-[#e8a91a]/10 rounded-[2rem] pointer-events-none" />

            <div className="relative z-10 px-8 py-20 sm:px-16 sm:py-24">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                Die nächste Betriebsprüfung kommt.
                <br />
                <span className="bg-gradient-to-r from-[#e8a91a] to-[#f5c842] bg-clip-text text-transparent">
                  Bist du vorbereitet?
                </span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
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
      <section ref={waitlistRef} className="py-32 px-6">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-xl mx-auto text-center">
            <img src={landingLogo} alt="gobdsuite" className="h-10 object-contain mx-auto mb-8 opacity-60" />

            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Sei unter den Ersten.
            </h2>
            <p className="text-white/40 mb-10 text-lg leading-relaxed">
              Trag dich jetzt auf die Warteliste ein und erhalte exklusiven Zugang, 
              sobald gobdsuite startet – inklusive Early-Bird-Vorteil.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-[#e8a91a]/10 border border-[#e8a91a]/20 p-10"
              >
                <CheckCircle2 className="h-10 w-10 text-[#e8a91a] mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Du bist auf der Liste!</h3>
                <p className="text-white/50">Wir benachrichtigen dich, sobald es losgeht.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="deine@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-full px-6 border-white/10 bg-white/5 text-base text-white placeholder:text-white/30 flex-1 focus:border-[#e8a91a]/50 focus:ring-[#e8a91a]/20"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#e8a91a] hover:bg-[#f5c842] text-black font-semibold rounded-full h-13 px-8 text-base shrink-0 transition-all"
                >
                  {loading ? 'Wird eingetragen...' : 'Eintragen'}
                </Button>
              </form>
            )}

            <p className="text-xs text-white/20 mt-6">
              Kein Spam. Keine Weitergabe. Jederzeit abbestellbar.
            </p>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <img src={landingLogo} alt="gobdsuite" className="h-5 object-contain opacity-40" />
          <p>© {new Date().getFullYear()} gobdsuite. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
