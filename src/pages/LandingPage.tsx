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
  ChevronRight,
  Star,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import sidebarLogo from '@/assets/sidebar-logo.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
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

const painPoints = [
  {
    icon: AlertTriangle,
    title: 'Bußgelder bis zu 25.000 €',
    desc: 'Fehlende oder mangelhafte Verfahrensdokumentation kann bei Betriebsprüfungen teuer werden.',
  },
  {
    icon: Clock,
    title: '40+ Stunden manuelle Arbeit',
    desc: 'Steuerberater verbringen Wochen mit der Erstellung einer einzigen Verfahrensdokumentation.',
  },
  {
    icon: FileText,
    title: 'Veraltete Dokumente',
    desc: 'Einmal erstellt, nie aktualisiert – und damit im Ernstfall wertlos.',
  },
];

const benefits = [
  {
    icon: Bot,
    title: 'KI-gestützter Textgenerator',
    desc: 'Professionelle Verfahrensdokumentationen in Minuten statt Wochen. Die KI kennt alle GoBD-Anforderungen.',
    highlight: 'Zeitersparnis: bis zu 90%',
  },
  {
    icon: Shield,
    title: 'Immer GoBD-konform',
    desc: '30 Unterkapitel, die alle Pflichtanforderungen abdecken. KI-Precheck warnt vor Lücken, bevor es zur Prüfung kommt.',
    highlight: 'Maximale Sicherheit',
  },
  {
    icon: Users,
    title: 'Mandanten-Portal',
    desc: 'Mandanten beantworten Fragen direkt im Portal. Keine E-Mail-Schleifen, keine Missverständnisse.',
    highlight: 'Professioneller Workflow',
  },
  {
    icon: Zap,
    title: 'Ein Klick zur fertigen PDF',
    desc: 'GoBD-konforme Verfahrensdokumentation als professionelle PDF – auf Knopfdruck, inkl. Versionierung.',
    highlight: 'Sofort einsatzbereit',
  },
  {
    icon: Lock,
    title: 'Revisionssicher & versioniert',
    desc: 'Jede Änderung wird dokumentiert. Inline-Versionierung und Audit-Log für volle Nachvollziehbarkeit.',
    highlight: 'Prüfungsfest',
  },
  {
    icon: Building2,
    title: 'White-Label für Kanzleien',
    desc: 'Eigenes Branding, eigene Domain, eigenes Logo. Ihre Mandanten sehen nur Ihre Marke.',
    highlight: 'Ihr Tool, Ihre Marke',
  },
];

const socialProofStats = [
  { value: '30', label: 'GoBD-Unterkapitel' },
  { value: '< 30 Min', label: 'pro Dokumentation' },
  { value: '100%', label: 'GoBD-konform' },
  { value: '0 €', label: 'Bußgeld-Risiko' },
];

