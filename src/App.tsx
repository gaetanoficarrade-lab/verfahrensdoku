import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantBrandingProvider } from "@/components/TenantBrandingProvider";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import SetPassword from "./pages/SetPassword";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTenants from "./pages/AdminTenants";
import AuditLog from "./pages/AuditLog";
import AdminSettingsGeneral from "./pages/AdminSettingsGeneral";
import AdminSettingsLegal from "./pages/AdminSettingsLegal";
import AdminSettingsEmail from "./pages/AdminSettingsEmail";
import AdminSettingsPlans from "./pages/AdminSettingsPlans";
import AdminSettingsSystem from "./pages/AdminSettingsSystem";
import Clients from "./pages/Clients";
import ClientNew from "./pages/ClientNew";
import ClientDetail from "./pages/ClientDetail";
import Projects from "./pages/Projects";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProjectDetail from "./pages/ClientProjectDetail";
import ProjectDetail from "./pages/ProjectDetail";
import ChapterEditor from "./pages/ChapterEditor";
import BrandingSettings from "./pages/BrandingSettings";
import ActivityLog from "./pages/ActivityLog";
import TeamSettings from "./pages/TeamSettings";
import WebhookSettings from "./pages/WebhookSettings";
import ClientRegister from "./pages/ClientRegister";
import AffiliateSettings from "./pages/AffiliateSettings";
import AdminAffiliates from "./pages/AdminAffiliates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TenantBrandingProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/register" element={<Register />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/client-register" element={<ClientRegister />} />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout><Index /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminDashboard /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tenants"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminTenants /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/audit-log"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AuditLog /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Settings */}
              <Route
                path="/admin/settings/general"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsGeneral /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/legal"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsLegal /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/email"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsEmail /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/plans"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsPlans /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/system"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsSystem /></AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/clients"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><Clients /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/new"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><ClientNew /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients/:id"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><ClientDetail /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><Projects /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><ProjectDetail /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id/chapters/:chapterKey"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><ChapterEditor /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Settings */}
              <Route
                path="/settings/branding"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><BrandingSettings /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/activity-log"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><ActivityLog /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/team"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TeamSettings /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/webhook"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><WebhookSettings /></AppLayout>
                  </ProtectedRoute>
                }
              />
              {/* Client portal routes */}
              <Route
                path="/client"
                element={
                  <ProtectedRoute requiredRoles={['client']}>
                    <AppLayout><ClientDashboard /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/projects/:id"
                element={
                  <ProtectedRoute requiredRoles={['client']}>
                    <AppLayout><ClientProjectDetail /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/client/projects/:id/chapters/:chapterKey"
                element={
                  <ProtectedRoute requiredRoles={['client']}>
                    <AppLayout><ChapterEditor /></AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </TenantBrandingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
