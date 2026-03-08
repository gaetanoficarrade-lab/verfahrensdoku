import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'super_admin' | 'tenant_admin' | 'tenant_user' | 'client';

interface UserRole {
  role: AppRole;
}

interface ImpersonationState {
  isImpersonating: boolean;
  originalTenantId: string | null;
  impersonatedTenantId: string | null;
  impersonatedTenantName: string | null;
}

interface AuthContextType {
  roles: AppRole[];
  tenantId: string | null;
  profileLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  isSuperAdmin: boolean;
  impersonation: ImpersonationState;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
  effectiveTenantId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    isImpersonating: false,
    originalTenantId: null,
    impersonatedTenantId: null,
    impersonatedTenantName: null,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setRoles([]);
      setTenantId(null);
      setProfileLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setProfileLoading(true);
      try {
        // Fetch roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const userRoles = (rolesData || []).map((r: UserRole) => r.role);
        setRoles(userRoles);

        // Fetch tenant_id from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .maybeSingle();

        setTenantId(profile?.tenant_id || null);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserData();
  }, [user, loading]);

  const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
  const isSuperAdmin = roles.includes('super_admin');

  const startImpersonation = useCallback((targetTenantId: string, targetTenantName: string) => {
    setImpersonation({
      isImpersonating: true,
      originalTenantId: tenantId,
      impersonatedTenantId: targetTenantId,
      impersonatedTenantName: targetTenantName,
    });
  }, [tenantId]);

  const stopImpersonation = useCallback(() => {
    setImpersonation({
      isImpersonating: false,
      originalTenantId: null,
      impersonatedTenantId: null,
      impersonatedTenantName: null,
    });
  }, []);

  const effectiveTenantId = impersonation.isImpersonating
    ? impersonation.impersonatedTenantId
    : tenantId;

  return (
    <AuthContext.Provider
      value={{
        roles,
        tenantId,
        profileLoading,
        hasRole,
        isSuperAdmin,
        impersonation,
        startImpersonation,
        stopImpersonation,
        effectiveTenantId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
