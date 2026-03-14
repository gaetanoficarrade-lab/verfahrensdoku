import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface TenantSettings {
  id: string;
  tenant_id: string;
  brand_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  button_text_color: string | null;
  menu_text_color: string | null;
  brand_text_color: string | null;
  sidebar_bg_color: string | null;
  custom_css: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  imprint: string | null;
  imprint_url: string | null;
  privacy_text: string | null;
  privacy_url: string | null;
  updated_at: string;
}

export function useTenantSettings() {
  const { effectiveTenantId } = useAuthContext();

  return useQuery({
    queryKey: ['tenant-settings', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return null;
      const { data, error } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .maybeSingle();
      if (error) throw error;
      return data as TenantSettings | null;
    },
    enabled: !!effectiveTenantId,
  });
}

export function useSaveTenantSettings() {
  const queryClient = useQueryClient();
  const { effectiveTenantId } = useAuthContext();

  return useMutation({
    mutationFn: async (settings: Partial<TenantSettings>) => {
      if (!effectiveTenantId) throw new Error('No tenant');
      const { data, error } = await supabase
        .from('tenant_settings')
        .upsert(
          { ...settings, tenant_id: effectiveTenantId },
          { onConflict: 'tenant_id' }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
    },
  });
}

export function useUploadTenantLogo() {
  return useMutation({
    mutationFn: async ({ file, tenantId }: { file: File; tenantId: string }) => {
      const ext = file.name.split('.').pop();
      const path = `${tenantId}/logo.${ext}`;
      
      const { error } = await supabase.storage
        .from('tenant-assets')
        .upload(path, file, { upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(path);

      return urlData.publicUrl;
    },
  });
}
