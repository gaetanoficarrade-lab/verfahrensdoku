import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

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
          <div className="max-w-3xl mx-auto rounded-2xl bg-[#1d1d1f] text-white shadow-2xl shadow-black/20 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 text-sm leading-relaxed text-white/80">
              Wir verwenden Cookies, um dir die bestmögliche Erfahrung zu bieten.
              Mehr dazu in unserer{' '}
              <Link to="/datenschutz" className="underline text-[#e8a91a] hover:text-[#f5c842]">
                Datenschutzerklärung
              </Link>.
            </div>
            <div className="flex gap-3 shrink-0">
              <Button
                onClick={decline}
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full px-5 h-10 text-sm"
              >
                Ablehnen
              </Button>
              <Button
                onClick={accept}
                className="bg-[#e8a91a] hover:bg-[#d49b15] text-white rounded-full px-6 h-10 text-sm font-semibold"
              >
                Akzeptieren
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
