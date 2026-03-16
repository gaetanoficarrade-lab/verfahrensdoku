import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  tenantId: string | null;
  profileLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  isSuperAdmin: boolean;
  impersonation: ImpersonationState;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
  effectiveTenantId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [impersonation, setImpersonation] = useState<ImpersonationState>(() => {
    try {
      const stored = sessionStorage.getItem('impersonation');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      isImpersonating: false,
      originalTenantId: null,
      impersonatedTenantId: null,
      impersonatedTenantName: null,
    };
  });

  // Single auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch roles & profile when user changes
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
        const [rolesRes, profileRes] = await Promise.all([
          supabase.from('user_roles').select('role').eq('user_id', user.id),
          supabase.from('profiles').select('tenant_id').eq('user_id', user.id).maybeSingle(),
        ]);

        setRoles((rolesRes.data || []).map((r: UserRole) => r.role));
        setTenantId(profileRes.data?.tenant_id || null);
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

  const signIn = useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    // Log login on success
    if (!error && data?.user) {
      Promise.all([
        supabase.from('login_logs').insert({
          user_id: data.user.id,
          user_agent: navigator.userAgent,
          ip_hash: null,
        }),
        supabase.from('audit_log').insert({
          user_id: data.user.id,
          tenant_id: null, // will be filled by profile lookup if needed
          action: 'user_login',
          entity_type: 'auth',
          entity_id: data.user.id,
          details: { email },
        }),
      ]).catch(() => {});
    }
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // Log logout before signing out
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await supabase.from('audit_log').insert({
        user_id: currentUser.id,
        tenant_id: null,
        action: 'user_logout',
        entity_type: 'auth',
        entity_id: currentUser.id,
        details: {},
      }).catch(() => {});
    }
    await supabase.auth.signOut();
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });
    return { error };
  }, []);

  const startImpersonation = useCallback((targetTenantId: string, targetTenantName: string) => {
    const state: ImpersonationState = {
      isImpersonating: true,
      originalTenantId: tenantId,
      impersonatedTenantId: targetTenantId,
      impersonatedTenantName: targetTenantName,
    };
    setImpersonation(state);
    sessionStorage.setItem('impersonation', JSON.stringify(state));
  }, [tenantId]);

  const stopImpersonation = useCallback(() => {
    const state: ImpersonationState = {
      isImpersonating: false,
      originalTenantId: null,
      impersonatedTenantId: null,
      impersonatedTenantName: null,
    };
    setImpersonation(state);
    sessionStorage.removeItem('impersonation');
  }, []);

  const effectiveTenantId = impersonation.isImpersonating
    ? impersonation.impersonatedTenantId
    : tenantId;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        tenantId,
        profileLoading,
        hasRole,
        isSuperAdmin,
        impersonation,
        startImpersonation,
        stopImpersonation,
        effectiveTenantId,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        signUp,
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
