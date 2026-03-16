import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantPlan } from '@/hooks/useTenantPlan';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, UserPlus, FileText, Mail, Palette, Globe, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel?: string;
  buttonRoute?: string;
}

const BASE_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Willkommen bei GoBD-Suite!',
    description: 'Mit GoBD-Suite erstellen Sie GoBD-konforme Verfahrensdokumentationen – einfach, digital und revisionssicher. Wir führen Sie in wenigen Schritten durch die wichtigsten Funktionen.',
  },
  {
    icon: UserPlus,
    title: 'Ersten Mandanten anlegen',
    description: 'Mandanten sind Ihre Kunden oder Unternehmen, für die Sie eine Verfahrensdokumentation erstellen. Legen Sie jetzt Ihren ersten Mandanten an.',
    buttonLabel: 'Mandant anlegen',
    buttonRoute: '/clients/new',
  },
  {
    icon: FileText,
    title: 'Verfahrensdokumentation starten',
    description: 'Nachdem Sie einen Mandanten angelegt haben, erstellen Sie ein Projekt und durchlaufen das Onboarding. Dort legen Sie die Kapitelstruktur fest und können Texte per KI generieren.',
  },
];

const BERATER_STEPS: Step[] = [
  {
    icon: Mail,
    title: 'System-E-Mails konfigurieren',
    description: 'Einladungsmails an Mandanten werden von noreply@gobd-suite.de versendet. Unter den E-Mail-Einstellungen können Sie eine Reply-To-Adresse hinterlegen, damit Antworten bei Ihnen ankommen.',
    buttonLabel: 'E-Mail-Einstellungen',
    buttonRoute: '/settings/email',
  },
];

const AGENTUR_STEPS: Step[] = [
  {
    icon: Palette,
    title: 'Whitelabel einrichten',
    description: 'Als Agentur können Sie GoBD-Suite unter Ihrer eigenen Marke betreiben – mit eigenem Logo, Farben und Firmennamen. Ihre Mandanten sehen nur Ihr Branding.',
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
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);

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

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    setOpen(false);
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

  const handleActionButton = (route: string) => {
    handleComplete();
    navigate(route);
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleComplete(); }}>
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
                  onClick={() => handleActionButton(current.buttonRoute!)}
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
