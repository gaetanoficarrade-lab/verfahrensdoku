import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAPTER_CONTEXT: Record<string, { title: string; description: string }> = {
  general_info: {
    title: "Allgemeine Informationen",
    description:
      "Unternehmensname, Rechtsform, Branche, Gründungsjahr, Mitarbeiteranzahl, Geschäftsführung, Standorte, Organisationsstruktur, Verantwortlichkeiten.",
  },
  it_systems: {
    title: "IT-Umfeld",
    description:
      "Hardware, Software, Betriebssysteme, Netzwerkinfrastruktur, ERP-/Buchhaltungssysteme, Schnittstellen, Berechtigungskonzepte, Datensicherung, Notfallkonzept.",
  },
  processes: {
    title: "Geschäftsprozesse",
    description:
      "Einkauf, Verkauf, Lager, Zahlungsverkehr, Lohnabrechnung, Reisekostenabrechnung, steuerrelevante Prozesse, Belegfluss, Kontierungsregeln.",
  },
  archiving: {
    title: "Archivierung",
    description:
      "Aufbewahrungsfristen, Speicherorte, Speichermedien, Zugriffsrechte, Löschkonzepte, Revisionssicherheit, Indexierung, Konvertierungsverfahren.",
  },
  controls: {
    title: "Internes Kontrollsystem (IKS)",
    description:
      "Zugriffskontrollen, Plausibilitätsprüfungen, Vier-Augen-Prinzip, Protokollierung, Schutzmaßnahmen gegen Manipulation, Überwachungsmaßnahmen.",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { project_id, chapter_key, client_notes, onboarding_answers } = await req.json();

    if (!project_id || !chapter_key || !client_notes) {
      return new Response(
        JSON.stringify({ error: "project_id, chapter_key and client_notes are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chapter = CHAPTER_CONTEXT[chapter_key];
    if (!chapter) {
      return new Response(JSON.stringify({ error: "Invalid chapter_key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch precheck hints if available
    const { data: chapterData } = await supabase
      .from("chapter_data")
      .select("client_precheck_hints")
      .eq("project_id", project_id)
      .eq("chapter_key", chapter_key)
      .maybeSingle();

    const precheckHints = chapterData?.client_precheck_hints || [];

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Du bist ein erfahrener Steuerberater und Experte für GoBD-konforme Verfahrensdokumentationen in Deutschland.

Deine Aufgabe: Erstelle den professionellen Text für das Kapitel "${chapter.title}" einer Verfahrensdokumentation gemäß GoBD.

Anforderungen an den Text:
- Professioneller, sachlicher Stil passend für eine offizielle Verfahrensdokumentation
- Alle relevanten Aspekte abdecken: ${chapter.description}
- GoBD-konform und revisionssicher formuliert
- Klare Struktur mit Überschriften und Absätzen
- Fachbegriffe korrekt verwenden
- Wenn Informationen fehlen, kennzeichne diese mit [ERGÄNZEN: ...]

Antworte NUR mit einem JSON-Objekt:
{
  "generated_text": "Der vollständige Kapiteltext mit Markdown-Formatierung",
  "quality_score": 85
}

quality_score (0-100): Wie vollständig und professionell der Text basierend auf den gegebenen Informationen ist.`;

    const userPrompt = `Kapitel: ${chapter.title}
Beschreibung: ${chapter.description}

Mandanten-Notizen:
${client_notes}

${precheckHints.length > 0 ? `Precheck-Hinweise (bekannte Lücken):\n${precheckHints.map((h: string, i: number) => `${i + 1}. ${h}`).join("\n")}` : ""}

${onboarding_answers ? `Onboarding-Antworten:\n${JSON.stringify(onboarding_answers, null, 2)}` : ""}

Generiere jetzt den professionellen Verfahrensdokumentations-Text für dieses Kapitel.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let result: { generated_text: string; quality_score: number };
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { generated_text: rawText, quality_score: 0 };
    }

    // Save to chapter_data
    const { data: existing } = await supabase
      .from("chapter_data")
      .select("id")
      .eq("project_id", project_id)
      .eq("chapter_key", chapter_key)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("chapter_data")
        .update({
          generated_text: result.generated_text,
          generated_hints: result.quality_score < 60
            ? ["Textqualität unter 60% – bitte Eingaben vervollständigen"]
            : null,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("chapter_data").insert({
        project_id,
        chapter_key,
        generated_text: result.generated_text,
        status: "client_draft",
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
