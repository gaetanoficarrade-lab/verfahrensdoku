import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { loadEmailTemplate, applyPlaceholders } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_URL = "https://vd.gaetanoficarra.de";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = user.id;

    const { data: callerRoles } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);

    const roleNames = (callerRoles || []).map((r: any) => r.role);
    if (!roleNames.includes("super_admin") && !roleNames.includes("tenant_admin") && !roleNames.includes("tenant_user")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, client_id, email } = await req.json();

    if (!tenant_id || !client_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id and client_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invite_tokens")
      .insert({ tenant_id, client_id })
      .select("id, token")
      .single();

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get tenant branding
    let brandName = "GoBD-Suite";
    const { data: tenantSettings } = await supabaseAdmin
      .from("tenant_settings")
      .select("brand_name")
      .eq("tenant_id", tenant_id)
      .maybeSingle();
    if (tenantSettings?.brand_name) {
      brandName = tenantSettings.brand_name;
    }

    let emailSent = false;
    if (email) {
      const inviteLink = `${APP_URL}/client-register?token=${invite.token}`;
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const placeholders: Record<string, string> = {
          brand_name: brandName,
          link: inviteLink,
        };

        const { template: customTemplate, logoUrl } = await loadEmailTemplate("client_invite", tenant_id);
        const subject = customTemplate
          ? applyPlaceholders(customTemplate.subject, placeholders, logoUrl)
          : `Einladung zur Verfahrensdokumentation – ${brandName}`;
        const html = customTemplate
          ? applyPlaceholders(customTemplate.html, placeholders, logoUrl)
          : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a1a;">Einladung zur Verfahrensdokumentation</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Sie wurden eingeladen, an einer Verfahrensdokumentation nach GoBD mitzuarbeiten.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Klicken Sie auf den folgenden Link, um sich zu registrieren und Ihre Daten einzugeben:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
                  Registrierung starten
                </a>
              </div>
              <p style="color: #999; font-size: 13px;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
                <a href="${inviteLink}" style="color: #999;">${inviteLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
              <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von ${brandName} versendet.</p>
            </div>`;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${brandName} <noreply@vd.gaetanoficarra.de>`,
            to: [email],
            subject,
            html,
          }),
        });
        emailSent = emailRes.ok;
        if (!emailRes.ok) {
          console.error("Failed to send invite email:", await emailRes.text());
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invite_id: invite.id,
        token: invite.token,
        email_sent: emailSent,
        message: emailSent
          ? "Einladungslink erstellt und E-Mail versendet."
          : "Einladungslink für Mandant erstellt.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("invite-client error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
