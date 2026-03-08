import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'client_created'
  | 'client_updated'
  | 'client_user_created'
  | 'project_created'
  | 'chapter_submitted'
  | 'text_generated'
  | 'pdf_created'
  | 'settings_updated';

/**
 * Fire-and-forget audit log entry.
 * Requires authenticated user with a tenant_id in their profile.
 */
export async function logAudit(
  action: AuditAction,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile?.tenant_id) return;

    await supabase.from('audit_log').insert({
      tenant_id: profile.tenant_id,
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
