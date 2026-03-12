import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


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

    // Auth + role check in parallel
    const [{ data: { user }, error: userError }, body] = await Promise.all([
      supabaseAuth.auth.getUser(),
      req.json(),
    ]);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRoles } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .limit(1);

    if (!callerRoles?.length) {
      return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, email, tenant_name, contact_name } = body;

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

    // Check if user exists by trying to find them via email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
      filter: { email },
    } as any);
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: crypto.randomUUID(),
        email_confirm: true,
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = userData.user.id;
    }

    // Role + Profile + Invite link in parallel
    const [,, { data: linkData, error: linkError }] = await Promise.all([
      supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id,role" }),
      supabaseAdmin
        .from("profiles")
        .upsert({ user_id: userId, tenant_id }, { onConflict: "user_id" }),
      supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: `${APP_URL}/set-password` },
      }),
    ]);

    if (linkError) {
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviteLink = linkData.properties?.action_link || "";

    // Return response IMMEDIATELY - email sends in background
    const response = new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email_sent: true,
        message: "Benutzer erstellt und Einladungs-E-Mail wird versendet.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    // Fire-and-forget: send email AFTER response (no await)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
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

      // Fire and forget - don't await, no DB query for template
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GoBD-Suite <noreply@vd.gaetanoficarra.de>",
          to: [email],
          subject: defaultSubject,
          html: defaultHtml(greeting, displayName, inviteLink),
        }),
      }).catch((err) => console.error("Email send failed:", err));
    }

    return response;
  } catch (e) {
    console.error("invite-tenant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
