import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { AppFooter } from '@/components/AppFooter';
import { NotificationBell } from '@/components/NotificationBell';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { TrialBanner } from '@/components/TrialBanner';
import { FirstStepsGuide } from '@/components/FirstStepsGuide';
import { TrialOnboardingGuide } from '@/components/TrialOnboardingGuide';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Badge } from '@/components/ui/badge';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { impersonation, isSuperAdmin, roles } = useAuthContext();
  const { showWarning, remainingSeconds, dismissWarning } = useSessionTimeout();

  const isClient = roles.includes('client');
  const showAdmin = isSuperAdmin && !impersonation.isImpersonating;
  const roleLabel = showAdmin ? 'Super-Admin' : isClient ? 'Kunde' : 'Berater';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <ImpersonationBanner />
          <TrialBanner />
          <header
            className={`h-12 flex items-center justify-between border-b border-border px-4 ${
              impersonation.isImpersonating ? 'mt-10' : ''
            }`}
          >
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-3 ml-auto">
              {showAdmin && (
                <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
                  {roleLabel}
                </Badge>
              )}
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
          <AppFooter />
        </div>
      </div>
      <SessionTimeoutWarning open={showWarning} remainingSeconds={remainingSeconds} onDismiss={dismissWarning} />
      <FirstStepsGuide />
      <TrialOnboardingGuide />
    </SidebarProvider>
  );
}
