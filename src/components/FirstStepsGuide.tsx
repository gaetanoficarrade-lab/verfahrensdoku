import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, Send, FileText, CheckCircle2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const STEPS = [
  {
    icon: Users,
    title: 'Mandanten anlegen',
    description: 'Erstellen Sie Ihren ersten Mandanten unter "Mandanten → Neuer Mandant". Geben Sie Firmenname, Branche und Kontaktdaten an.',
  },
  {
    icon: Send,
    title: 'Mandanten einladen',
    description: 'Laden Sie Ihren Mandanten per E-Mail ein. Er erhält einen Link und kann seine Angaben direkt im Portal ausfüllen.',
  },
  {
    icon: FolderOpen,
    title: 'Projekt erstellen & Onboarding',
    description: 'Erstellen Sie ein Projekt (Verfahrensdokumentation 2024). Durchlaufen Sie das Onboarding um die Kapitelstruktur festzulegen.',
  },
  {
    icon: FileText,
    title: 'Kapitel bearbeiten & freigeben',
    description: 'Prüfen Sie die Mandantenangaben, generieren Sie professionelle Texte per KI und geben Sie die Kapitel frei. Am Ende erstellen Sie die Verfahrensdokumentation als PDF.',
  },
];

const STORAGE_KEY = 'gobd_first_steps_completed';

export function FirstStepsGuide() {
  const { roles, isSuperAdmin } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const isTenantAdmin = roles.includes('tenant_admin');

  useEffect(() => {
    if (!isTenantAdmin || isSuperAdmin) return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setOpen(true);
    }
  }, [isTenantAdmin, isSuperAdmin]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Erste Schritte ({step + 1}/{STEPS.length})
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{current.title}</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">{current.description}</p>
        </div>
        <div className="flex justify-center gap-1 mb-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={handleComplete}>Überspringen</Button>
          <Button onClick={handleNext}>
            {step < STEPS.length - 1 ? 'Weiter' : 'Fertig'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function resetFirstStepsGuide() {
  localStorage.removeItem('gobd_first_steps_completed');
}
