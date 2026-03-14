import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LEGAL_FORMS, ONBOARDING_SECTIONS, type OnboardingAnswers } from '@/lib/onboarding-variables';

interface Props {
  projectId: string;
  onboardingId: string;
  initialAnswers: OnboardingAnswers;
  onComplete: () => void;
}

type TriState = 'yes' | 'no' | 'unknown';

function YesNo({ value, onChange, label }: { value: boolean | undefined; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={value === true ? 'default' : 'outline'} onClick={() => onChange(true)}>Ja</Button>
        <Button type="button" size="sm" variant={value === false ? 'default' : 'outline'} onClick={() => onChange(false)}>Nein</Button>
      </div>
    </div>
  );
}

function TriSelect({ value, onChange, label }: { value: TriState | undefined; onChange: (v: TriState) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={value === 'yes' ? 'default' : 'outline'} onClick={() => onChange('yes')}>Ja</Button>
        <Button type="button" size="sm" variant={value === 'no' ? 'default' : 'outline'} onClick={() => onChange('no')}>Nein</Button>
        <Button type="button" size="sm" variant={value === 'unknown' ? 'default' : 'outline'} onClick={() => onChange('unknown')}>Weiß nicht</Button>
      </div>
    </div>
  );
}

export default function OnboardingWizard({ projectId, onboardingId, initialAnswers, onComplete }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [direction, setDirection] = useState(1);
  const [initialized, setInitialized] = useState(!!onboardingId);

  const totalSteps = ONBOARDING_SECTIONS.length;
  const storageKey = `onboarding-step-${projectId}`;

  // Restore step from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < totalSteps) {
        setStep(parsed);
      }
    }
  }, [storageKey, totalSteps]);

  // Persist step to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(storageKey, String(step));
  }, [step, storageKey]);

  // Auto-save when user switches away from tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveAnswers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [answers, projectId]);

  // Ensure a project_onboarding row exists on mount
  useEffect(() => {
    if (initialized) return;
    const ensureRow = async () => {
      const { error } = await supabase
        .from('project_onboarding')
        .upsert({ project_id: projectId, answers: initialAnswers as any }, { onConflict: 'project_id' });
      if (error) {
        console.error('Onboarding init error:', error);
        toast({ title: 'Initialisierung fehlgeschlagen', description: error.message, variant: 'destructive' });
      }
      setInitialized(true);
    };
    ensureRow();
  }, [initialized, projectId, initialAnswers, toast]);

  const set = useCallback(<K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveAnswers = useCallback(async (data?: OnboardingAnswers) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('project_onboarding')
        .upsert(
          { project_id: projectId, answers: (data ?? answers) as any },
          { onConflict: 'project_id' }
        );
      if (error) {
        console.error('Onboarding save error:', error);
        toast({ title: 'Speichern fehlgeschlagen', description: error.message, variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Speichern fehlgeschlagen', description: e?.message || 'Unbekannter Fehler', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, [answers, projectId, toast]);

  const goNext = async () => {
    await saveAnswers();
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const goPrev = async () => {
    await saveAnswers();
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const completeOnboarding = async () => {
    setCompleting(true);
    try {
      const { error } = await supabase
        .from('project_onboarding')
        .upsert(
          { project_id: projectId, answers: answers as any, completed_at: new Date().toISOString() },
          { onConflict: 'project_id' }
        );
      if (error) {
        toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Onboarding abgeschlossen', description: 'Die Kapitel sind jetzt verfügbar.' });
      onComplete();
    } catch (e: any) {
      toast({ title: 'Fehler', description: e?.message || 'Unbekannter Fehler', variant: 'destructive' });
    } finally {
      setCompleting(false);
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Unternehmensname</Label>
            <Input value={answers.company_name || ''} onChange={(e) => set('company_name', e.target.value)} placeholder="Muster GmbH" />
          </div>
          <div className="space-y-2">
            <Label>Rechtsform</Label>
            <Select value={answers.legal_form || ''} onValueChange={(v) => set('legal_form', v)}>
              <SelectTrigger><SelectValue placeholder="Rechtsform wählen" /></SelectTrigger>
              <SelectContent>
                {LEGAL_FORMS.map((lf) => <SelectItem key={lf} value={lf}>{lf}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Branche</Label>
            <Input value={answers.industry || ''} onChange={(e) => set('industry', e.target.value)} placeholder="z.B. IT-Dienstleistungen" />
          </div>
          <div className="space-y-2">
            <Label>Gründungsjahr</Label>
            <Input value={answers.founding_year || ''} onChange={(e) => set('founding_year', e.target.value)} placeholder="z.B. 2020" />
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          <YesNo label="Sind Mitarbeiter vorhanden?" value={answers.HAS_EMPLOYEES} onChange={(v) => set('HAS_EMPLOYEES', v)} />
          <YesNo label="Haben Sie einen Steuerberater?" value={answers.HAS_TAX_ADVISOR} onChange={(v) => set('HAS_TAX_ADVISOR', v)} />
          <div className="space-y-2">
            <Label>Ansprechpartner Buchhaltung</Label>
            <Input value={answers.ACCOUNTING_CONTACT || ''} onChange={(e) => set('ACCOUNTING_CONTACT', e.target.value)} placeholder="Name oder Abteilung" />
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Wer macht die Buchhaltung?</Label>
            <Select value={answers.BOOKKEEPING_BY || ''} onValueChange={(v) => set('BOOKKEEPING_BY', v as any)}>
              <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Selbst</SelectItem>
                <SelectItem value="tax_advisor">Steuerberater</SelectItem>
                <SelectItem value="shared">Geteilt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Wie werden Unterlagen übermittelt?</Label>
            <Textarea value={answers.document_transfer_method || ''} onChange={(e) => set('document_transfer_method', e.target.value)} placeholder="z.B. DATEV Unternehmen Online, E-Mail, Pendelordner..." />
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Wie werden Ausgangsrechnungen erstellt?</Label>
            <Textarea value={answers.INVOICE_CREATION_TYPE || ''} onChange={(e) => set('INVOICE_CREATION_TYPE', e.target.value)} placeholder="z.B. sevDesk, Word, lexoffice..." />
          </div>
          <YesNo label="Gibt es Bargeldeinnahmen?" value={answers.HAS_CASH} onChange={(v) => set('HAS_CASH', v)} />
          <YesNo label="Wird PayPal, Stripe oder Klarna genutzt?" value={answers.USES_PAYMENT_PROVIDER} onChange={(v) => set('USES_PAYMENT_PROVIDER', v)} />
          <YesNo label="Gibt es Marktplatzverkäufe (z.B. Amazon, eBay)?" value={answers.USES_MARKETPLACE} onChange={(v) => set('USES_MARKETPLACE', v)} />
          <TriSelect label="Werden E-Rechnungen (ZUGFeRD/XRechnung) genutzt?" value={answers.HAS_E_INVOICING as TriState} onChange={(v) => set('HAS_E_INVOICING', v)} />
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Welche Programme / Software werden genutzt?</Label>
            <Textarea value={answers.SOFTWARE_LIST || ''} onChange={(e) => set('SOFTWARE_LIST', e.target.value)} placeholder="z.B. DATEV, lexoffice, sevDesk, Microsoft 365..." />
          </div>
          <TriSelect label="Wird Cloud-Software eingesetzt?" value={answers.USES_CLOUD as TriState} onChange={(v) => set('USES_CLOUD', v)} />
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <YesNo label="Haben Sie ein separates Geschäftskonto?" value={answers.HAS_BUSINESS_ACCOUNT} onChange={(v) => set('HAS_BUSINESS_ACCOUNT', v)} />
          <YesNo label="Nutzen Sie Onlinebanking?" value={answers.USES_ONLINE_BANKING} onChange={(v) => set('USES_ONLINE_BANKING', v)} />
          <TriSelect label="Gibt es einen automatischen Bankdatenimport?" value={answers.HAS_AUTO_BANK_IMPORT as TriState} onChange={(v) => set('HAS_AUTO_BANK_IMPORT', v)} />
        </div>
      );
      case 6: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>In welchem Format liegen Belege vor?</Label>
            <Select value={answers.DOCUMENT_TYPE || ''} onValueChange={(v) => set('DOCUMENT_TYPE', v as any)}>
              <SelectTrigger><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="paper">Papier</SelectItem>
                <SelectItem value="mixed">Gemischt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <YesNo label="Ist ein Scanprozess vorhanden?" value={answers.HAS_SCAN_PROCESS} onChange={(v) => set('HAS_SCAN_PROCESS', v)} />
        </div>
      );
      default: return null;
    }
  };

  const section = ONBOARDING_SECTIONS[step];
  const isLast = step === totalSteps - 1;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Schritt {step + 1} von {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {ONBOARDING_SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
      </div>

      {/* Section card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStep()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={goPrev} disabled={step === 0 || saving}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
        </Button>

        {isLast ? (
          <Button onClick={completeOnboarding} disabled={completing}>
            {completing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Onboarding abschließen
          </Button>
        ) : (
          <Button onClick={goNext} disabled={saving}>
            Weiter <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {saving && <p className="text-xs text-muted-foreground text-center">Wird gespeichert…</p>}
    </div>
  );
}
