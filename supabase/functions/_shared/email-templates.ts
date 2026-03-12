import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Load a specific email template from platform_settings.
 * Falls back to null if not found (caller should use hardcoded default).
 */
export async function loadEmailTemplate(
  templateKey: string
): Promise<EmailTemplate | null> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "email_templates_v2")
      .maybeSingle();

    if (data?.value && typeof data.value === "object") {
      const templates = data.value as Record<string, EmailTemplate>;
      if (templates[templateKey]?.subject && templates[templateKey]?.html) {
        return templates[templateKey];
      }
    }
  } catch (err) {
    console.error("Failed to load email template:", err);
  }
  return null;
}

/**
 * Replace placeholders like {{key}} in a string with values from a map.
 */
export function applyPlaceholders(
  template: string,
  values: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.split(`{{${key}}}`).join(value);
  }
  return result;
}
