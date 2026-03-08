import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SessionTimeoutConfig {
  timeoutMinutes: number;
  warningMinutes: number;
}

export function useSessionTimeout() {
  const { user, signOut } = useAuthContext();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [config, setConfig] = useState<SessionTimeoutConfig>({ timeoutMinutes: 30, warningMinutes: 5 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const warningRef = useRef<ReturnType<typeof setTimeout>>();
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  // Load config from platform_settings
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['session_timeout_minutes', 'session_warning_minutes']);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((d: any) => { map[d.key] = typeof d.value === 'object' ? JSON.stringify(d.value) : d.value; });
        setConfig({
          timeoutMinutes: parseInt(map['session_timeout_minutes'] || '30', 10),
          warningMinutes: parseInt(map['session_warning_minutes'] || '5', 10),
        });
      }
    };
    load();
  }, []);

  const resetTimers = useCallback(() => {
    if (!user) return;
    setShowWarning(false);
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);

    const warningMs = (config.timeoutMinutes - config.warningMinutes) * 60 * 1000;
    const logoutMs = config.timeoutMinutes * 60 * 1000;

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(config.warningMinutes * 60);
      countdownRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningMs);

    timeoutRef.current = setTimeout(() => {
      signOut();
    }, logoutMs);
  }, [user, config, signOut]);

  const dismissWarning = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll'];
    const handler = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    resetTimers();

    return () => {
      events.forEach(e => window.removeEventListener(e, handler));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
      clearInterval(countdownRef.current);
    };
  }, [user, resetTimers]);

  return { showWarning, remainingSeconds, dismissWarning };
}
