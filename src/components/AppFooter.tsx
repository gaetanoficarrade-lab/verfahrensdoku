import { useState, useEffect } from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LegalSettings {
  imprint_text?: string;
  imprint_url?: string;
  privacy_text?: string;
  privacy_url?: string;
  terms_text?: string;
  terms_url?: string;
}

export function AppFooter() {
  const { data: tenantSettings } = useTenantSettings();
  const [platformLegal, setPlatformLegal] = useState<LegalSettings>({});
  const [openModal, setOpenModal] = useState<'imprint' | 'privacy' | 'terms' | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'legal')
        .maybeSingle();
      if (data?.value) {
        setPlatformLegal(data.value as LegalSettings);
      }
    };
    fetch();
  }, []);

  // Merge: tenant settings override platform settings for imprint/privacy
  const imprint_text = tenantSettings?.imprint || platformLegal.imprint_text;
  const imprint_url = tenantSettings?.imprint_url || platformLegal.imprint_url;
  const privacy_text = tenantSettings?.privacy_text || platformLegal.privacy_text;
  const privacy_url = tenantSettings?.privacy_url || platformLegal.privacy_url;
  const terms_text = platformLegal.terms_text;
  const terms_url = platformLegal.terms_url;

  const hasImprint = imprint_text || imprint_url;
  const hasPrivacy = privacy_text || privacy_url;
  const hasTerms = terms_text || terms_url;

  if (!hasImprint && !hasPrivacy && !hasTerms) return null;

  const handleClick = (type: 'imprint' | 'privacy' | 'terms') => {
    const urlMap = { imprint: imprint_url, privacy: privacy_url, terms: terms_url };
    const url = urlMap[type];
    if (url) {
      window.open(url, '_blank', 'noopener');
    } else {
      setOpenModal(type);
    }
  };

  const modalContent: Record<string, { title: string; text?: string }> = {
    imprint: { title: 'Impressum', text: imprint_text || undefined },
    privacy: { title: 'Datenschutzerklärung', text: privacy_text || undefined },
    terms: { title: 'Allgemeine Geschäftsbedingungen', text: terms_text || undefined },
  };

  return (
    <>
      <footer className="border-t border-border px-6 py-3 flex items-center gap-4 text-xs text-muted-foreground">
        {hasImprint && (
          <button
            onClick={() => handleClick('imprint')}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Impressum
          </button>
        )}
        {hasPrivacy && (
          <button
            onClick={() => handleClick('privacy')}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Datenschutz
          </button>
        )}
        {hasTerms && (
          <button
            onClick={() => handleClick('terms')}
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            AGB
          </button>
        )}
      </footer>

      {openModal && modalContent[openModal] && (
        <Dialog open={!!openModal} onOpenChange={(o) => !o && setOpenModal(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{modalContent[openModal].title}</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {modalContent[openModal].text}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
