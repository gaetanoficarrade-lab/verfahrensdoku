import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  CheckCircle2,
  Lock,
  FileText,
  Users,
  FolderOpen,
  Sparkles,
  Rocket,
  Eye,
} from 'lucide-react';

const STORAGE_KEY = 'gobd_trial_onboarding_seen';

const availableFeatures = [
  { icon: FolderOpen, text: 'Beispiel-Mandant „Muster GmbH" erkunden' },
  { icon: FileText, text: 'Bis zu 2 Kapitel bearbeiten & testen' },
  { icon: Sparkles, text: 'KI-Textgenerierung ausprobieren' },
  { icon: Eye, text: 'PDF-Vorschau ansehen (mit Wasserzeichen)' },
];

const lockedFeatures = [
  { icon: Users, text: 'Eigene Mandanten anlegen & einladen' },
  { icon: FileText, text: 'Alle Kapitel bearbeiten & freigeben' },
  { text: 'PDF ohne Wasserzeichen exportieren' },
  { text: 'Branding, Team, Webhooks & Vorlagen' },
  { text: 'E-Mail-Vorlagen & Aktivitäts-Log' },
];

export function TrialOnboardingGuide() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isTrialing, daysLeft } = useTrialRestrictions();
  const { roles, isSuperAdmin } = useAuthContext();

  const isTenantUser = roles.includes('tenant_admin') || roles.includes('tenant_user');

  useEffect(() => {
    if (!isTenantUser || isSuperAdmin || !isTrialing) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, [isTenantUser, isSuperAdmin, isTrialing]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleUpgrade = () => {
    handleClose();
    navigate('/settings/billing');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Rocket className="h-5 w-5 text-primary" />
            Willkommen im Testmodus!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Sie haben <strong>{daysLeft} Tag{daysLeft !== 1 ? 'e' : ''}</strong> um die GoBD-Suite kennenzulernen.
            Erkunden Sie die wichtigsten Funktionen mit dem Beispiel-Mandanten.
          </p>

          {/* Available */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Jetzt verfügbar
            </h3>
            <ul className="space-y-1.5 ml-1">
              {availableFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  {f.icon && <f.icon className="h-3.5 w-3.5 text-primary shrink-0" />}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Locked */}
          <div className="space-y-2 rounded-lg bg-muted/50 p-3 border border-border">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Nach dem Upgrade freigeschaltet
            </h3>
            <ul className="space-y-1.5 ml-1">
              {lockedFeatures.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {f.icon ? <f.icon className="h-3.5 w-3.5 shrink-0" /> : <Lock className="h-3 w-3 shrink-0" />}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Sie können alle Menüpunkte und Einstellungen ansehen – Änderungen sind aber erst nach dem Upgrade möglich.
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleClose}>Los geht's</Button>
          <Button onClick={handleUpgrade}>
            Jetzt freischalten
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function resetTrialOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}
