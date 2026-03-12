import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'chapter_submitted' | 'chapter_approved' | 'client_invited' | 'document_finalized' | 'new_tenant';
  recipient_user_ids?: string[];
  recipient_emails?: string[];
  data: Record<string, any>;
  tenant_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: NotificationPayload = await req.json();
    const { type, recipient_user_ids, data, tenant_id } = payload;

    // Build notification content based on type
    let title = '';
    let message = '';
    let link = '';

    switch (type) {
      case 'chapter_submitted':
        title = 'Kapitel eingereicht';
        message = `Mandant "${data.client_name}" hat Kapitel "${data.chapter_name}" eingereicht.`;
        link = `/projects/${data.project_id}/chapters/${data.chapter_key}`;
        break;
      case 'chapter_approved':
        title = 'Kapitel freigegeben';
        message = `Ihr Kapitel "${data.chapter_name}" wurde freigegeben.`;
        link = `/client/projects/${data.project_id}/chapters/${data.chapter_key}`;
        break;
      case 'client_invited':
        title = 'Einladung';
        message = `Sie wurden eingeladen, an einer Verfahrensdokumentation mitzuarbeiten.`;
        link = data.invite_link || '/client';
        break;
      case 'document_finalized':
        title = 'Verfahrensdokumentation fertig';
        message = `Ihre Verfahrensdokumentation "${data.project_name}" ist fertiggestellt.`;
        link = `/client/projects/${data.project_id}`;
        break;
      case 'new_tenant':
        title = 'Neuer Lizenznehmer';
        message = `Neuer Lizenznehmer "${data.tenant_name}" hat sich registriert.`;
        link = '/admin/tenants';
        break;
    }

    // Insert in-app notifications
    if (recipient_user_ids && recipient_user_ids.length > 0) {
      const notifications = recipient_user_ids.map(uid => ({
        user_id: uid,
        title,
        message,
        link,
        is_read: false,
      }));
      await supabase.from('notifications').insert(notifications);
    }

    // Send email notifications via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY && payload.recipient_emails && payload.recipient_emails.length > 0) {
      // Get tenant branding if available
      let brandName = 'GoBD-Suite';
      if (tenant_id) {
        const { data: settings } = await supabase
          .from('tenant_settings')
          .select('brand_name')
          .eq('tenant_id', tenant_id)
          .maybeSingle();
        if (settings?.brand_name) {
          brandName = settings.brand_name;
        }
      }

      const appUrl = 'https://vd.gaetanoficarra.de';
      const fullLink = link ? `${appUrl}${link}` : appUrl;

      for (const recipientEmail of payload.recipient_emails) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `${brandName} <noreply@gaetanoficarra.de>`,
              to: [recipientEmail],
              subject: `${title} – ${brandName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #1a1a1a;">${title}</h2>
                  <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    ${message}
                  </p>
                  ${link ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${fullLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
                      Jetzt ansehen
                    </a>
                  </div>
                  ` : ''}
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
                  <p style="color: #999; font-size: 12px;">
                    Diese E-Mail wurde von ${brandName} versendet.
                  </p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error(`Failed to send email to ${recipientEmail}:`, emailErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, title, message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
