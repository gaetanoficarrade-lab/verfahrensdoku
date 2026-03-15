import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const CONSENT_KEY = 'cookie_consent';
const EXCLUDED_PATHS = ['/datenschutz', '/impressum', '/agb', '/avv'];

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
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (EXCLUDED_PATHS.includes(location.pathname)) {
      setVisible(false);
      return;
    }
    const consent = getCookieConsent();
    if (!consent) setVisible(true);
  }, [location.pathname]);

  const save = useCallback((consent: CookieConsent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setVisible(false);
    setShowModal(false);
  }, []);

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() });
  const acceptNecessary = () => save({ necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
  const saveSelection = () => save({ necessary: true, analytics, marketing, timestamp: new Date().toISOString() });

  if (!visible && !showModal) return null;

  /* ─── Settings Modal ─── */
  if (showModal) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: '#44484E', color: '#FFFFFF' }}>
          <h2 className="text-xl font-bold mb-6">Cookie-Einstellungen</h2>

          <div className="space-y-6 mb-8">
            {/* Necessary */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">Notwendige Cookies</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-50">Immer aktiv</span>
                </div>
                <p className="text-xs leading-relaxed opacity-70">
                  Für Login, Session und grundlegende Funktionen der Website. Können nicht deaktiviert werden.
                </p>
              </div>
              <Switch checked disabled className="opacity-50 data-[state=checked]:bg-[#FAC81E]" />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="font-semibold text-sm block mb-1">Analyse-Cookies</span>
                <p className="text-xs leading-relaxed opacity-70">
                  Helfen uns zu verstehen wie Besucher die Website nutzen. Wir nutzen aktuell keine Analyse-Tools.
                </p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} className="data-[state=checked]:bg-[#FAC81E]" />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="font-semibold text-sm block mb-1">Marketing-Cookies</span>
                <p className="text-xs leading-relaxed opacity-70">
                  Für personalisierte Werbung und Retargeting. Wir nutzen aktuell keine Marketing-Cookies.
                </p>
              </div>
              <Switch checked={marketing} onCheckedChange={setMarketing} className="data-[state=checked]:bg-[#FAC81E]" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="text-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              Abbrechen
            </button>
            <div className="flex-1" />
            <button
              onClick={saveSelection}
              className="inline-flex items-center justify-center font-semibold text-sm transition-all duration-200 rounded-full px-6 py-2.5"
              style={{ background: '#FAC81E', color: '#44484E' }}
            >
              Auswahl speichern
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Banner ─── */
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100]" style={{ background: '#44484E' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-5 flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Text */}
        <div className="flex-1 text-white">
          <p className="font-semibold text-sm mb-1">Wir verwenden Cookies</p>
          <p className="text-xs leading-relaxed opacity-80">
            Wir nutzen technisch notwendige Cookies für den Betrieb dieser Website. Analyse- oder
            Tracking-Cookies setzen wir nur mit deiner ausdrücklichen Zustimmung ein.
            {' '}
            <Link to="/datenschutz" className="underline hover:opacity-100 opacity-80 transition-opacity">
              Mehr Informationen in unserer Datenschutzerklärung
            </Link>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="text-white text-sm underline opacity-70 hover:opacity-100 transition-opacity"
          >
            Einstellungen
          </button>
          <button
            onClick={acceptNecessary}
            className="inline-flex items-center justify-center font-semibold text-sm rounded-full px-5 py-2.5 transition-all duration-200"
            style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#FFFFFF', background: 'transparent' }}
          >
            Nur notwendige
          </button>
          <button
            onClick={acceptAll}
            className="inline-flex items-center justify-center font-semibold text-sm rounded-full px-5 py-2.5 transition-all duration-200"
            style={{ background: '#FAC81E', color: '#44484E' }}
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link to re-open cookie settings */
export function CookieSettingsButton() {
  const reopen = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={reopen}
      className="hover:text-white transition-colors"
    >
      Cookie-Einstellungen
    </button>
  );
}
