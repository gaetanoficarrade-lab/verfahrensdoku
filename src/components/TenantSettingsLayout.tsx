import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Palette, Mail, Users, FileText, Globe, ScrollText, Link2, CreditCard, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantPlan } from '@/hooks/useTenantPlan';

interface TabItem {
  label: string;
  url: string;
  icon: React.ElementType;
  requiresFn?: keyof ReturnType<typeof useTenantPlan>;
}

const allTabs: TabItem[] = [
  { label: 'Abrechnung', url: '/settings/billing', icon: CreditCard },
  { label: 'Branding', url: '/settings/branding', icon: Palette, requiresFn: 'canBrand' },
  { label: 'Team', url: '/settings/team', icon: Users, requiresFn: 'canManageTeam' },
  { label: 'E-Mail-Vorlagen', url: '/settings/email', icon: Mail, requiresFn: 'canUseEmailTemplates' },
  { label: 'Vorlagen', url: '/settings/templates', icon: FileText, requiresFn: 'canUseTemplates' },
  { label: 'Webhooks', url: '/settings/webhook', icon: Globe, requiresFn: 'canUseWebhooks' },
  { label: 'Aktivitäts-Log', url: '/settings/activity-log', icon: ScrollText, requiresFn: 'canUseActivityLog' },
  { label: 'Affiliate', url: '/settings/affiliate', icon: Link2, requiresFn: 'canUseAffiliate' },
  { label: 'Sicherheit', url: '/settings/security', icon: KeyRound },
];

interface TenantSettingsLayoutProps {
  children: ReactNode;
}

export function TenantSettingsLayout({ children }: TenantSettingsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const tenantPlan = useTenantPlan();

  const tabs = allTabs.filter(tab => {
    if (!tab.requiresFn) return true;
    return tenantPlan[tab.requiresFn];
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Einstellungen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihren Account und Ihre Präferenzen</p>
      </div>

      {/* Horizontal tab bar */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto pb-px" aria-label="Einstellungen">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.url;
            const Icon = tab.icon;
            return (
              <button
                key={tab.url}
                onClick={() => navigate(tab.url)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
