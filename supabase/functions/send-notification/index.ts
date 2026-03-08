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

    // Email sending via SMTP would go here if configured
    const smtpHost = Deno.env.get('SMTP_HOST');
    if (smtpHost && payload.recipient_emails && payload.recipient_emails.length > 0) {
      // Get tenant branding if available
      let logoUrl = '';
      let brandName = 'GoBD-Suite';
      if (tenant_id) {
        const { data: settings } = await supabase
          .from('tenant_settings')
          .select('logo_url, brand_name')
          .eq('tenant_id', tenant_id)
          .maybeSingle();
        if (settings) {
          logoUrl = settings.logo_url || '';
          brandName = settings.brand_name || 'GoBD-Suite';
        }
      }

      // Note: Actual SMTP sending would require a library like nodemailer
      // This is a placeholder for the email HTML template
      console.log(`Would send email to ${payload.recipient_emails.join(', ')}`);
      console.log(`Subject: ${title}`);
      console.log(`Brand: ${brandName}, Logo: ${logoUrl}`);
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
