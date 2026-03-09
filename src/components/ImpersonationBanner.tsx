import { useAuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ImpersonationBanner() {
  const { impersonation, stopImpersonation } = useAuthContext();
  const navigate = useNavigate();

  if (!impersonation.isImpersonating) return null;

  const handleStop = () => {
    stopImpersonation();
    navigate('/admin');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-accent px-4 py-2 text-accent-foreground shadow-md">
      <span className="text-sm font-medium">
        Impersonation aktiv: <strong>{impersonation.impersonatedTenantName}</strong>
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStop}
        className="h-7 gap-1 text-xs hover:bg-accent/80"
      >
        <X className="h-3 w-3" />
        Beenden
      </Button>
    </div>
  );
}
