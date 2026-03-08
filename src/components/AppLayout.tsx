import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ImpersonationBanner } from '@/components/ImpersonationBanner';
import { useAuthContext } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { impersonation } = useAuthContext();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <ImpersonationBanner />
          <header
            className={`h-12 flex items-center border-b border-border px-4 ${
              impersonation.isImpersonating ? 'mt-10' : ''
            }`}
          >
            <SidebarTrigger className="mr-4" />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
