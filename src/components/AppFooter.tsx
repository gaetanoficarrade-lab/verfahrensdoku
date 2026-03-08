import { useState } from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AppFooter() {
  const { data: settings } = useTenantSettings();
  const [openModal, setOpenModal] = useState<'imprint' | 'privacy' | null>(null);

  const hasImprint = settings?.imprint || settings?.imprint_url;
  const hasPrivacy = settings?.privacy_text || settings?.privacy_url;

  if (!hasImprint && !hasPrivacy) return null;

  const handleImprintClick = () => {
    if (settings?.imprint_url) {
      window.open(settings.imprint_url, '_blank', 'noopener');
    } else {
      setOpenModal('imprint');
    }
  };

  const handlePrivacyClick = () => {
    if (settings?.privacy_url) {
      window.open(settings.privacy_url, '_blank', 'noopener');
    } else {
      setOpenModal('privacy');
    }
  };

  return (
    <>
      <footer className="border-t border-border px-6 py-3 flex items-center gap-4 text-xs text-muted-foreground">
        {hasImprint && (
          <button
            onClick={handleImprintClick}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Impressum
          </button>
        )}
        {hasPrivacy && (
          <button
            onClick={handlePrivacyClick}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Datenschutz
          </button>
        )}
      </footer>

      {/* Impressum Modal */}
      <Dialog open={openModal === 'imprint'} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impressum</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {settings?.imprint}
          </div>
        </DialogContent>
      </Dialog>

      {/* Datenschutz Modal */}
      <Dialog open={openModal === 'privacy'} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Datenschutzerklärung</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {settings?.privacy_text}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
