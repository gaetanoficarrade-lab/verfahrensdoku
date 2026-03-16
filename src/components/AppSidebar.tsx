import {
  LayoutDashboard,
  Building2,
  ScrollText,
  LogOut,
  Shield,
  Users,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  Globe,
  HelpCircle,
  Eye,
  Lock,
} from 'lucide-react';
import sidebarLogo from '@/assets/sidebar-logo.png';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useTrialRestrictions } from '@/hooks/useTrialRestrictions';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Unterkonten', url: '/admin/tenants', icon: Building2 },
  { title: 'Webhook-Protokoll', url: '/admin/webhook-logs', icon: ScrollText },
  { title: 'Einstellungen', url: '/admin/settings/general', icon: Settings },
];

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  trialLocked?: boolean;
}

const tenantItemsFull: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Kunden', url: '/clients', icon: Users },
  { title: 'Übersicht', url: '/overview', icon: Eye, trialLocked: true },
];

const clientItems = [
  { title: 'Dashboard', url: '/client', icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, isSuperAdmin, impersonation, roles } = useAuthContext();
  const { data: tenantSettings } = useTenantSettings();
  const { isTrialing } = useTrialRestrictions();

  const currentPath = location.pathname;
  const isActive = (path: string) => {
    if (path === '/admin' && currentPath === '/admin') return true;
    if (path === '/' && currentPath === '/') return true;
    if (path === '/client' && currentPath === '/client') return true;
    if (path.startsWith('/settings/') && currentPath.startsWith('/settings/')) return true;
    if (path !== '/' && path !== '/admin' && path !== '/client' && !path.startsWith('/settings/') && currentPath.startsWith(path)) return true;
    return false;
  };

  const showAdmin = isSuperAdmin && !impersonation.isImpersonating;
  const isClient = roles.includes('client');
  const items: MenuItem[] = showAdmin
    ? adminItems
    : isClient
      ? clientItems
      : tenantItemsFull;

  const logoUrl = tenantSettings?.logo_url;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderMenuItems = (menuItems: MenuItem[]) => (
    <SidebarMenu>
      {menuItems.map((item) => {
        const locked = isTrialing && item.trialLocked;

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild={!locked}
              isActive={isActive(item.url)}
              tooltip={item.title}
              className={locked ? 'opacity-50 cursor-default' : ''}
            >
              {locked ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/' || item.url === '/admin' || item.url === '/client'}
                      className="hover:bg-sidebar-accent/50 flex items-center gap-2"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Im Testmodus nur Ansicht</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <NavLink
                  to={item.url}
                  end={item.url === '/' || item.url === '/admin' || item.url === '/client'}
                  className="hover:bg-sidebar-accent/50"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center px-4 py-4">
          {collapsed ? (
            <img
              src={logoUrl || sidebarLogo}
              alt="Logo"
              className="h-8 w-8 object-contain shrink-0"
            />
          ) : (
            <img
              src={logoUrl || sidebarLogo}
              alt="Logo"
              className="object-contain"
              style={{ width: '220px', height: 'auto', display: 'block', maxWidth: 'none' }}
            />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(items)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {!showAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(isClient ? '/client/settings' : '/settings/billing')}
                tooltip="Einstellungen"
              >
                <NavLink
                  to={isClient ? '/client/settings' : '/settings/billing'}
                  className="hover:bg-sidebar-accent/50"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Einstellungen</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        <div className="border-t border-sidebar-border my-1" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Abmelden"
              className="hover:bg-sidebar-accent/50 text-sidebar-foreground/70"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Abmelden</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={collapsed ? 'Erweitern' : 'Einklappen'}
              className="hover:bg-sidebar-accent/50 text-sidebar-foreground/50"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {!collapsed && <span>Einklappen</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
