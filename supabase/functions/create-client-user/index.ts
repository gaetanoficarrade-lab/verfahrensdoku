import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Auth check - only admins should call this
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

    // Check caller is super_admin or tenant_admin
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

    const { email, password, client_id, tenant_id, role } = await req.json();

    if (!email || !password || !tenant_id) {
      return new Response(
        JSON.stringify({ error: "email, password, tenant_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine role: 'tenant_user' for team members, 'client' for client users
    const assignRole = role === "tenant_user" ? "tenant_user" : "client";

    // Use service role to create user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create auth user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Assign client role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "client" });

    if (roleError) {
      console.error("Role insert error:", roleError);
    }

    // Create profile with tenant_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({ user_id: userId, tenant_id });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    // Link user to client record
    const { error: clientError } = await supabaseAdmin
      .from("clients")
      .update({ user_id: userId })
      .eq("id", client_id);

    if (clientError) {
      console.error("Client link error:", clientError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        message: `Account ${email} erstellt und mit Mandant verknüpft.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-client-user error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
