import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Scale, Mail, CreditCard, Activity, Tag, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { title: 'Allgemein', url: '/admin/settings/general', icon: Settings },
  { title: 'Rechtliches', url: '/admin/settings/legal', icon: Scale },
  { title: 'E-Mail Vorlagen', url: '/admin/settings/email', icon: Mail },
  { title: 'Pläne', url: '/admin/settings/plans', icon: CreditCard },
  { title: 'Rabatt-Codes', url: '/admin/settings/promo-codes', icon: Tag },
  { title: 'System', url: '/admin/settings/system', icon: Activity },
];

interface AdminSettingsLayoutProps {
  children: ReactNode;
}

export function AdminSettingsLayout({ children }: AdminSettingsLayoutProps) {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plattform-Einstellungen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Globale Konfiguration der GoBD-Suite Plattform
        </p>
      </div>

      {/* Horizontal sub-navigation */}
      <nav className="flex flex-wrap gap-1 border-b border-border pb-0">
        {settingsNav.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
