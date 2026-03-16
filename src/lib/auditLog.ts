import { supabase } from '@/integrations/supabase/client';

export type AuditAction =
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'client_user_created'
  | 'client_invite_sent'
  | 'project_created'
  | 'project_deleted'
  | 'chapter_submitted'
  | 'chapter_approved'
  | 'text_generated'
  | 'pdf_created'
  | 'pdf_downloaded'
  | 'settings_updated'
  | 'team_member_invited'
  | 'team_member_removed'
  | 'user_login'
  | 'user_logout';

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

    const tenantId = profile?.tenant_id || null;

    await supabase.from('audit_log').insert({
      tenant_id: tenantId,
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
