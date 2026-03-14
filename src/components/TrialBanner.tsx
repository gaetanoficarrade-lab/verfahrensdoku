import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';

export function TrialBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const { isTrialing, daysLeft, showBanner } = useTrialRestrictions();

  if (dismissed || !showBanner || !isTrialing || daysLeft === null) return null;

  return (
    <div className="bg-accent/20 border-b border-accent/30 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-accent-foreground" />
        <span className="text-accent-foreground font-medium">
          Testmodus aktiv – noch {daysLeft} Tag{daysLeft !== 1 ? 'e' : ''} |
        </span>
        <Button variant="link" className="h-auto p-0 text-sm font-semibold" onClick={() => navigate('/settings/billing')}>
          Jetzt freischalten
        </Button>
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
