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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Get user's tenant
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

    const { webhook_id } = await req.json();
    if (!webhook_id) {
      return new Response(JSON.stringify({ error: "webhook_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch webhook (RLS ensures tenant isolation)
    const { data: webhook, error: whError } = await supabaseAuth
      .from("tenant_webhooks")
      .select("*")
      .eq("id", webhook_id)
      .single();

    if (whError || !webhook) {
      return new Response(JSON.stringify({ error: "Webhook not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build test payload
    const testPayload = JSON.stringify({
      event: "test",
      timestamp: new Date().toISOString(),
      data: {
        message: "Dies ist ein Test-Webhook von der GoBD-Suite.",
        webhook_id: webhook.id,
      },
    });

    // Build headers
    const fetchHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (webhook.secret) {
      const signature = await hmacSign(webhook.secret, testPayload);
      fetchHeaders["X-Webhook-Signature"] = signature;
    }

    // Send webhook
    let statusCode: number | null = null;
    let responseBody = "";
    let success = false;

    try {
      const resp = await fetch(webhook.url, {
        method: "POST",
        headers: fetchHeaders,
        body: testPayload,
      });
      statusCode = resp.status;
      responseBody = await resp.text();
      success = resp.ok;
    } catch (fetchErr: any) {
      responseBody = fetchErr.message || "Connection failed";
    }

    // Log the result using service role to bypass RLS for insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabaseAdmin.from("webhook_logs").insert({
      webhook_id: webhook.id,
      tenant_id: profile.tenant_id,
      event: "test",
      status_code: statusCode,
      response_body: responseBody?.substring(0, 1000),
      success,
    });

    return new Response(
      JSON.stringify({ success, status_code: statusCode, response: responseBody?.substring(0, 200) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("test-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
