import { useEffect, useRef } from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function TenantBrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useTenantSettings();
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const propsSet: string[] = [];

    const setVar = (name: string, value: string) => {
      root.style.setProperty(name, value);
      propsSet.push(name);
    };

    const setHSL = (varName: string, hex: string) => {
      const hsl = hexToHSL(hex);
      if (hsl) setVar(varName, hsl);
    };

    if (settings?.primary_color) {
      setHSL('--primary', settings.primary_color);
      setHSL('--ring', settings.primary_color);
      setHSL('--sidebar-primary', settings.primary_color);
    }
    if (settings?.button_text_color) {
      setHSL('--primary-foreground', settings.button_text_color);
      setHSL('--sidebar-primary-foreground', settings.button_text_color);
    }
    if (settings?.sidebar_bg_color) {
      setHSL('--sidebar-background', settings.sidebar_bg_color);
    }
    if (settings?.menu_text_color) {
      setHSL('--sidebar-foreground', settings.menu_text_color);
    }
    if (settings?.brand_text_color) {
      setHSL('--brand-foreground', settings.brand_text_color);
    }
    if ((settings as any)?.menu_active_color) {
      setHSL('--sidebar-accent', (settings as any).menu_active_color);
    }
    if ((settings as any)?.menu_active_text_color) {
      setHSL('--sidebar-accent-foreground', (settings as any).menu_active_text_color);
    }
    if (settings?.font_family) {
      setVar('--font-family-custom', settings.font_family);
      root.style.fontFamily = `${settings.font_family}, var(--font-sans, sans-serif)`;
    }

    // Custom CSS
    if (settings?.custom_css) {
      if (!styleRef.current) {
        styleRef.current = document.createElement('style');
        styleRef.current.setAttribute('data-tenant-css', 'true');
        document.head.appendChild(styleRef.current);
      }
      styleRef.current.textContent = settings.custom_css;
    } else if (styleRef.current) {
      styleRef.current.textContent = '';
    }

    return () => {
      propsSet.forEach(p => root.style.removeProperty(p));
      if (settings?.font_family) root.style.fontFamily = '';
      if (styleRef.current) styleRef.current.textContent = '';
    };
  }, [settings]);

  return <>{children}</>;
}
