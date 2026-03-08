import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAPTER_CONTEXT: Record<string, string> = {
  "1_1": "Unternehmensbeschreibung: Kerntätigkeit, Branche, Rechtsform, Geschäftsmodell",
  "1_2": "Organisatorischer Aufbau: Abteilungen, Standorte, Organigramm",
  "1_3": "Zuständigkeiten & Verantwortlichkeiten: Buchhaltung, IT, Vertretung",
  "1_4": "Buchführungsgrundsätze: Kontenrahmen, Buchungssystematik, Vollständigkeit",
  "1_5": "Pflege der Verfahrensdokumentation: Aktualisierung, Verantwortung, Versionierung",
  "2_1": "Rechnungsausgang / Debitoren: Rechnungserstellung, Nummerierung, Versand, Archivierung",
  "2_2": "Rechnungseingang / Kreditoren: Empfang, Prüfung, Freigabe, Verbuchung, Archivierung",
  "2_3": "Kassenprozesse: Kassiervorgang, Tagesabschluss, Kassenbuch, Aufbewahrung",
  "2_4": "Zahlungsanbieter: PayPal, Stripe, Klarna – Erfassung, Abgleich, Archivierung",
  "2_5": "Marktplatz-/Plattformverkäufe: Amazon, eBay – Umsatzerfassung, Abrechnungen",
  "2_6": "Digitalisierung / Scanprozess: Scanverfahren, Bildqualität, Originalverbleib",
  "2_7": "Buchhaltungsverarbeitung: Belegfluss, Verbuchung, Kontierung, Periodenabschluss",
  "2_8": "Zahlungsverkehr / Bank: Geschäftskonten, Kontoauszüge, Abgleich, Archivierung",
  "2_9": "Personal / Lohn: Lohnabrechnung, Software, Übertragung in FiBu, Aufbewahrung",
  "3_1": "Buchhaltungssoftware: Produkt, Version, Berechtigungen, Updates",
  "3_2": "Schnittstellen: Anbindungen, Datenformate, Fehlerbehandlung",
  "3_3": "E-Rechnungsprozesse: ZUGFeRD, XRechnung, Validierung, Archivierung",
  "3_4": "Cloud-Software / SaaS: Anbieter, Serverstandort, Zugriff, Datensicherheit",
  "3_5": "E-Mail-Systeme & Archivierung: E-Mail-Provider, steuerrelevante E-Mails, Aufbewahrung",
  "3_6": "Zahlungsplattformen: Technische Anbindung, Transaktionslogs, Datenintegrität",
  "4_1": "Datensicherung: Häufigkeit, Umfang, Speicherort, Verantwortlichkeit",
  "4_2": "Wiederherstellung: Ablauf, Testzyklen, Wiederherstellungszeit",
  "4_3": "Systemänderungen & Updates: Planung, Freigabe, Dokumentation, Datenintegrität",
  "4_4": "Archivierung & Aufbewahrung: Fristen, Formate, Lesbarkeit, Speicherorte",
  "4_5": "Datenzugriff der Finanzverwaltung: Z1/Z2/Z3, Ansprechpartner, Bereitstellungszeit",
  "4_6": "Änderungs- und Versionsmanagement: Versionierung, Changelog, Genehmigung",
  "4_7": "Digitalisierung von Papierbelegen: Verfahren, Qualitätssicherung, Originalverbleib",
  "5_1": "Berechtigungen: Konzept, Vergabe, Entzug, Überprüfung",
  "5_2": "Freigaben: Prozesse, Kompetenzen, Wertgrenzen, Dokumentation",
  "5_3": "Plausibilitätskontrollen: Automatische Prüfungen, Abweichungen, Protokollierung",
  "5_4": "Verantwortlichkeiten: IKS-Gesamtverantwortung, Verteilung, Überwachung",
  "5_5": "Umgang mit Fehlern: Korrekturprozess, Dokumentation, Eskalation, Prävention",
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

    const chapterContext = CHAPTER_CONTEXT[chapter_key] || chapter_key;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Du bist ein Experte für GoBD-konforme Verfahrensdokumentationen in Deutschland.
Deine Aufgabe: Analysiere die Mandanten-Notizen für das Kapitel "${chapterContext}" und identifiziere:
1. Fehlende Pflichtangaben (missing_fields)
2. Unklare oder unvollständige Aussagen (hints)
3. Eine Gesamtbewertung der Vollständigkeit (confidence: 0-100)

Antworte NUR mit einem JSON-Objekt im folgenden Format:
{
  "hints": ["Hinweis 1", "Hinweis 2"],
  "missing_fields": ["Feld 1", "Feld 2"],
  "confidence": 65
}`;

    const userPrompt = `Kapitel: ${chapterContext}

Mandanten-Notizen:
${client_notes}

${onboarding_answers ? `Onboarding-Antworten:\n${JSON.stringify(onboarding_answers, null, 2)}` : ""}

Analysiere die Notizen und gib strukturierte Hinweise zurück.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let result: { hints: string[]; missing_fields: string[]; confidence: number };
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { hints: ["Analyse konnte nicht verarbeitet werden."], missing_fields: [], confidence: 0 };
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
          client_precheck_hints: result.hints,
          precheck_hints_count: result.hints.length,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("chapter_data").insert({
        project_id,
        chapter_key,
        client_precheck_hints: result.hints,
        precheck_hints_count: result.hints.length,
        status: "client_draft",
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("precheck error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
