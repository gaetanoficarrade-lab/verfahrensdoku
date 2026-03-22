import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { tenantName, userName, userEmail, title, description, screenshotUrl } = await req.json();

    const adminUrl = "https://gobd-suite.de/admin/support";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Neue Support-Anfrage</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #666; width: 120px;">Tenant:</td><td style="padding: 8px 0; font-weight: bold;">${tenantName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Nutzer:</td><td style="padding: 8px 0;">${userName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">E-Mail:</td><td style="padding: 8px 0;">${userEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Titel:</td><td style="padding: 8px 0; font-weight: bold;">${title}</td></tr>
        </table>
        ${description ? `<div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;"><p style="margin: 0; white-space: pre-wrap;">${description}</p></div>` : ''}
        ${screenshotUrl ? `<p><a href="${screenshotUrl}" style="color: #0891b2;">Screenshot ansehen</a></p>` : ''}
        <p style="margin-top: 24px;">
          <a href="${adminUrl}" style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Im Dashboard ansehen</a>
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GoBD-Suite Support <noreply@gobd-suite.de>",
        to: ["gaetanoficarra.de@gmail.com"],
        subject: `[Support] ${title}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-support-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