const plans = [
  { name: 'Solo', price: '980 €', period: 'einmalig', clients: '1 Mandant', best: false },
  { name: 'Berater', price: '399 €', period: '/ Monat', clients: '5 Mandanten', best: true },
  { name: 'Agentur', price: '799 €', period: '/ Monat', clients: 'Unbegrenzt', best: false },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);

  const scrollToWaitlist = () => {
    waitlistRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
    toast.success('Erfolgreich eingetragen! Wir melden uns bei Ihnen.');
  };

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] antialiased overflow-x-hidden">
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#d2d2d7]/40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <img src={sidebarLogo} alt="gobdsuite" className="h-8 object-contain" />
          <Button
            onClick={scrollToWaitlist}
            size="sm"
            className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full px-5 text-sm font-medium"
          >
            Auf die Warteliste
          </Button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8a91a]/10 px-4 py-1.5 text-sm font-medium text-[#b8860b] mb-8">
              <Star className="h-3.5 w-3.5" />
              Bald verfügbar – Sichern Sie sich Ihren Platz
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] mb-6"
          >
            Verfahrensdokumentation.
            <br />
            <span className="text-[#e8a91a]">In Minuten statt Wochen.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl sm:text-2xl text-[#6e6e73] max-w-2xl mx-auto mb-10 font-light leading-relaxed"
          >
            gobdsuite erstellt GoBD-konforme Verfahrensdokumentationen per KI – vollautomatisch, prüfungssicher 
            und mit einem Klick als PDF exportierbar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-[#e8a91a]/20"
            >
              Jetzt Platz sichern
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button
              onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-[#e8a91a] font-medium text-base flex items-center gap-1 hover:gap-2 transition-all"
            >
              Mehr erfahren <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF STATS ─── */}
      <section className="py-16 border-y border-[#d2d2d7]/40 bg-[#fbfbfd]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {socialProofStats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] mb-1">{s.value}</div>
                <div className="text-sm text-[#6e6e73]">{s.label}</div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-[#e8a91a] uppercase tracking-widest mb-3">
              Das Problem
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Verfahrensdokumentation ist Pflicht.
              <br />
              <span className="text-[#6e6e73]">Aber niemand hat Zeit dafür.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-6">
            {painPoints.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeUp}
                className="rounded-2xl bg-[#f5f5f7] p-8 hover:bg-[#efefef] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                  <p.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-[#6e6e73] text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section id="benefits" className="py-24 px-6 bg-[#fbfbfd]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-[#e8a91a] uppercase tracking-widest mb-3">
              Die Lösung
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Alles was Sie brauchen.
              <br />
              <span className="text-[#6e6e73]">In einer Plattform.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                className="group rounded-2xl bg-white p-8 border border-[#d2d2d7]/40 hover:border-[#e8a91a]/30 hover:shadow-lg hover:shadow-[#e8a91a]/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-[#e8a91a]/10 flex items-center justify-center mb-5 group-hover:bg-[#e8a91a]/15 transition-colors">
                  <b.icon className="h-5 w-5 text-[#e8a91a]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
                <p className="text-[#6e6e73] text-sm leading-relaxed mb-4">{b.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#e8a91a] bg-[#e8a91a]/8 rounded-full px-3 py-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {b.highlight}
                </span>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-[#e8a91a] uppercase tracking-widest mb-3">
              So funktioniert's
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight">
              In 3 Schritten zur fertigen
              <br />
              <span className="text-[#6e6e73]">Verfahrensdokumentation.</span>
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="space-y-8">
            {[
              { step: '01', title: 'Onboarding ausfüllen', desc: 'Beantworten Sie wenige Fragen zu Ihrem Mandanten – die KI erkennt automatisch, welche Kapitel relevant sind.' },
              { step: '02', title: 'KI generiert die Texte', desc: 'Auf Basis der Antworten erstellt die KI professionelle, GoBD-konforme Kapitelinhalte. Jedes Kapitel kann individuell angepasst werden.' },
              { step: '03', title: 'PDF exportieren', desc: 'Mit einem Klick wird die fertige Verfahrensdokumentation als professionelle PDF exportiert – bereit für die Betriebsprüfung.' },
            ].map((s) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                className="flex gap-6 items-start"
              >
                <div className="text-5xl font-bold text-[#e8a91a]/20 leading-none shrink-0 w-16">{s.step}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{s.title}</h3>
                  <p className="text-[#6e6e73] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── PRICING PREVIEW ─── */}
      <section className="py-24 px-6 bg-[#fbfbfd]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-medium text-[#e8a91a] uppercase tracking-widest mb-3">
              Faire Preise
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Für jeden die richtige Lösung.
            </motion.h2>
          </AnimatedSection>

          <AnimatedSection className="grid md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                className={`rounded-2xl p-8 text-center relative ${
                  p.best
                    ? 'bg-[#1d1d1f] text-white ring-2 ring-[#e8a91a]'
                    : 'bg-white border border-[#d2d2d7]/40'
                }`}
              >
                {p.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8a91a] text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Beliebteste Wahl
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-4">{p.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className={`text-sm ml-1 ${p.best ? 'text-white/60' : 'text-[#6e6e73]'}`}>{p.period}</span>
                </div>
                <p className={`text-sm mb-6 ${p.best ? 'text-white/60' : 'text-[#6e6e73]'}`}>{p.clients}</p>
                <Button
                  onClick={scrollToWaitlist}
                  variant={p.best ? 'default' : 'outline'}
                  className={`w-full rounded-full ${
                    p.best
                      ? 'bg-[#e8a91a] hover:bg-[#d49b15] text-white'
                      : 'border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]'
                  }`}
                >
                  Platz sichern
                </Button>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── URGENCY / SCARCITY ─── */}
      <section className="py-16 px-6">
        <AnimatedSection>
          <motion.div
            variants={fadeUp}
            className="max-w-3xl mx-auto text-center rounded-3xl bg-gradient-to-br from-[#1d1d1f] to-[#2d2d30] p-12 text-white"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
              Die nächste Betriebsprüfung kommt.
              <br />
              <span className="text-[#e8a91a]">Sind Sie vorbereitet?</span>
            </h2>
            <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
              Unternehmen ohne ordnungsgemäße Verfahrensdokumentation riskieren Hinzuschätzungen, 
              Bußgelder und den Verlust der Beweiskraft ihrer Buchführung. Mit gobdsuite sind Sie auf der sicheren Seite.
            </p>
            <Button
              onClick={scrollToWaitlist}
              size="lg"
              className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full px-8 h-12 text-base font-medium"
            >
              Jetzt auf die Warteliste
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── WAITLIST CTA ─── */}
      <section ref={waitlistRef} className="py-24 px-6 bg-[#fbfbfd]">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#e8a91a]/10 flex items-center justify-center mx-auto mb-6">
              <img src={sidebarLogo} alt="gobdsuite" className="h-8 object-contain" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
              Seien Sie unter den Ersten.
            </h2>
            <p className="text-[#6e6e73] mb-8 leading-relaxed">
              Tragen Sie sich jetzt auf die Warteliste ein und erhalten Sie exklusiven Zugang, 
              sobald gobdsuite verfügbar ist – inklusive Early-Bird-Vorteil.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-green-50 border border-green-200 p-8"
              >
                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-1">Sie sind auf der Liste!</h3>
                <p className="text-green-700 text-sm">Wir benachrichtigen Sie, sobald es losgeht.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-full px-5 border-[#d2d2d7] bg-white text-base flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full h-12 px-6 text-base font-medium shrink-0"
                >
                  {loading ? 'Wird eingetragen...' : 'Eintragen'}
                </Button>
              </form>
            )}

            <p className="text-xs text-[#86868b] mt-4">
              Kein Spam. Keine Weitergabe. Jederzeit abbestellbar.
            </p>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 border-t border-[#d2d2d7]/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#86868b]">
          <img src={sidebarLogo} alt="gobdsuite" className="h-6 object-contain opacity-60" />
          <p>© {new Date().getFullYear()} gobdsuite. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}