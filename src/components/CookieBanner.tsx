import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';

export interface CookieConsent {
  essential: boolean;    // always true
  analytics: boolean;
  marketing: boolean;
}

const CONSENT_KEY = 'cookie-consent';

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) setVisible(true);
  }, []);

  const save = useCallback((consent: CookieConsent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
  }, []);

  const acceptAll = () => save({ essential: true, analytics: true, marketing: true });
  const declineAll = () => save({ essential: true, analytics: false, marketing: false });
  const saveSelection = () => save({ essential: true, analytics, marketing });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6"
        >
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#1d1d1f] text-white shadow-2xl shadow-black/20 p-6 sm:p-8">
            {/* Main text */}
            <div className="text-sm leading-relaxed text-white/80 mb-4">
              Wir verwenden Cookies und ähnliche Technologien. Essenzielle Cookies sind für den Betrieb der Website
              erforderlich und können nicht deaktiviert werden. Optionale Cookies helfen uns, die Website zu
              verbessern und Inhalte anzupassen. Du kannst deine Einstellungen jederzeit anpassen.{' '}
              <Link to="/datenschutz" className="underline text-[#e8a91a] hover:text-[#f5c842]">
                Datenschutzerklärung
              </Link>
            </div>

            {/* Details toggle */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10 pt-4 mb-4 space-y-3 text-sm">
                    {/* Essential */}
                    <label className="flex items-start gap-3 cursor-not-allowed">
                      <input type="checkbox" checked disabled className="mt-0.5 accent-[#e8a91a]" />
                      <div>
                        <span className="font-medium text-white">Essenziell</span>
                        <span className="ml-2 text-[10px] text-white/40 uppercase tracking-wider">Immer aktiv</span>
                        <p className="text-white/50 text-xs mt-0.5">
                          Authentifizierung, Sitzungsverwaltung, Cookie-Einstellungen. Ohne diese Cookies
                          kann die Website nicht funktionieren.
                        </p>
                      </div>
                    </label>

                    {/* Analytics */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                        className="mt-0.5 accent-[#e8a91a]"
                      />
                      <div>
                        <span className="font-medium text-white">Analyse</span>
                        <p className="text-white/50 text-xs mt-0.5">
                          Helfen uns zu verstehen, wie Besucher die Website nutzen (z.&nbsp;B. besuchte Seiten,
                          Verweildauer). Alle Daten werden anonymisiert erhoben.
                        </p>
                      </div>
                    </label>

                    {/* Marketing */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={(e) => setMarketing(e.target.checked)}
                        className="mt-0.5 accent-[#e8a91a]"
                      />
                      <div>
                        <span className="font-medium text-white">Marketing</span>
                        <p className="text-white/50 text-xs mt-0.5">
                          Werden verwendet, um Werbung relevanter zu gestalten und die Wirksamkeit von
                          Kampagnen zu messen (z.&nbsp;B. HighLevel, externe Tracking-Pixel).
                        </p>
                      </div>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => setShowDetails(!showDetails)}
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full px-5 h-10 text-sm gap-2"
              >
                <Settings2 className="h-4 w-4" />
                {showDetails ? 'Weniger anzeigen' : 'Einstellungen'}
              </Button>
              <div className="flex-1" />
              {showDetails ? (
                <Button
                  onClick={saveSelection}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-full px-6 h-10 text-sm font-semibold"
                >
                  Auswahl speichern
                </Button>
              ) : (
                <Button
                  onClick={declineAll}
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full px-5 h-10 text-sm"
                >
                  Nur essenzielle
                </Button>
              )}
              <Button
                onClick={acceptAll}
                className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full px-6 h-10 text-sm font-semibold"
              >
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Small button to re-open cookie settings – place in footer */
export function CookieSettingsButton() {
  const reopen = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={reopen}
      className="hover:text-[#1d1d1f] transition-colors"
    >
      Cookie-Einstellungen
    </button>
  );
}
