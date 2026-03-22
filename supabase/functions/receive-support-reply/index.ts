import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const payload = await req.json();

    // Extract request_id from the "to" address: support+{uuid}@gobd-suite.de
    const toAddresses = payload.to || [];
    let requestId: string | null = null;

    for (const addr of toAddresses) {
      const match = (typeof addr === 'string' ? addr : addr?.address || '').match(/support\+([a-f0-9-]{36})@/i);
      if (match) {
        requestId = match[1];
        break;
      }
    }

    if (!requestId) {
      console.error("Could not extract request_id from to addresses:", toAddresses);
      return new Response(JSON.stringify({ error: "Invalid recipient" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the original request
    const { data: request } = await supabase
      .from("support_requests")
      .select("id, user_name, user_email")
      .eq("id", requestId)
      .maybeSingle();

    if (!request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clean reply text: remove quoted lines (lines starting with >)
    let bodyText = payload.text || payload.html?.replace(/<[^>]*>/g, '') || '';
    bodyText = bodyText
      .split('\n')
      .filter((line: string) => !line.trim().startsWith('>'))
      .join('\n')
      .trim();

    if (!bodyText) bodyText = '(Leere Antwort)';

    const senderName = payload.from?.name || payload.from?.address || request.user_name || 'Nutzer';

    // Save message
    await supabase.from("support_messages").insert({
      request_id: requestId,
      sender_type: "user",
      sender_name: senderName,
      body: bodyText,
      email_id: payload.email_id || null,
    });

    // Update request status and unread flag
    await supabase
      .from("support_requests")
      .update({ status: "open", admin_unread: true })
      .eq("id", requestId);

    // Notify admin
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Neue Antwort auf Support-Anfrage</h2>
        <p style="color: #666;">Von: ${senderName} (${request.user_email})</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-wrap;">${bodyText}</p>
        </div>
        <p>
          <a href="https://gobd-suite.de/admin/support" style="display: inline-block; background: #0891b2; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Im Dashboard ansehen</a>
        </p>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GoBD-Suite Support <noreply@gobd-suite.de>",
        to: ["gaetanoficarra.de@gmail.com"],
        subject: `[Support] Neue Antwort von ${senderName}`,
        html,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("receive-support-reply error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
