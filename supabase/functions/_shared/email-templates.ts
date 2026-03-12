import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailTemplate {
  subject: string;
  html: string;
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
): Promise<{ template: EmailTemplate | null; logoUrl: string | null }> {
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
        const templates = tenantData.email_templates as Record<string, EmailTemplate> | null;
        if (templates?.[templateKey]?.subject && templates[templateKey]?.html) {
          return {
            template: templates[templateKey],
            logoUrl: (tenantData as any).email_logo_url || null,
          };
        }
        // If tenant has a logo but no custom template, continue to platform level but keep tenant logo
        if ((tenantData as any).email_logo_url) {
          const platformResult = await loadPlatformTemplate(supabase, templateKey);
          return {
            template: platformResult.template,
            logoUrl: (tenantData as any).email_logo_url,
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
): Promise<{ template: EmailTemplate | null; logoUrl: string | null }> {
  const [templatesRes, logoRes] = await Promise.all([
    supabase.from("platform_settings").select("value").eq("key", "email_templates_v2").maybeSingle(),
    supabase.from("platform_settings").select("value").eq("key", "email_logo_url").maybeSingle(),
  ]);

  let template: EmailTemplate | null = null;
  let logoUrl: string | null = null;

  if (templatesRes.data?.value) {
    const templates = templatesRes.data.value as Record<string, EmailTemplate>;
    if (templates[templateKey]?.subject && templates[templateKey]?.html) {
      template = templates[templateKey];
    }
  }

  if (logoRes.data?.value) {
    const val = logoRes.data.value as { url?: string };
    if (val.url) logoUrl = val.url;
  }

  return { template, logoUrl };
}

/**
 * Replace placeholders like {{key}} in a string with values from a map.
 * Also handles {{logo_url}} if logoUrl is provided.
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
    // Remove logo img tags if no logo
    result = result.replace(/<img[^>]*\{\{logo_url\}\}[^>]*>/g, "");
    result = result.split("{{logo_url}}").join("");
  }
  return result;
}
