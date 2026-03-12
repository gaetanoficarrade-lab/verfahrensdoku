import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function hmacSign(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

    const userId = user.id;

    const { data: profile } = await supabaseAuth
      .from("profiles")
      .select("tenant_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: "No tenant" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event, data: eventData } = await req.json();

    if (!event) {
      return new Response(JSON.stringify({ error: "event required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tenantId = profile.tenant_id;

    // Use service role to read webhooks and write logs (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch all active webhooks for this tenant that subscribe to this event
    const { data: webhooks, error: whError } = await supabaseAdmin
      .from("tenant_webhooks")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true);

    if (whError) {
      console.error("Error fetching webhooks:", whError);
      return new Response(JSON.stringify({ error: "Failed to fetch webhooks" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter webhooks that subscribe to this event
    const matchingWebhooks = (webhooks || []).filter(
      (wh: any) => !wh.events || wh.events.length === 0 || wh.events.includes(event)
    );

    if (matchingWebhooks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, dispatched: 0, message: "No matching webhooks" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const webhook of matchingWebhooks) {
      const payload = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        tenant_id: tenantId,
        data: eventData || {},
      });

      const fetchHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (webhook.secret) {
        const signature = await hmacSign(webhook.secret, payload);
        fetchHeaders["X-GoBD-Signature"] = `sha256=${signature}`;
      }

      let statusCode: number | null = null;
      let responseBody = "";
      let success = false;

      try {
        const resp = await fetch(webhook.url, {
          method: "POST",
          headers: fetchHeaders,
          body: payload,
        });
        statusCode = resp.status;
        responseBody = await resp.text();
        success = resp.ok;
      } catch (fetchErr: any) {
        responseBody = fetchErr.message || "Connection failed";
      }

      // Log result
      await supabaseAdmin.from("webhook_logs").insert({
        webhook_id: webhook.id,
        event,
        payload: JSON.parse(payload),
        response_status: statusCode,
        response_body: responseBody?.substring(0, 2000),
      });

      results.push({ webhook_id: webhook.id, success, status_code: statusCode });
    }

    return new Response(
      JSON.stringify({ success: true, dispatched: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
