import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

type AppRole = 'super_admin' | 'tenant_admin' | 'tenant_user' | 'client';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRoles, redirectTo = '/auth' }: ProtectedRouteProps) {
  const { user, loading, roles, profileLoading, isSuperAdmin, impersonation } = useAuthContext();

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    // Super admins impersonating a tenant can access tenant_admin/tenant_user routes
    const isTenantRoute = requiredRoles.some((r) => r === 'tenant_admin' || r === 'tenant_user');
    if (isSuperAdmin && impersonation.isImpersonating && isTenantRoute) {
      return <>{children}</>;
    }

    const hasRequired = requiredRoles.some((r) => roles.includes(r));
    if (!hasRequired) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
