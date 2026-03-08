import { supabase } from '@/integrations/supabase/client';

export type WebhookEvent =
  | 'projekt_erstellt'
  | 'kapitel_eingereicht'
  | 'dokument_finalisiert'
  | 'mandant_eingeladen';

/**
 * Fire-and-forget webhook trigger.
 * Calls the send-webhook edge function which dispatches to all matching tenant webhooks.
 */
export function triggerWebhook(event: WebhookEvent, data?: Record<string, any>) {
  supabase.functions
    .invoke('send-webhook', { body: { event, data: data || {} } })
    .then(({ error }) => {
      if (error) console.warn('Webhook trigger failed:', error.message);
    })
    .catch((err) => console.warn('Webhook trigger error:', err));
}
