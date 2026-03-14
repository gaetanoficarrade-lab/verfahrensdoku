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
  { title: 'Audit-Log', url: '/admin/settings/audit-log', icon: ScrollText },
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
      <div className="rounded-xl bg-card border border-border p-1.5 shadow-sm">
        <nav className="flex flex-wrap gap-1" aria-label="Plattform-Einstellungen">
          {settingsNav.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive && 'text-accent-foreground')} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
