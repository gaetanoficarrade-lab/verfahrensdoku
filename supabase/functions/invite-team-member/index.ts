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
    if (!roleNames.includes("super_admin") && !roleNames.includes("tenant_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, email, role } = await req.json();

    if (!tenant_id) {
      return new Response(
        JSON.stringify({ error: "tenant_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validRoles = ["tenant_admin", "tenant_user"];
    const assignRole = validRoles.includes(role) ? role : "tenant_user";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create invite token — client_id is NULL for team invites
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from("invite_tokens")
      .insert({
        tenant_id,
        client_id: null,
      })
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

    // Send invitation email if email provided
    let emailSent = false;
    if (email) {
      const inviteLink = `${APP_URL}/register?token=${invite.token}`;
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const roleName = assignRole === "tenant_admin" ? "Administrator" : "Mitarbeiter";
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${brandName} <noreply@gaetanoficarra.de>`,
            to: [email],
            subject: `Teameinladung – ${brandName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a1a;">Einladung zum Team</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  Sie wurden als <strong>${roleName}</strong> in das Team von ${brandName} eingeladen.
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
        emailSent = emailRes.ok;
        if (!emailRes.ok) {
          console.error("Failed to send team invite email:", await emailRes.text());
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invite_id: invite.id,
        token: invite.token,
        role: assignRole,
        email_sent: emailSent,
        message: emailSent
          ? "Einladungslink erstellt und E-Mail versendet."
          : "Einladungslink erstellt.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("invite-team-member error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
