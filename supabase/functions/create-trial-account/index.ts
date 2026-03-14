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
    const { email, password, first_name, last_name, company_name } = await req.json();

    if (!email || !password || !company_name) {
      return new Response(
        JSON.stringify({ error: "E-Mail, Passwort und Firmenname sind erforderlich." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if email already exists
    let existingUserId: string | null = null;
    let page = 1;
    while (page <= 10) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      const users = usersData?.users || [];
      const found = users.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());
      if (found) { existingUserId = found.id; break; }
      if (users.length < 200) break;
      page++;
    }

    if (existingUserId) {
      return new Response(
        JSON.stringify({ error: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create tenant (trialing, no plan)
    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: tenant, error: tenantErr } = await supabaseAdmin
      .from("tenants")
      .insert({
        name: company_name,
        contact_name: `${first_name || ""} ${last_name || ""}`.trim() || null,
        contact_email: email.toLowerCase(),
        plan_id: null,
        is_active: true,
        subscription_status: "trialing",
        trial_ends_at: trialEndsAt,
        trial_active: true,
        source: "self_registration",
      })
      .select("id")
      .single();

    if (tenantErr) {
      throw new Error(`Tenant-Erstellung fehlgeschlagen: ${tenantErr.message}`);
    }

    const tenantId = tenant.id;

    // 2. Create auth user
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        first_name: first_name || "",
        last_name: last_name || "",
        tenant_id: tenantId,
      },
    });

    if (createErr) {
      // Rollback tenant
      await supabaseAdmin.from("tenants").delete().eq("id", tenantId);
      throw new Error(`Benutzer-Erstellung fehlgeschlagen: ${createErr.message}`);
    }

    const userId = newUser.user.id;

    // 3. Create profile + role
    await Promise.all([
      supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "tenant_admin" }),
      supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        tenant_id: tenantId,
        first_name: first_name || null,
        last_name: last_name || null,
        email: email.toLowerCase(),
      }, { onConflict: "user_id" }),
    ]);

    // 4. Create demo client "Muster GmbH"
    const { data: client } = await supabaseAdmin
      .from("clients")
      .insert({
        tenant_id: tenantId,
        company: "Muster GmbH",
        industry: "Unternehmensberatung",
        contact_name: "Max Mustermann",
        contact_email: "mustermann@muster-gmbh.de",
        legal_form: "GmbH",
        founding_year: 2020,
        has_employees: true,
        accounting_mode: "Soll-Versteuerung",
        has_business_account: true,
        accounting_contact: "Max Mustermann",
        onboarding_status: "completed",
      })
      .select("id")
      .single();

    if (client) {
      // 5. Create project
      const { data: project } = await supabaseAdmin
        .from("projects")
        .insert({
          tenant_id: tenantId,
          client_id: client.id,
          name: "Verfahrensdokumentation 2024",
          status: "active",
          workflow_status: "in_progress",
        })
        .select("id")
        .single();

      if (project) {
        // 6. Create onboarding (completed)
        const demoOnboarding = {
          company_name: "Muster GmbH",
          legal_form: "GmbH",
          industry: "Unternehmensberatung",
          founding_year: "2020",
          HAS_EMPLOYEES: true,
          HAS_TAX_ADVISOR: true,
          ACCOUNTING_CONTACT: "Max Mustermann",
          BOOKKEEPING_BY: "tax_advisor",
          document_transfer_method: "DATEV Unternehmen online",
          INVOICE_CREATION_TYPE: "lexoffice",
          HAS_CASH: false,
          USES_PAYMENT_PROVIDER: false,
          USES_MARKETPLACE: false,
          HAS_E_INVOICING: "no",
          SOFTWARE_LIST: "Lexoffice, Microsoft 365, DATEV",
          USES_CLOUD: "yes",
          HAS_BUSINESS_ACCOUNT: true,
          USES_ONLINE_BANKING: true,
          HAS_AUTO_BANK_IMPORT: "yes",
          DOCUMENT_TYPE: "digital",
          HAS_SCAN_PROCESS: false,
        };

        await supabaseAdmin.from("project_onboarding").insert({
          project_id: project.id,
          answers: demoOnboarding,
          completed_at: new Date().toISOString(),
        });
      }
    }

    // 5. Create tenant settings
    await supabaseAdmin.from("tenant_settings").insert({
      tenant_id: tenantId,
      brand_name: company_name,
    });

    return new Response(
      JSON.stringify({ success: true, tenant_id: tenantId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-trial-account error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
