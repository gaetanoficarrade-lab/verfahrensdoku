const GA_ID = 'G-9NCV468NDF';

const MARKETING_PATHS = [
  '/', '/landing', '/fuer-selbststaendige', '/fuer-dienstleister',
  '/verfahrensdokumentation-erstellen', '/blog', '/test-starten',
  '/impressum', '/datenschutz', '/agb', '/avv',
];

function isMarketingRoute(): boolean {
  const path = window.location.pathname;
  return MARKETING_PATHS.includes(path) || path.startsWith('/blog/');
}

let gtagLoaded = false;

export function loadGtagIfConsented(): void {
  if (gtagLoaded) return;
  if (!isMarketingRoute()) return;

  try {
    const raw = localStorage.getItem('cookie_consent');
    if (!raw) return;
    const consent = JSON.parse(raw);
    if (!consent?.analytics) return;
  } catch {
    return;
  }

  // Inject gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: any[]) { w.dataLayer.push(args); }
  gtag('js', new Date());
  gtag('config', GA_ID);

  gtagLoaded = true;
}
