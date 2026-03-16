import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantPlan } from '@/hooks/useTenantPlan';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UserPlus, FileText, Mail, Palette, Globe, ArrowRight, ArrowLeft, Rocket, Minimize2, Maximize2 } from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonRoute?: string;
  /** If set, the modal minimizes when action button is clicked and waits for this path pattern */
  waitForPattern?: RegExp;
  bannerLabel?: string;
}

const BASE_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Willkommen bei GoBD-Suite!',
    description: 'Mit GoBD-Suite erstellen Sie GoBD-konforme Verfahrensdokumentationen – einfach, digital und revisionssicher. Wir führen Sie in wenigen Schritten durch die wichtigsten Funktionen.',
  },
  {
    icon: UserPlus,
    title: 'Ersten Kunden anlegen',
    description: 'Kunden sind Ihre Auftraggeber, für die Sie eine Verfahrensdokumentation erstellen. Legen Sie jetzt Ihren ersten Kunden an.',
    buttonLabel: 'Kunde anlegen',
    buttonRoute: '/clients/new',
    waitForPattern: /^\/clients\/[0-9a-f-]{36}$/,
    bannerLabel: 'Kunde anlegen',
  },
  {
    icon: FileText,
    title: 'Verfahrensdokumentation starten',
    description: 'Nachdem Sie einen Kunden angelegt haben, erstellen Sie ein Projekt und durchlaufen das Onboarding. Dort legen Sie die Kapitelstruktur fest und können Texte per KI generieren.',
  },
];

const BERATER_STEPS: Step[] = [
  {
    icon: Mail,
    title: 'System-E-Mails konfigurieren',
    description: 'Einladungsmails an Kunden werden von noreply@gobd-suite.de versendet. Unter den E-Mail-Einstellungen können Sie eine Reply-To-Adresse hinterlegen, damit Antworten bei Ihnen ankommen.',
    buttonLabel: 'E-Mail-Einstellungen',
    buttonRoute: '/settings/email',
  },
];

const AGENTUR_STEPS: Step[] = [
  {
    icon: Palette,
    title: 'Whitelabel einrichten',
    description: 'Als Agentur können Sie GoBD-Suite unter Ihrer eigenen Marke betreiben – mit eigenem Logo, Farben und Firmennamen. Ihre Kunden sehen nur Ihr Branding.',
    buttonLabel: 'Branding einrichten',
    buttonRoute: '/settings/branding',
  },
  {
    icon: Globe,
    title: 'Eigene Absender-Domain',
    description: 'Versenden Sie alle E-Mails von Ihrer eigenen Domain statt von gobd-suite.de. So wirkt Ihre Kommunikation professionell und vertrauenswürdig.',
    buttonLabel: 'E-Mail-Einstellungen',
    buttonRoute: '/settings/email',
  },
];

export function FirstStepsGuide() {
  const { user, roles, isSuperAdmin } = useAuthContext();
  const { isBerater, isAgentur, loading: planLoading } = useTenantPlan();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  /** The pattern we're currently waiting for (null = not waiting) */
  const [waitingPattern, setWaitingPattern] = useState<RegExp | null>(null);

  const isTenantAdmin = roles.includes('tenant_admin');

  const steps = [
    ...BASE_STEPS,
    ...(isBerater ? BERATER_STEPS : []),
    ...(isAgentur ? AGENTUR_STEPS : []),
  ];

  useEffect(() => {
    if (!user || planLoading || checked) return;
    if (!isTenantAdmin || isSuperAdmin || roles.includes('client')) {
      setChecked(true);
      return;
    }

    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        setOpen(true);
      }
      setChecked(true);
    };
    checkOnboarding();
  }, [user, planLoading, checked, isTenantAdmin, isSuperAdmin, roles]);

  // Watch for URL changes that match the waiting pattern (e.g. client created → /clients/:id)
  useEffect(() => {
    if (!waitingPattern || !minimized) return;
    if (waitingPattern.test(location.pathname)) {
      // Pattern matched! Restore modal and advance to next step
      setWaitingPattern(null);
      setMinimized(false);
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }, [location.pathname, waitingPattern, minimized, steps.length]);

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    setOpen(false);
    setMinimized(false);
    setWaitingPattern(null);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleActionButton = (currentStep: Step) => {
    if (currentStep.waitForPattern && currentStep.buttonRoute) {
      // Minimize modal, navigate, wait for pattern
      setMinimized(true);
      setWaitingPattern(currentStep.waitForPattern);
      navigate(currentStep.buttonRoute);
    } else if (currentStep.buttonRoute) {
      // Legacy: just close and navigate
      handleComplete();
      navigate(currentStep.buttonRoute);
    }
  };

  const handleMaximize = () => {
    setMinimized(false);
  };

  const handleSkipAndClose = () => {
    setMinimized(false);
    setWaitingPattern(null);
    // Don't advance step, just restore modal
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  // Minimized banner
  if (minimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
            {/* Progress indicator */}
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Schritt {step + 1} von {steps.length}: {current.bannerLabel || current.title}
              </p>
              <div className="flex gap-1 mt-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleMaximize}
              title="Wizard öffnen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Full modal
  return (
    <Dialog open={true} onOpenChange={(v) => { if (!v) handleComplete(); }}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border bg-card">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-6 px-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center space-y-5"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {step === 0 && user?.user_metadata?.full_name
                    ? `Hallo ${user.user_metadata.full_name}!`
                    : current.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {current.description}
                </p>
              </div>

              {current.buttonRoute && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleActionButton(current)}
                >
                  {current.buttonLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 0}
              className={step === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>

            <Button onClick={handleNext} className="gap-2">
              {isLast ? (
                <>
                  Loslegen
                  <Rocket className="h-4 w-4" />
                </>
              ) : (
                <>
                  Weiter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function resetFirstStepsGuide() {
  // Legacy: kept for HelpPage compatibility
  // The new wizard uses DB field onboarding_completed
}
