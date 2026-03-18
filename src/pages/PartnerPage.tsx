import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { SalesChatWidget } from '@/components/SalesChatWidget';
import { CookieBanner, CookieSettingsButton } from '@/components/CookieBanner';
import MarketingNav from '@/components/MarketingNav';
import SocialProofNotification from '@/components/SocialProofNotification';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, Menu, XIcon,
  Scale, RefreshCw, Euro, Users, Check,
  ArrowRight, Calculator, Briefcase, Star,
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { useSEO } from '@/hooks/useSEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/* ─── Design tokens ─── */
const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF', bgLight: '#F5F5F7',
  green: '#34C759', textGray: '#6E6E73', border: '#E5E5E5',
} as const;

/* ─── Reveal ─── */
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

/* ─── Plan data for calculator ─── */
const PLANS = {
  solo: { label: 'Solo', price: 980, recurring: false, provision: 147 },
  berater: { label: 'Berater', priceMonthly: 399, priceYearly: 3990, provisionMonthly: 59.85, provisionYearly: 598.50 },
  agentur: { label: 'Agentur', priceMonthly: 799, priceYearly: 7990, provisionMonthly: 119.85, provisionYearly: 1198.50 },
} as const;

/* ─── Commission Calculator ─── */
function CommissionCalculator() {
  const [customers, setCustomers] = useState(5);
  const [plan, setPlan] = useState<'solo' | 'berater' | 'agentur'>('berater');

  const result = useMemo(() => {
    if (plan === 'solo') {
      const p = PLANS.solo;
      return {
        firstMonth: customers * p.provision,
        yearly: customers * p.provision,
        threeYears: customers * p.provision,
        label: `${customers} × ${p.provision.toFixed(2)}€ = ${(customers * p.provision).toFixed(2)}€ einmalig`,
      };
    }
    const p = PLANS[plan];
    const monthly = customers * p.provisionMonthly;
    return {
      firstMonth: monthly,
      yearly: monthly * 12,
      threeYears: monthly * 36,
      label: `${customers} × ${p.provisionMonthly.toFixed(2)}€/Monat`,
    };
  }, [customers, plan]);

  return (
    <div className="rounded-[18px] p-8 md:p-10 max-w-2xl mx-auto" style={glass}>
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-3" style={{ color: C.dark }}>
          Wie viele Kunden vermittelst du pro Monat?
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range" min={1} max={50} value={customers}
            onChange={e => setCustomers(Number(e.target.value))}
            className="flex-1 accent-[#FAC81E]"
          />
          <span className="text-2xl font-bold min-w-[3ch] text-right" style={{ color: C.dark }}>{customers}</span>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold mb-3" style={{ color: C.dark }}>Plan</label>
        <div className="flex gap-3 flex-wrap">
          {(['solo', 'berater', 'agentur'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)}
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: plan === p ? C.yellow : 'rgba(0,0,0,0.05)',
                color: C.dark,
                border: plan === p ? `2px solid ${C.yellow}` : '2px solid transparent',
              }}>
              {PLANS[p].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(250,200,30,0.1)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: C.textGray }}>Erster Monat</p>
          <p className="text-xl md:text-2xl font-bold" style={{ color: C.dark }}>
            {result.firstMonth.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </div>
        <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(250,200,30,0.15)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: C.textGray }}>Nach 12 Monaten</p>
          <p className="text-xl md:text-2xl font-bold" style={{ color: C.dark }}>
            {result.yearly.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </div>
        <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(250,200,30,0.2)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: C.textGray }}>Nach 3 Jahren</p>
          <p className="text-xl md:text-2xl font-bold" style={{ color: C.dark }}>
            {result.threeYears.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Application Form ─── */
function ApplicationForm() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', website: '',
    channel: '', audience: '', accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accepted || !form.firstName || !form.lastName || !form.email || !form.channel) {
      toast.error('Bitte fülle alle Pflichtfelder aus und akzeptiere die Partnerbedingungen.');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'info@gobd-suite.de',
          subject: `Neue Partner-Bewerbung: ${form.firstName} ${form.lastName}`,
          html: `
            <h2>Neue Partner-Bewerbung</h2>
            <p><strong>Name:</strong> ${form.firstName} ${form.lastName}</p>
            <p><strong>E-Mail:</strong> ${form.email}</p>
            <p><strong>Website/Profil:</strong> ${form.website || '–'}</p>
            <p><strong>Kanal:</strong> ${form.channel}</p>
            <p><strong>Zielgruppe:</strong> ${form.audience || '–'}</p>
          `,
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error('Fehler beim Senden. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[18px] p-10 text-center" style={glass}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(52,199,89,0.15)' }}>
          <Check size={32} style={{ color: C.green }} />
        </div>
        <h3 className="text-2xl font-bold mb-3" style={{ color: C.dark }}>Vielen Dank für deine Bewerbung!</h3>
        <p style={{ color: C.textGray }}>Wir melden uns innerhalb von 48 Stunden.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`,
    background: C.white, color: C.dark, fontSize: 15, outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[18px] p-8 md:p-10 max-w-2xl mx-auto" style={glass}>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>Vorname *</label>
          <input style={inputStyle} value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required maxLength={100} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>Nachname *</label>
          <input style={inputStyle} value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} required maxLength={100} />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>E-Mail-Adresse *</label>
        <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required maxLength={255} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>Website oder Social-Media-Profil</label>
        <input style={inputStyle} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} maxLength={255} placeholder="Optional" />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>Wie planst du GoBD-Suite zu empfehlen? *</label>
        <select style={{ ...inputStyle, appearance: 'auto' }} value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} required>
          <option value="">Bitte wählen</option>
          <option value="Website/Blog">Website/Blog</option>
          <option value="YouTube/Podcast">YouTube/Podcast</option>
          <option value="Social Media">Social Media</option>
          <option value="E-Mail-Newsletter">E-Mail-Newsletter</option>
          <option value="Direktvertrieb">Direktvertrieb</option>
          <option value="Steuerberatung/Buchhaltung">Steuerberatung/Buchhaltung</option>
          <option value="Sonstiges">Sonstiges</option>
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1.5" style={{ color: C.dark }}>Kurze Beschreibung deiner Zielgruppe</label>
        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.audience}
          onChange={e => setForm(f => ({ ...f, audience: e.target.value.slice(0, 300) }))} maxLength={300}
          placeholder="Max. 300 Zeichen" />
        <p className="text-xs mt-1" style={{ color: C.textGray }}>{form.audience.length}/300</p>
      </div>
      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input type="checkbox" checked={form.accepted} onChange={e => setForm(f => ({ ...f, accepted: e.target.checked }))}
          className="mt-1 w-4 h-4 accent-[#FAC81E]" />
        <span className="text-sm" style={{ color: C.dark }}>
          Ich habe die Partnerbedingungen gelesen und akzeptiere sie *
        </span>
      </label>
      <button type="submit" disabled={submitting}
        className="w-full font-semibold text-[15px] transition-all duration-200 disabled:opacity-60"
        style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '14px 24px' }}
        onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
        onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.transform = 'translateY(0)'; }}>
        {submitting ? 'Wird gesendet...' : 'Bewerbung absenden'}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════ */
export default function PartnerPage() {
  useSEO({
    title: 'Partner werden – GoBD-Suite Affiliate-Programm | 15% Provision – dauerhaft und unbegrenzt',
    description: 'Werde GoBD-Suite Partner und verdiene dauerhaft Provision auf jeden Kunden den du vermittelst. 15% Provision – monatlich, solange der Kunde zahlt. Nach oben keine Grenze.',
    canonical: 'https://gobd-suite.de/partner',
  });

  useEffect(() => {
    const id = 'partner-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes heroSlideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }`;
    document.head.appendChild(style);
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org", "@type": "WebPage",
    "name": "GoBD-Suite Affiliate-Partnerprogramm",
    "description": "Werde GoBD-Suite Partner und verdiene dauerhaft 15% Provision auf jeden vermittelten Kunden.",
    "url": "https://gobd-suite.de/partner",
  }), []);

  return (
    <div className="min-h-screen" style={{ background: C.white, color: C.dark }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />
      <SocialProofNotification />

      <main>
        {/* ─── 1. HERO ─── */}
        <section className="pt-32 md:pt-44 pb-20 md:pb-28 px-6 text-center" style={{ background: C.white }}>
          <div className="max-w-4xl mx-auto" style={{ animation: 'heroSlideUp 0.8s ease-out' }}>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'rgba(250,200,30,0.2)', color: C.dark }}>
              Affiliate-Programm
            </span>
            <h1 className="text-4xl md:text-[56px] font-bold leading-[1.08] tracking-tight mb-6" style={{ color: C.dark }}>
              Verdiene dauerhaft Geld mit{' '}
              <span style={{ color: C.yellow }}>GoBD-Suite</span> – solange dein Kunde zahlt.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: C.textGray }}>
              Empfiehl GoBD-Suite und erhalte 15% Provision auf jeden Kunden – monatlich oder jährlich. Solange der Kunde Kunde ist, verdienst du mit. Nach oben gibt es keine Grenze.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a href="https://affiliatespot.de/gobd-suite/register" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200"
                style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '14px 28px' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.boxShadow = '0 0 20px rgba(250,200,30,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Jetzt Partner werden <ArrowRight size={18} />
              </a>
              <a href="#wie-es-funktioniert"
                className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200"
                style={{ background: 'transparent', color: C.dark, borderRadius: 980, padding: '14px 28px', border: `2px solid ${C.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.dark; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}>
                Wie es funktioniert ↓
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { value: '15%', label: 'Provision auf alle Umsätze' },
                { value: 'Dauerhaft', label: 'Solange der Kunde zahlt' },
                { value: 'Unbegrenzt', label: 'Keine Deckelung nach oben' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold mb-1" style={{ color: C.yellow }}>{s.value}</p>
                  <p className="text-xs md:text-sm" style={{ color: C.textGray }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 2. WARUM GOBD-SUITE ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                Warum GoBD-Suite das perfekte Produkt zum Empfehlen ist
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Scale size={28} />, title: 'Gesetzliche Pflicht', desc: 'Jedes Unternehmen das digital bucht braucht eine Verfahrensdokumentation. Der Markt ist riesig – und kaum abgedeckt.' },
                { icon: <RefreshCw size={28} />, title: 'Recurring Revenue', desc: 'Deine Kunden zahlen monatlich oder jährlich. Du verdienst solange sie dabei bleiben – ohne weiteren Aufwand.' },
                { icon: <Euro size={28} />, title: 'Hohe Provisionen', desc: 'Bei einem Agentur-Kunden verdienst du 119,85€ pro Monat – dauerhaft. Je mehr Kunden du vermittelst, desto mehr verdienst du. Nach oben gibt es keine Grenze.' },
                { icon: <Users size={28} />, title: 'Riesige Zielgruppe', desc: 'Selbstständige, Freelancer, Steuerberater, Berater, Agenturen – jeder der digital bucht ist ein potenzieller Kunde.' },
              ].map((card, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="rounded-[18px] p-7 h-full" style={glass}>
                    <div className="mb-4" style={{ color: C.yellow }}>{card.icon}</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: C.dark }}>{card.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: C.textGray }}>{card.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.bgLight} to={C.white} />

        {/* ─── 3. PROVISION RECHNER ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                Was du verdienen kannst
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <CommissionCalculator />
            </Reveal>

            {/* Example cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-14">
              {[
                { title: 'Der Einsteiger', desc: '5 Solo-Kunden pro Monat', amount: '735€ einmalig', highlight: false },
                { title: 'Der Berater', desc: '3 Berater-Kunden pro Monat', amount: '179,55€/Monat dauerhaft\n= 2.154,60€/Jahr', highlight: true },
                { title: 'Der Profi', desc: '10 Agentur-Kunden', amount: '1.198,50€/Monat dauerhaft\n= 14.382€/Jahr', highlight: false },
              ].map((card, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="rounded-[18px] p-7 h-full text-center" style={{
                    ...(card.highlight ? {
                      ...glass, border: `2px solid ${C.yellow}`, background: 'rgba(250,200,30,0.06)',
                    } : glass),
                  }}>
                    {card.highlight && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                        style={{ background: C.yellow, color: C.dark }}>Beliebt</span>
                    )}
                    <h3 className="text-xl font-bold mb-2" style={{ color: C.dark }}>{card.title}</h3>
                    <p className="text-sm mb-4" style={{ color: C.textGray }}>{card.desc}</p>
                    <p className="text-lg font-bold whitespace-pre-line" style={{ color: C.dark }}>{card.amount}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <p className="text-center mt-8 text-sm" style={{ color: C.textGray }}>
                Und das wächst mit jedem weiteren Kunden.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 4. WIE ES FUNKTIONIERT ─── */}
        <section id="wie-es-funktioniert" className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                So einfach funktioniert es
              </h2>
            </Reveal>
            <div className="space-y-8">
              {[
                { step: '1', title: 'Partner werden', desc: 'Bewirb dich über das Formular. Wir prüfen deine Anfrage und schalten dich innerhalb von 48 Stunden frei.' },
                { step: '2', title: 'Deinen Link teilen', desc: 'Du registrierst dich im Affiliate-Portal und bekommst sofort deinen persönlichen Tracking-Link. Teile ihn wo du willst – auf deiner Website, in E-Mails, in sozialen Medien.' },
                { step: '3', title: 'Kunden gewinnen', desc: 'Jeder der über deinen Link kauft wird dir dauerhaft zugeordnet. Du siehst alle Klicks und Conversions in Echtzeit.' },
                { step: '4', title: 'Provision erhalten', desc: 'Deine Provision wird automatisch berechnet und monatlich ausgezahlt. Solange dein Kunde zahlt, verdienst du.' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                      style={{ background: C.yellow, color: C.dark }}>
                      {s.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: C.dark }}>{s.title}</h3>
                      <p className="leading-relaxed" style={{ color: C.textGray }}>{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.bgLight} to={C.white} />

        {/* ─── 5. FÜR WEN ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                Perfekt für dich wenn du...
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                '...Steuerberater oder Buchhalter bist und deinen Mandanten einen Mehrwert bieten willst',
                '...Unternehmensberater oder Consultant bist mit Zugang zu Selbstständigen',
                '...einen YouTube-Kanal oder Blog zu Finanzen, Steuern oder Business führst',
                '...in der GoHighLevel oder Marketing-Automation Community aktiv bist',
                '...ein Netzwerk aus Selbstständigen und Freelancern hast',
                '...nach einer skalierbaren Einnahmequelle ohne Produktentwicklung suchst',
              ].map((text, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="rounded-[18px] p-6 h-full flex items-start gap-3" style={glass}>
                    <Check size={20} className="flex-shrink-0 mt-0.5" style={{ color: C.green }} />
                    <p className="text-sm leading-relaxed" style={{ color: C.dark }}>{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 6. PROVISIONSÜBERSICHT ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                Deine Provision auf einen Blick
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded-[18px] overflow-hidden" style={glass}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr style={{ background: 'rgba(250,200,30,0.15)' }}>
                        <th className="px-6 py-4 font-semibold" style={{ color: C.dark }}>Plan</th>
                        <th className="px-6 py-4 font-semibold" style={{ color: C.dark }}>Preis</th>
                        <th className="px-6 py-4 font-semibold" style={{ color: C.dark }}>Deine Provision</th>
                        <th className="px-6 py-4 font-semibold" style={{ color: C.dark }}>Auszahlung</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Solo', '980€ einmalig', '147€', 'Einmalig'],
                        ['Berater monatlich', '399€/Monat', '59,85€/Monat', 'Monatlich'],
                        ['Berater jährlich', '3.990€/Jahr', '598,50€/Jahr', 'Jährlich'],
                        ['Agentur monatlich', '799€/Monat', '119,85€/Monat', 'Monatlich'],
                        ['Agentur jährlich', '7.990€/Jahr', '1.198,50€/Jahr', 'Jährlich'],
                      ].map((row, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                          {row.map((cell, j) => (
                            <td key={j} className="px-6 py-4" style={{ color: j === 2 ? C.dark : C.textGray, fontWeight: j === 2 ? 600 : 400 }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-center font-bold mt-8" style={{ color: C.dark }}>
                Die Provision läuft solange der Kunde GoBD-Suite nutzt – ohne Zeitlimit und ohne Deckelung nach oben.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.bgLight} to={C.white} />

        {/* ─── 7. FAQ ─── */}
        <section className="py-20 md:py-28 px-6" style={{ background: C.white }}>
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold text-center leading-tight mb-14" style={{ color: C.dark }}>
                Häufige Fragen zum Partnerprogramm
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <FaqItem q="Wie werde ich Partner?" a="Fülle das Bewerbungsformular aus. Wir prüfen deine Anfrage und melden uns innerhalb von 48 Stunden. Nach der Freischaltung bekommst du sofort deinen persönlichen Affiliate-Link." />
                <FaqItem q="Wie lange läuft meine Provision?" a="Dauerhaft – solange dein vermittelter Kunde GoBD-Suite nutzt und zahlt. Es gibt kein Zeitlimit und keine Deckelung nach oben." />
                <FaqItem q="Wann und wie werde ich ausgezahlt?" a="Die Auszahlung erfolgt monatlich auf dein hinterlegtes Konto. Alle Conversions und Provisionen siehst du jederzeit in deinem Affiliate-Dashboard." />
                <FaqItem q="Was passiert wenn ein Kunde kündigt?" a="Wenn ein Kunde sein Abonnement beendet, endet auch die Provision für diesen Kunden. Für alle anderen aktiven Kunden läuft sie weiter." />
                <FaqItem q="Gibt es eine Mindestprovision für die Auszahlung?" a="Die Mindestauszahlung beträgt 50€. Kleinere Beträge werden auf den nächsten Monat übertragen." />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.white} to={C.bgLight} />

        {/* ─── 8. REGISTRIERUNG ─── */}
        <section id="bewerben" className="py-20 md:py-28 px-6" style={{ background: C.bgLight }}>
          <div className="max-w-4xl mx-auto text-center">
            <Reveal>
              <h2 className="text-3xl md:text-[48px] font-bold leading-tight mb-4" style={{ color: C.dark }}>
                Jetzt Partner werden
              </h2>
              <p className="text-lg mb-10" style={{ color: C.textGray }}>
                Registriere dich kostenlos im Affiliate-Portal und starte sofort. Keine Wartezeit, keine Genehmigung nötig.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col items-center gap-6">
                <a href="https://affiliatespot.de/gaetano/register" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-200"
                  style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '18px 40px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.boxShadow = '0 0 20px rgba(250,200,30,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  Jetzt als Partner registrieren <ArrowRight size={20} />
                </a>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  {['Kostenlos', 'Keine Verpflichtung', 'Sofortige Freischaltung'].map((text, i) => (
                    <span key={i} className="inline-flex items-center gap-2 text-sm" style={{ color: C.textGray }}>
                      <Check size={16} style={{ color: C.green }} /> {text}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── 9. FINALER CTA ─── */}
        <section className="py-20 md:py-28 px-6 text-center" style={{ background: C.dark }}>
          <Reveal>
            <h2 className="text-2xl md:text-[40px] font-bold leading-tight mb-4" style={{ color: C.white }}>
              Starte heute.<br />
              Deine Provision wächst mit jedem Kunden –{' '}
              <span style={{ color: C.yellow }}>ohne Deckelung, ohne Zeitlimit.</span>
            </h2>
            <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Werde Teil des GoBD-Suite Partnerprogramms und baue dir eine skalierbare Einnahmequelle auf.
            </p>
            <a href="https://affiliatespot.de/gaetano/register" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200"
              style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '14px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.yellow; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Jetzt Partner werden <ArrowRight size={18} />
            </a>
          </Reveal>
        </section>

        {/* ─── Wave ─── */}
        <WaveDivider from={C.dark} to={C.white} />
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
              <li><Link to="/partner" className="hover:text-white transition-colors">Partner werden</Link></li>
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
            <h4 className="font-semibold mb-4" style={{ color: C.white }}>Kontakt</h4>
            <p className="text-sm">info@gobd-suite.de</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          © {new Date().getFullYear()} GoBD-Suite · Alle Rechte vorbehalten
        </div>
      </footer>

      <CookieBanner />
      <SalesChatWidget />
    </div>
  );
}
