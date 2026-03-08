import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Scale, Mail, CreditCard, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  { title: 'Allgemein', url: '/admin/settings/general', icon: Settings },
  { title: 'Rechtliches', url: '/admin/settings/legal', icon: Scale },
  { title: 'E-Mail Vorlagen', url: '/admin/settings/email', icon: Mail },
  { title: 'Pläne', url: '/admin/settings/plans', icon: CreditCard },
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

      <div className="flex gap-6">
        {/* Sub-navigation */}
        <nav className="w-56 shrink-0 space-y-1">
          {settingsNav.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
