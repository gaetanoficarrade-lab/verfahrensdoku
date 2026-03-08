import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthContext } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const { roles, profileLoading, isSuperAdmin, impersonation } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || profileLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // If super_admin and not impersonating, go to admin
    if (isSuperAdmin && !impersonation.isImpersonating) {
      navigate('/admin');
      return;
    }

    // If client role, go to client area
    if (roles.includes('client')) {
      navigate('/client');
      return;
    }

    // tenant_admin / tenant_user stay here (future: tenant dashboard)
  }, [user, loading, roles, profileLoading, isSuperAdmin, impersonation, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Willkommen in der GoBD-Suite
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Berater-Dashboard kommt als nächstes.
      </div>
    </div>
  );
};

export default Index;
