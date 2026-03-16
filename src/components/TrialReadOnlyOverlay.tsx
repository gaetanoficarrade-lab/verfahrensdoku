import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrialReadOnlyOverlayProps {
  children: React.ReactNode;
}

/**
 * Wraps page content with a visual overlay + pointer-events block during trial.
 * Users can see the content but cannot interact with form elements.
 */
export function TrialReadOnlyOverlay({ children }: TrialReadOnlyOverlayProps) {
  const { isTrialing } = useTrialRestrictions();
  const navigate = useNavigate();

  if (!isTrialing) return <>{children}</>;

  return (
    <div className="relative">
      {/* Banner */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            <strong className="text-foreground">Nur-Ansicht im Testmodus.</strong>{' '}
            Upgrade um Änderungen vorzunehmen.
          </span>
        </div>
        <Button size="sm" variant="default" onClick={() => navigate('/settings/billing')}>
          Freischalten
        </Button>
      </div>

      {/* Dimmed, non-interactive content */}
      <div className="pointer-events-none select-none opacity-60">
        {children}
      </div>
    </div>
  );
}
