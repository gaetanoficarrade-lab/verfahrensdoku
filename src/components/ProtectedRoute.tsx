import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';

type AppRole = 'super_admin' | 'tenant_admin' | 'tenant_user' | 'client';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: AppRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, requiredRoles, redirectTo = '/auth' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { roles, profileLoading } = useAuthContext();

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
    const hasRequired = requiredRoles.some((r) => roles.includes(r));
    if (!hasRequired) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
