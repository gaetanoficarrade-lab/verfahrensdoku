import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { loadEmailTemplate, applyPlaceholders } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APP_URL = "https://vd.gaetanoficarra.de";

const defaultSubject = "Willkommen bei GoBD-Suite – Ihr Zugang";
const defaultHtml = (greeting: string, displayName: string, inviteLink: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a;">Willkommen bei GoBD-Suite</h2>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">${greeting}</p>
  <p style="color: #555; font-size: 16px; line-height: 1.6;">
    Ihr Lizenznehmer-Konto <strong>${displayName}</strong> wurde erstellt. 
    Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen:
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${inviteLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
      Passwort festlegen
    </a>
  </div>
  <p style="color: #999; font-size: 13px;">
    Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
    <a href="${inviteLink}" style="color: #999;">${inviteLink}</a>
  </p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Der Link ist 24 Stunden gültig. Diese E-Mail wurde von GoBD-Suite versendet.</p>
</div>`;

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
    if (!roleNames.includes("super_admin")) {
      return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, email, tenant_name, contact_name } = await req.json();

    if (!tenant_id || !email) {
      return new Response(
        JSON.stringify({ error: "tenant_id and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      // User already exists - just use their ID
      userId = existingUser.id;

      // Ensure role exists (ignore conflicts)
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id,role" });

      // Ensure profile exists and is linked to tenant
      await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, tenant_id }, { onConflict: "user_id" });
    } else {
      // 2. Create auth user with a random password (they'll set their own via invite link)
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      userId = userData.user.id;

      // 3. Assign tenant_admin role
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id,role" });

      // 4. Create profile with tenant_id
      await supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, tenant_id }, { onConflict: "user_id" });
    }

    // 5. Generate an invite link (this creates a magic link for password setup)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: `${APP_URL}/set-password`,
      },
    });

    if (linkError) {
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The generated link contains a token - extract and build our redirect URL
    // The link format from Supabase is: SUPABASE_URL/auth/v1/verify?token=...&type=invite&redirect_to=...
    const inviteLink = linkData.properties?.action_link || "";

    // 6. Send the email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (RESEND_API_KEY && inviteLink) {
      const displayName = tenant_name || "Ihr Unternehmen";
      const greeting = contact_name ? `Hallo ${contact_name},` : "Sehr geehrte Damen und Herren,";

      const placeholders: Record<string, string> = {
        greeting,
        tenant_name: displayName,
        plattform: "GoBD-Suite",
        brand_name: "GoBD-Suite",
        link: inviteLink,
      };

      const { template: customTemplate, logoUrl } = await loadEmailTemplate("tenant_invite");
      const subject = customTemplate
        ? applyPlaceholders(customTemplate.subject, placeholders, logoUrl)
        : defaultSubject;
      const html = customTemplate
        ? applyPlaceholders(customTemplate.html, placeholders, logoUrl)
        : defaultHtml(greeting, displayName, inviteLink);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GoBD-Suite <noreply@vd.gaetanoficarra.de>",
          to: [email],
          subject,
          html,
        }),
      });

      emailSent = emailRes.ok;
      if (!emailRes.ok) {
        console.error("Failed to send tenant invite email:", await emailRes.text());
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email_sent: emailSent,
        message: emailSent
          ? "Benutzer erstellt und Einladungs-E-Mail mit Passwort-Link versendet."
          : "Benutzer erstellt, E-Mail konnte nicht versendet werden.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("invite-tenant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
