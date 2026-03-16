import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Palette, Mail, Users, FileText, Globe, ScrollText, CreditCard, KeyRound, HelpCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenantPlan } from '@/hooks/useTenantPlan';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrialReadOnlyOverlay } from '@/components/TrialReadOnlyOverlay';

interface TabItem {
  label: string;
  url: string;
  icon: React.ElementType;
  requiresFn?: keyof ReturnType<typeof useTenantPlan>;
  /** Pages that are always accessible even during trial (e.g. billing, security, help) */
  alwaysAccessible?: boolean;
}

const allTabs: TabItem[] = [
  { label: 'Abrechnung', url: '/settings/billing', icon: CreditCard, alwaysAccessible: true },
  { label: 'Branding', url: '/settings/branding', icon: Palette, requiresFn: 'canBrand' },
  { label: 'Team', url: '/settings/team', icon: Users, requiresFn: 'canManageTeam' },
  { label: 'E-Mail-Vorlagen', url: '/settings/email', icon: Mail, requiresFn: 'canUseEmailTemplates' },
  { label: 'Vorlagen', url: '/settings/templates', icon: FileText, requiresFn: 'canUseTemplates' },
  { label: 'Webhooks', url: '/settings/webhook', icon: Globe, requiresFn: 'canUseWebhooks' },
  { label: 'Aktivitäts-Log', url: '/settings/activity-log', icon: ScrollText, requiresFn: 'canUseActivityLog' },
  { label: 'Sicherheit', url: '/settings/security', icon: KeyRound, alwaysAccessible: true },
  { label: 'Hilfe', url: '/help', icon: HelpCircle, alwaysAccessible: true },
];

interface TenantSettingsLayoutProps {
  children: ReactNode;
}

export function TenantSettingsLayout({ children }: TenantSettingsLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const tenantPlan = useTenantPlan();
  const { isTrialing } = useTrialRestrictions();

  // During trial: show ALL tabs (so user can see what's available).
  // When not trialing: filter based on plan features as before.
  const tabs = isTrialing
    ? allTabs
    : allTabs.filter(tab => {
        if (!tab.requiresFn) return true;
        return tenantPlan[tab.requiresFn];
      });

  const activeTab = tabs.find(tab => tab.url === location.pathname);

  // Determine if current page should be read-only during trial
  const currentTab = allTabs.find(tab => tab.url === location.pathname);
  const isLockedDuringTrial = isTrialing && currentTab && !currentTab.alwaysAccessible;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Einstellungen
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verwalten Sie Ihren Account und Ihre Präferenzen</p>
      </div>

      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <Select value={location.pathname} onValueChange={(val) => navigate(val)}>
          <SelectTrigger className="w-full bg-card border-border">
            <div className="flex items-center gap-2">
              {activeTab && <activeTab.icon className="h-4 w-4 text-accent" />}
              <SelectValue placeholder="Bereich wählen" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const locked = isTrialing && !tab.alwaysAccessible;
              return (
                <SelectItem key={tab.url} value={tab.url}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Horizontal tab bar */}
      <div className="hidden md:block rounded-xl bg-card border border-border p-1.5 shadow-sm">
        <nav className="flex flex-wrap gap-1" aria-label="Einstellungen">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.url;
            const Icon = tab.icon;
            const locked = isTrialing && !tab.alwaysAccessible;
            return (
              <button
                key={tab.url}
                onClick={() => navigate(tab.url)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive && 'text-accent-foreground')} />
                {tab.label}
                {locked && <Lock className={cn('h-3 w-3', isActive ? 'text-accent-foreground/60' : 'text-muted-foreground/50')} />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content — wrapped in read-only overlay when trial-locked */}
      <div>
        {isLockedDuringTrial ? (
          <TrialReadOnlyOverlay>{children}</TrialReadOnlyOverlay>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
