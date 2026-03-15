import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, XIcon, ChevronDown } from 'lucide-react';

const C = {
  yellow: '#FAC81E', dark: '#44484E', white: '#FFFFFF', border: '#E5E5E5',
} as const;

export default function MarketingNav() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(null);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => { setMobileMenu(false); }, [location.pathname]);

  const isSubpage = ['/fuer-selbststaendige', '/fuer-dienstleister'].includes(location.pathname);
  const isResource = ['/verfahrensdokumentation-erstellen'].includes(location.pathname);
  const isHome = location.pathname === '/';

  const DropdownItem = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link to={to} className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors whitespace-nowrap" style={{ color: C.dark }} onClick={() => setDropdownOpen(null)}>
      {children}
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12"
        style={{ height: 64, background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent', boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.3s ease' }}
        aria-label="Hauptnavigation"
      >
        <Link to="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
          <img src="/images/logo.png" alt="GoBD-Suite Logo" className="h-14 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[15px] font-medium" ref={dropdownRef} style={{ color: C.dark }}>
          {isHome
            ? <a href="#funktionen" className="hover:opacity-70 transition-opacity">Funktionen</a>
            : <Link to="/#funktionen" className="hover:opacity-70 transition-opacity">Funktionen</Link>
          }

          {/* Für wen? Dropdown */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(dropdownOpen === 'fuerwen' ? null : 'fuerwen')}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: isSubpage ? C.yellow : C.dark, fontWeight: isSubpage ? 700 : 500 }}
            >
              Für wen? <ChevronDown size={14} className={`transition-transform ${dropdownOpen === 'fuerwen' ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen === 'fuerwen' && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl py-2 min-w-[220px]"
                style={{ background: C.white, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <DropdownItem to="/fuer-selbststaendige">Für Selbstständige</DropdownItem>
                <DropdownItem to="/fuer-dienstleister">Für Dienstleister</DropdownItem>
              </div>
            )}
          </div>

          {isHome
            ? <a href="#preise" className="hover:opacity-70 transition-opacity">Preise</a>
            : <Link to="/#preise" className="hover:opacity-70 transition-opacity">Preise</Link>
          }

          {/* Ressourcen Dropdown */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(dropdownOpen === 'ressourcen' ? null : 'ressourcen')}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: isResource ? C.yellow : C.dark, fontWeight: isResource ? 700 : 500 }}
            >
              Ressourcen <ChevronDown size={14} className={`transition-transform ${dropdownOpen === 'ressourcen' ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen === 'ressourcen' && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl py-2 min-w-[280px]"
                style={{ background: C.white, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <DropdownItem to="/verfahrensdokumentation-erstellen">VD erstellen – Anleitung</DropdownItem>
                <DropdownItem to="/blog">Blog</DropdownItem>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/auth" className="text-[15px] font-medium hover:opacity-70 transition-opacity" style={{ color: C.dark }}>Anmelden</Link>
          <Link to="/test-starten" className="inline-flex items-center justify-center gap-2 font-semibold text-[15px] transition-all duration-200"
            style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5b71a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.yellow; }}
          >Kostenlos testen</Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menü öffnen">
          {mobileMenu ? <XIcon size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileMenu && (
        <div className="fixed inset-0 z-40 flex flex-col pt-20 px-8 gap-4 text-lg font-medium md:hidden" style={{ background: C.white, color: C.dark }}>
          {isHome
            ? <a href="#funktionen" onClick={() => setMobileMenu(false)}>Funktionen</a>
            : <Link to="/#funktionen" onClick={() => setMobileMenu(false)}>Funktionen</Link>
          }
          <p className="text-xs font-semibold mt-2 uppercase tracking-wider" style={{ color: C.textGray || '#6E6E73' }}>Für wen?</p>
          <Link to="/fuer-selbststaendige" onClick={() => setMobileMenu(false)} className="pl-3">Für Selbstständige</Link>
          <Link to="/fuer-dienstleister" onClick={() => setMobileMenu(false)} className="pl-3">Für Dienstleister</Link>
          {isHome
            ? <a href="#preise" onClick={() => setMobileMenu(false)}>Preise</a>
            : <Link to="/#preise" onClick={() => setMobileMenu(false)}>Preise</Link>
          }
          <p className="text-xs font-semibold mt-2 uppercase tracking-wider" style={{ color: '#6E6E73' }}>Ressourcen</p>
          <Link to="/verfahrensdokumentation-erstellen" onClick={() => setMobileMenu(false)} className="pl-3">VD erstellen – Anleitung</Link>
          <Link to="/blog" onClick={() => setMobileMenu(false)} className="pl-3">Blog</Link>
          <hr style={{ borderColor: C.border }} />
          <Link to="/auth" onClick={() => setMobileMenu(false)}>Anmelden</Link>
          <Link to="/test-starten" onClick={() => setMobileMenu(false)}
            className="inline-flex items-center justify-center font-semibold text-[15px]"
            style={{ background: C.yellow, color: C.dark, borderRadius: 980, padding: '12px 24px' }}
          >Kostenlos testen</Link>
        </div>
      )}
    </>
  );
}
