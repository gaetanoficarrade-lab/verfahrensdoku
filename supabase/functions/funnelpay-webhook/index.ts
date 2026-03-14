import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const APP_URL = "https://vd.gaetanoficarra.de";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let eventType = "unknown";
  let customerEmail = "";
  let logId: string | null = null;

  try {
    // Auth: check webhook secret
    const secret = req.headers.get("x-webhook-secret") || req.headers.get("X-Webhook-Secret");
    const expectedSecret = Deno.env.get("FUNNELPAY_WEBHOOK_SECRET");

    if (!expectedSecret || secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    eventType = payload.type || payload.event || "unknown";
    const data = payload.data?.object || payload.data || payload;
    customerEmail = (data.customer_email || data.email || "").trim().toLowerCase();

    // Log incoming webhook
    const { data: logEntry } = await supabaseAdmin
      .from("webhook_logs")
      .insert({
        source: "funnelpay",
        event_type: eventType,
        customer_email: customerEmail || null,
        payload: payload,
        status: "processing",
      })
      .select("id")
      .single();
    logId = logEntry?.id || null;

    // Product → Plan mapping
    const PRODUCT_SOLO = Deno.env.get("FUNNELPAY_PRODUCT_SOLO") || "";
    const PRODUCT_BERATER = Deno.env.get("FUNNELPAY_PRODUCT_BERATER") || "";
    const PRODUCT_AGENTUR = Deno.env.get("FUNNELPAY_PRODUCT_AGENTUR") || "";

    const detectPlan = (productId: string, productName?: string): string | null => {
      const val = (productId || "").toLowerCase();
      const name = (productName || "").toLowerCase();
      if (val === PRODUCT_SOLO.toLowerCase() || name.includes("solo")) return "solo";
      if (val === PRODUCT_BERATER.toLowerCase() || name.includes("berater")) return "berater";
      if (val === PRODUCT_AGENTUR.toLowerCase() || name.includes("agentur")) return "agentur";
      return null;
    };

    const getProductInfo = () => {
      const productId = data.product_id || data.product || data.items?.[0]?.price?.product || "";
      const productName = data.product_name || data.items?.[0]?.description || "";
      return { productId, productName };
    };

    // Helper: send email via send-email function
    const sendEmail = async (to: string, subject: string, html: string) => {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) {
        console.error("RESEND_API_KEY not configured");
        return;
      }
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "GoBD-Suite <noreply@vd.gaetanoficarra.de>",
          to: [to],
          subject,
          html,
        }),
      });
    };

    const sendAdminAlert = async (subject: string, body: string) => {
      const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gaetanoficarra.de@gmail.com";
      await sendEmail(adminEmail, subject, body);
    };

    // Helper: find plan ID by name
    const findPlanId = async (planName: string): Promise<string | null> => {
      const { data: plan } = await supabaseAdmin
        .from("plans")
        .select("id")
        .ilike("name", planName)
        .maybeSingle();
      return plan?.id || null;
    };

    // Helper: find or create tenant
    const findOrCreateTenant = async (planName: string) => {
      if (!customerEmail) throw new Error("No customer email in webhook payload");

      // Check existing
      const { data: existing } = await supabaseAdmin
        .from("tenants")
        .select("id, subscription_status")
        .eq("contact_email", customerEmail)
        .maybeSingle();

      const planId = await findPlanId(planName);
      const customerName = data.customer_name || data.name || data.customer_details?.name || "";
      const companyName = data.customer_company_name || data.company || data.customer_details?.company || "";

      // ALL plans start as trialing with 7-day trial
      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      if (existing) {
        // Update subscription
        await supabaseAdmin
          .from("tenants")
          .update({
            plan_id: planId,
            subscription_status: "trialing",
            stripe_customer_id: data.customer || data.customer_id || null,
            stripe_subscription_id: data.subscription || data.subscription_id || null,
            trial_ends_at: trialEndsAt,
            trial_active: true,
            source: "funnelpay",
          })
          .eq("id", existing.id);
        return existing.id;
      }

      // Create new tenant
      const { data: newTenant, error: tErr } = await supabaseAdmin
        .from("tenants")
        .insert({
          name: companyName || customerName || customerEmail,
          contact_name: customerName || null,
          contact_email: customerEmail,
          plan_id: planId,
          is_active: true,
          subscription_status: "trialing",
          stripe_customer_id: data.customer || data.customer_id || null,
          stripe_subscription_id: data.subscription || data.subscription_id || null,
          trial_ends_at: trialEndsAt,
          trial_active: true,
          source: "funnelpay",
        })
        .select("id")
        .single();

      if (tErr) throw new Error(`Tenant creation failed: ${tErr.message}`);
      return newTenant!.id;
    };

    // Helper: create user + invite token + send welcome email
    const createUserAndInvite = async (tenantId: string, planName: string) => {
      const customerName = data.customer_name || data.name || data.customer_details?.name || "";

      // Create auth user
      const normalizedEmail = customerEmail;
      const nameParts = (customerName || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Check if user already exists
      let userId: string | null = null;
      let page = 1;
      while (page <= 10) {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        const users = usersData?.users || [];
        const found = users.find((u: any) => (u.email || "").toLowerCase() === normalizedEmail);
        if (found) { userId = found.id; break; }
        if (users.length < 200) break;
        page++;
      }

      if (!userId) {
        const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: crypto.randomUUID(),
          email_confirm: true,
          user_metadata: { first_name: firstName, last_name: lastName, tenant_id: tenantId },
        });
        if (createErr && !createErr.message?.toLowerCase().includes("already been registered")) {
          throw new Error(`User creation failed: ${createErr.message}`);
        }
        userId = newUser?.user?.id || null;
      }

      if (userId) {
        await Promise.all([
          supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "tenant_admin" }, { onConflict: "user_id,role" }),
          supabaseAdmin.from("profiles").upsert({
            user_id: userId, tenant_id: tenantId,
            first_name: firstName || null, last_name: lastName || null, email: normalizedEmail,
          }, { onConflict: "user_id" }),
        ]);
      }

      // Create invite token
      const token = crypto.randomUUID();
      await supabaseAdmin.from("invite_tokens").insert({
        token,
        tenant_id: tenantId,
        email: normalizedEmail,
        is_active: true,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Send welcome email
      const inviteLink = `${APP_URL}/register?token=${token}`;
      const planLabel = planName === "solo" ? "Solo" : planName === "berater" ? "Berater" : "Agentur";
      const greeting = firstName ? `Hallo ${firstName},` : "Sehr geehrte Damen und Herren,";

      const trialHint = `<p style="color: #555; font-size: 15px; line-height: 1.6;">Ihr <strong>${planLabel}</strong>-Zugang startet mit einer 7-tägigen Testphase.</p>`;

      await sendEmail(
        normalizedEmail,
        "Willkommen bei GoBD-Suite – Ihr Zugang ist bereit",
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a;">Willkommen bei GoBD-Suite</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">${greeting}</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Vielen Dank für Ihren Kauf des <strong>${planLabel}</strong>-Plans. Ihr Zugang ist bereit!
          </p>
          ${trialHint}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">
              Zugang einrichten
            </a>
          </div>
          <p style="color: #999; font-size: 13px;">
            Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
            <a href="${inviteLink}" style="color: #999;">${inviteLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">Der Link ist 7 Tage gültig.</p>
        </div>`
      );
    };

    // ─── Event Handlers ───

    switch (eventType) {
      case "checkout.session.completed": {
        const { productId, productName } = getProductInfo();
        const planName = detectPlan(productId, productName);
        if (!planName) {
          await sendAdminAlert(
            "⚠ Funnelpay Webhook Fehler",
            `<p>Unbekanntes Produkt bei checkout.session.completed</p>
             <p>Produkt-ID: ${productId}</p><p>Kunde: ${customerEmail}</p>`
          );
          break;
        }
        const tenantId = await findOrCreateTenant(planName);
        await createUserAndInvite(tenantId, planName);
        break;
      }

      case "customer.subscription.created": {
        const { productId, productName } = getProductInfo();
        const planName = detectPlan(productId, productName);
        if (!planName) {
          await sendAdminAlert(
            "⚠ Funnelpay Webhook Fehler",
            `<p>Unbekanntes Produkt bei subscription.created</p>
             <p>Produkt-ID: ${productId}</p><p>Kunde: ${customerEmail}</p>`
          );
          break;
        }
        const tenantId = await findOrCreateTenant(planName);
        await createUserAndInvite(tenantId, planName);
        break;
      }

      case "funnelpay.subscription.renewed": {
        if (customerEmail) {
          await supabaseAdmin
            .from("tenants")
            .update({
              subscription_status: "active",
              trial_active: false,
              solo_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq("contact_email", customerEmail);
        }
        break;
      }

      case "funnelpay.subscription.cancelled": {
        if (customerEmail) {
          await supabaseAdmin
            .from("tenants")
            .update({ subscription_status: "canceled" })
            .eq("contact_email", customerEmail);

          await sendEmail(
            customerEmail,
            "Ihr GoBD-Suite Zugang wurde beendet",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a1a;">Abo beendet</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Ihr GoBD-Suite Zugang wurde beendet. Ihre Daten bleiben noch 30 Tage abrufbar.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Sollten Sie Ihr Abo reaktivieren wollen, kontaktieren Sie uns gerne unter 
                <a href="mailto:gaetanoficarra.de@gmail.com">gaetanoficarra.de@gmail.com</a>.
              </p>
            </div>`
          );
        }
        break;
      }

      case "funnelpay.subscription.payment_failed": {
        if (customerEmail) {
          // Count failed attempts
          const { count } = await supabaseAdmin
            .from("webhook_logs")
            .select("id", { count: "exact", head: true })
            .eq("source", "funnelpay")
            .eq("event_type", "funnelpay.subscription.payment_failed")
            .eq("customer_email", customerEmail);

          const failCount = (count || 0) + 1; // including this one

          if (failCount >= 3) {
            // Suspend account
            await supabaseAdmin
              .from("tenants")
              .update({ subscription_status: "suspended", is_active: false })
              .eq("contact_email", customerEmail);
          } else {
            await supabaseAdmin
              .from("tenants")
              .update({ subscription_status: "past_due" })
              .eq("contact_email", customerEmail);
          }

          await sendEmail(
            customerEmail,
            "Zahlung fehlgeschlagen – Bitte Zahlungsmittel prüfen",
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a1a1a;">Zahlung fehlgeschlagen</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">
                Leider konnte Ihre letzte Zahlung nicht verarbeitet werden. 
                Bitte aktualisieren Sie Ihr Zahlungsmittel in Funnelpay.
              </p>
              <p style="color: #d32f2f; font-size: 14px;">
                ${failCount >= 3 ? "Ihr Account wurde aufgrund wiederholter Zahlungsfehler gesperrt." : `Nach ${3 - failCount} weiteren fehlgeschlagenen Versuchen wird Ihr Account gesperrt.`}
              </p>
            </div>`
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        if (customerEmail) {
          const { productId, productName } = getProductInfo();
          const planName = detectPlan(productId, productName);
          if (planName) {
            const planId = await findPlanId(planName);
            await supabaseAdmin
              .from("tenants")
              .update({ plan_id: planId, subscription_status: "active" })
              .eq("contact_email", customerEmail);
          }
        }
        break;
      }

      default:
        // Unknown event, ignore
        break;
    }

    // Update log to success
    if (logId) {
      await supabaseAdmin
        .from("webhook_logs")
        .update({ status: "processed" })
        .eq("id", logId);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("funnelpay-webhook error:", e);

    // Update log to error
    if (logId) {
      await supabaseAdmin
        .from("webhook_logs")
        .update({ status: "error", error_message: e instanceof Error ? e.message : String(e) })
        .eq("id", logId);
    }

    // Notify admin
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const adminEmail = Deno.env.get("ADMIN_EMAIL") || "gaetanoficarra.de@gmail.com";
      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "GoBD-Suite <noreply@vd.gaetanoficarra.de>",
            to: [adminEmail],
            subject: "⚠ Funnelpay Webhook Fehler",
            html: `<p>Event: ${eventType}</p><p>Kunde: ${customerEmail}</p><p>Fehler: ${e instanceof Error ? e.message : String(e)}</p>`,
          }),
        });
      }
    } catch { /* ignore alert failure */ }

    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
