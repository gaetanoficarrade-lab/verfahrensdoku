import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub;

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

    const { invite_token, email, type } = await req.json();

    if (!invite_token || !email) {
      return new Response(
        JSON.stringify({ error: "invite_token and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the invite token exists and is active
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invite_tokens")
      .select("id, token, tenant_id, client_id, is_active, expires_at, used_by")
      .eq("token", invite_token)
      .single();

    if (inviteError || !invite) {
      return new Response(JSON.stringify({ error: "Einladung nicht gefunden." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!invite.is_active) {
      return new Response(JSON.stringify({ error: "Einladung wurde widerrufen." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invite.used_by) {
      return new Response(JSON.stringify({ error: "Einladung wurde bereits verwendet." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Einladung ist abgelaufen." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get tenant branding
    let brandName = "GoBD-Suite";
    const { data: tenantSettings } = await supabaseAdmin
      .from("tenant_settings")
      .select("brand_name")
      .eq("tenant_id", invite.tenant_id)
      .maybeSingle();
    if (tenantSettings?.brand_name) {
      brandName = tenantSettings.brand_name;
    }

    const isClientInvite = type === "client" || !!invite.client_id;
    const registerPath = isClientInvite ? "/client-register" : "/register";
    const inviteLink = `${APP_URL}${registerPath}?token=${invite.token}`;

    const subject = isClientInvite
      ? `Einladung zur Verfahrensdokumentation – ${brandName}`
      : `Teameinladung – ${brandName}`;

    const heading = isClientInvite
      ? "Einladung zur Verfahrensdokumentation"
      : "Einladung zum Team";

    const description = isClientInvite
      ? "Sie wurden eingeladen, an einer Verfahrensdokumentation nach GoBD mitzuarbeiten."
      : `Sie wurden in das Team von ${brandName} eingeladen.`;

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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1a1a;">${heading}</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              ${description}
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Klicken Sie auf den folgenden Link, um sich zu registrieren:
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
            <p style="color: #999; font-size: 12px;">
              Diese E-Mail wurde von ${brandName} versendet.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      throw new Error(`E-Mail konnte nicht versendet werden.`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Einladung erneut versendet." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("resend-invite error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
