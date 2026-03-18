import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantBrandingProvider } from "@/components/TenantBrandingProvider";
import { AppLayout } from "@/components/AppLayout";
import { AdminSettingsLayout } from "@/components/AdminSettingsLayout";
import { TenantSettingsLayout } from "@/components/TenantSettingsLayout";
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
import AdminSettingsIntegrations from "./pages/AdminSettingsIntegrations";
import AdminPromoCodes from "./pages/AdminPromoCodes";
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
import DocumentPreview from "./pages/DocumentPreview";
import SecuritySettings from "./pages/SecuritySettings";
import HelpPage from "./pages/HelpPage";
import BillingSettings from "./pages/BillingSettings";
import ClientSettings from "./pages/ClientSettings";
import TrialExpired from "./pages/TrialExpired";
import AdvisorOverview from "./pages/AdvisorOverview";
import TemplateSettings from "./pages/TemplateSettings";
import TenantEmailSettings from "./pages/TenantEmailSettings";
import AdminWebhookLogs from "./pages/AdminWebhookLogs";
import TestStarten from "./pages/TestStarten";
import LandingPage from "./pages/LandingPage";
import MarketingPage from "./pages/MarketingPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminBlog from "./pages/AdminBlog";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import AVV from "./pages/AVV";
import FuerSelbststaendige from "./pages/FuerSelbststaendige";
import FuerDienstleister from "./pages/FuerDienstleister";
import VerfahrensdokumentationErstellen from "./pages/VerfahrensdokumentationErstellen";
import PartnerPage from "./pages/PartnerPage";
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
              <Route path="/" element={<MarketingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/avv" element={<AVV />} />
              <Route path="/register" element={<Register />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/client-register" element={<ClientRegister />} />
              <Route path="/test-starten" element={<TestStarten />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/fuer-selbststaendige" element={<FuerSelbststaendige />} />
              <Route path="/fuer-dienstleister" element={<FuerDienstleister />} />
              <Route path="/verfahrensdokumentation-erstellen" element={<VerfahrensdokumentationErstellen />} />
              <Route path="/partner" element={<PartnerPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              {/* Protected routes with layout */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout><Index /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><AdvisorOverview /></AppLayout>
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
                path="/admin/settings/audit-log"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsLayout><AuditLog /></AdminSettingsLayout></AppLayout>
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
                path="/admin/settings/integrations"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminSettingsIntegrations /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings/promo-codes"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminPromoCodes /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/webhook-logs"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminWebhookLogs /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/blog"
                element={
                  <ProtectedRoute requiredRoles={['super_admin']}>
                    <AppLayout><AdminBlog /></AppLayout>
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
              <Route
                path="/projects/:id/preview"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><DocumentPreview /></AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings/billing"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><BillingSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/branding"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><BrandingSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/activity-log"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><ActivityLog /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/team"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><TeamSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/email"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><TenantEmailSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/webhook"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin']}>
                    <AppLayout><TenantSettingsLayout><WebhookSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/security"
                element={
                  <ProtectedRoute>
                    <AppLayout><TenantSettingsLayout><SecuritySettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/templates"
                element={
                  <ProtectedRoute requiredRoles={['tenant_admin', 'tenant_user']}>
                    <AppLayout><TenantSettingsLayout><TemplateSettings /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <AppLayout><TenantSettingsLayout><HelpPage /></TenantSettingsLayout></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trial-expired"
                element={
                  <ProtectedRoute>
                    <AppLayout><TrialExpired /></AppLayout>
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
              <Route
                path="/client/settings"
                element={
                  <ProtectedRoute requiredRoles={['client']}>
                    <AppLayout><ClientSettings /></AppLayout>
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
