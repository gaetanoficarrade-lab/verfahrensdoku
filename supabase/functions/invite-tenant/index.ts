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

    // Parse body and validate caller via both auth paths for self-hosted compatibility
    const token = authHeader.replace("Bearer ", "");
    const [
      { data: userData, error: userError },
      { data: claimsData, error: claimsError },
      body,
    ] = await Promise.all([
      supabaseAuth.auth.getUser(),
      supabaseAuth.auth.getClaims(token),
      req.json(),
    ]);

    const callerId = userData?.user?.id || claimsData?.claims?.sub || null;

    if (!callerId) {
      return new Response(JSON.stringify({
        error: "Unauthorized",
        details: {
          get_user: userError?.message || null,
          get_claims: claimsError?.message || null,
        },
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Role check
    const { data: callerRoles } = await supabaseAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "super_admin")
      .limit(1);

    if (!callerRoles?.length) {
      return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenant_id, email } = body;

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

    const normalizedEmail = String(email).trim().toLowerCase();

    const findUserByEmail = async () => {
      let page = 1;
      const perPage = 200;

      while (page <= 10) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) {
          console.error("listUsers error:", error.message);
          break;
        }

        const users = data?.users || [];
        const found = users.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
        if (found) return found;

        if (users.length < perPage) break;
        page += 1;
      }

      return null;
    };

    let existingUser = await findUserByEmail();
    let isExistingUser = !!existingUser;
    let userId: string | null = existingUser?.id || null;

    if (!existingUser) {
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
      });

      if (createError) {
        const alreadyRegistered = createError.message?.toLowerCase().includes("already been registered");

        if (!alreadyRegistered) {
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Existing user, even if we cannot resolve user_id reliably
        isExistingUser = true;
        existingUser = await findUserByEmail();
        userId = existingUser?.id || null;
      } else {
        userId = userData.user.id;
        isExistingUser = false;
      }
    }

    // Role + Profile best-effort (only when userId is known)
    if (userId) {
      await Promise.all([
        supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id,role" }),
        supabaseAdmin
          .from("profiles")
          .upsert({ user_id: userId, tenant_id }, { onConflict: "user_id" }),
      ]);
    }

    // Generate link: existing users -> recovery, new users -> invite
    let linkType: "invite" | "recovery" = isExistingUser ? "recovery" : "invite";
    let { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: linkType,
      email: normalizedEmail,
      options: { redirectTo: `${APP_URL}/set-password` },
    });

    // Safety fallback: if invite fails with duplicate user, switch to recovery
    if (linkError && linkType === "invite" && linkError.message?.toLowerCase().includes("already been registered")) {
      linkType = "recovery";
      const retry = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: normalizedEmail,
        options: { redirectTo: `${APP_URL}/set-password` },
      });
      linkData = retry.data;
      linkError = retry.error;
    }

    if (linkError) {
      return new Response(JSON.stringify({ error: linkError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const inviteLink = linkData.properties?.action_link || "";

    // Return immediately — no email sending here
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        invite_link: inviteLink,
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
