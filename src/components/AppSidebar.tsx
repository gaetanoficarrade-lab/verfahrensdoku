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
  ScrollText,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';
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

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Lizenznehmer', url: '/admin/tenants', icon: Building2 },
  { title: 'Audit-Log', url: '/audit-log', icon: ScrollText },
];

const tenantItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Mandanten', url: '/clients', icon: Users },
  { title: 'Projekte', url: '/projects', icon: FolderOpen },
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

  const currentPath = location.pathname;
  const isActive = (path: string) => {
    if (path === '/admin' && currentPath === '/admin') return true;
    if (path === '/' && currentPath === '/') return true;
    if (path === '/client' && currentPath === '/client') return true;
    if (path !== '/' && path !== '/admin' && path !== '/client' && currentPath.startsWith(path)) return true;
    return false;
  };

  const showAdmin = isSuperAdmin && !impersonation.isImpersonating;
  const isClient = roles.includes('client');
  const isTenantAdmin = roles.includes('tenant_admin');
  const items = showAdmin ? adminItems : isClient ? clientItems : tenantItems;

  const brandName = tenantSettings?.brand_name || 'GoBD-Suite';
  const logoUrl = tenantSettings?.logo_url;

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-8 w-8 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">{brandName}</span>
              <span className="text-xs text-sidebar-foreground/60">
                {showAdmin ? 'Super-Admin' : isClient ? 'Mandant' : 'Berater'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            {!collapsed && 'Navigation'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/' || item.url === '/admin'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings section for tenant_admin */}
        {(isTenantAdmin || (isSuperAdmin && impersonation.isImpersonating)) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50">
              {!collapsed && 'Einstellungen'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings/branding')}
                    tooltip="Branding"
                  >
                    <NavLink
                      to="/settings/branding"
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <Settings className="h-4 w-4" />
                      {!collapsed && <span>Branding</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/settings/activity-log')}
                    tooltip="Aktivitäts-Log"
                  >
                    <NavLink
                      to="/settings/activity-log"
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <ScrollText className="h-4 w-4" />
                      {!collapsed && <span>Aktivitäts-Log</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
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
