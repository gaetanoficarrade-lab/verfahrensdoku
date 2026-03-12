import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailTemplateStructured {
  subject: string;
  heading: string;
  body: string;
  buttonText: string;
  footerNote?: string;
}

interface EmailTemplateResult {
  subject: string;
  html: string;
}

/** Build HTML from structured template fields */
function buildHtml(t: EmailTemplateStructured, logoUrl?: string | null): string {
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="Logo" style="max-height: 48px; margin-bottom: 20px;" />`
    : '';

  const bodyParagraphs = t.body
    .split('\n')
    .filter((line: string) => line.trim() !== '')
    .map((line: string) => `<p style="color: #555; font-size: 16px; line-height: 1.6;">${line}</p>`)
    .join('\n  ');

  const buttonHtml = t.buttonText
    ? `<div style="text-align: center; margin: 30px 0;">
    <a href="{{link}}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px; display: inline-block;">${t.buttonText}</a>
  </div>
  <p style="color: #999; font-size: 13px;">Falls der Button nicht funktioniert:<br/><a href="{{link}}" style="color: #999;">{{link}}</a></p>`
    : '';

  const footerHtml = t.footerNote
    ? `<p style="color: #999; font-size: 12px;">${t.footerNote}</p>`
    : '';

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${logoHtml}
  <h2 style="color: #1a1a1a;">${t.heading}</h2>
  ${bodyParagraphs}
  ${buttonHtml}
  ${footerHtml}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;"/>
  <p style="color: #999; font-size: 12px;">Diese E-Mail wurde von {{brand_name}} versendet.</p>
</div>`;
}

/**
 * Load a specific email template. Priority:
 * 1. Tenant-level template (from tenant_settings.email_templates)
 * 2. Platform-level template (from platform_settings.email_templates_v2)
 * 3. null (caller should use hardcoded default)
 */
export async function loadEmailTemplate(
  templateKey: string,
  tenantId?: string | null
): Promise<{ template: EmailTemplateResult | null; logoUrl: string | null }> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Try tenant-level template
    if (tenantId) {
      const { data: tenantData } = await supabase
        .from("tenant_settings")
        .select("email_templates, email_logo_url")
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (tenantData) {
        const templates = tenantData.email_templates as Record<string, EmailTemplateStructured> | null;
        const tenantLogo = (tenantData as any).email_logo_url || null;
        
        if (templates?.[templateKey]?.heading && templates[templateKey]?.body) {
          const t = templates[templateKey];
          return {
            template: { subject: t.subject, html: buildHtml(t, tenantLogo) },
            logoUrl: tenantLogo,
          };
        }
        // If tenant has a logo but no custom template, continue to platform level but keep tenant logo
        if (tenantLogo) {
          const platformResult = await loadPlatformTemplate(supabase, templateKey);
          return {
            template: platformResult.template,
            logoUrl: tenantLogo,
          };
        }
      }
    }

    // 2. Try platform-level template
    return await loadPlatformTemplate(supabase, templateKey);
  } catch (err) {
    console.error("Failed to load email template:", err);
    return { template: null, logoUrl: null };
  }
}

async function loadPlatformTemplate(
  supabase: any,
  templateKey: string
): Promise<{ template: EmailTemplateResult | null; logoUrl: string | null }> {
  const [templatesRes, logoRes] = await Promise.all([
    supabase.from("platform_settings").select("value").eq("key", "email_templates_v2").maybeSingle(),
    supabase.from("platform_settings").select("value").eq("key", "email_logo_url").maybeSingle(),
  ]);

  let template: EmailTemplateResult | null = null;
  let logoUrl: string | null = null;

  if (logoRes.data?.value) {
    const val = logoRes.data.value as { url?: string };
    if (val.url) logoUrl = val.url;
  }

  if (templatesRes.data?.value) {
    const templates = templatesRes.data.value as Record<string, EmailTemplateStructured>;
    if (templates[templateKey]?.heading && templates[templateKey]?.body) {
      const t = templates[templateKey];
      template = { subject: t.subject, html: buildHtml(t, logoUrl) };
    }
  }

  return { template, logoUrl };
}

/**
 * Replace placeholders like {{key}} in a string with values from a map.
 */
export function applyPlaceholders(
  template: string,
  values: Record<string, string>,
  logoUrl?: string | null
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  if (logoUrl) {
    result = result.split("{{logo_url}}").join(logoUrl);
  } else {
    result = result.replace(/<img[^>]*\{\{logo_url\}\}[^>]*>/g, "");
    result = result.split("{{logo_url}}").join("");
  }
  return result;
}
