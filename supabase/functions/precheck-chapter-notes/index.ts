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

const normalizeHints = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

const buildStoredPrecheck = (result: { hints: string[]; missing_fields: string[]; confidence: number }) =>
  JSON.stringify({
    checked: true,
    hints: result.hints,
    missing_fields: result.missing_fields,
    confidence: result.confidence,
    checked_at: new Date().toISOString(),
  });

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY ist nicht konfiguriert." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Du bist ein freundlicher Assistent der Mandanten beim Ausfüllen ihrer Verfahrensdokumentation (GoBD) unterstützt.

Deine Aufgabe: Prüfe die Angaben für das Kapitel "${chapterContext}" und gib NUR Hinweise auf echte Lücken.

WICHTIGE REGELN:

1. UMGANGSSPRACHE ZÄHLT: Wenn der Nutzer etwas in eigenen Worten beschrieben hat, gilt die Information als vorhanden. Du darfst NICHT bemängeln dass etwas "nicht formal genug" oder "nicht detailliert genug" formuliert ist. Die formale Aufbereitung ist Aufgabe des generierten Textes, nicht des Nutzers.

2. NUR ECHTE LÜCKEN: Ein Hinweis ist nur berechtigt wenn eine Information wirklich NIRGENDS erwähnt wurde – weder direkt noch sinngemäß noch umgangssprachlich. Wenn der Nutzer z.B. schreibt "ich mach die Buchhaltung mit Lexoffice" dann ist die Software benannt, auch ohne Versionsnummer.

3. SOFTWARE-NAMEN REICHEN AUS: Die GoBD verlangt die Identifizierbarkeit der eingesetzten Software, NICHT die exakte Versionsnummer. Wenn der Nutzer einen Softwarenamen nennt (z.B. "Lexoffice", "Funnelpay", "Stripe", "sevDesk"), ist die Anforderung erfüllt. Gib NIEMALS einen Hinweis auf fehlende Versionsnummern. Nur wenn der Nutzer GAR KEINE Software erwähnt hat obwohl der Prozess offensichtlich softwaregestützt ist, darfst du nachfragen welche Software genutzt wird.

4. KEINE NACHVOLLZIEHBARKEITS-FORDERUNG: "Ein sachkundiger Dritter muss nachvollziehen können" ist das Ziel des fertigen Dokuments, nicht Aufgabe des Mandanten bei der Eingabe. Gib KEINEN Hinweis dazu.

5. MAXIMAL 3 HINWEISE: Gib höchstens 3 wirklich relevante Hinweise. Lieber weniger als zu viele. Keine ellenlangen Listen.

6. TON: Unterstützend und freundlich, nicht prüfend oder belehrend. Formuliere als Vorschlag: "Sie könnten noch ergänzen..." oder "Vielleicht möchten Sie noch erwähnen..."

7. LEERE HINWEISE BEI VOLLSTÄNDIGKEIT: Wenn die Angaben ausreichend sind, gib eine leere hints-Liste zurück. Es ist völlig OK keine Hinweise zu haben.

Was wirklich fehlen kann (nur prüfen wenn ÜBERHAUPT NICHT erwähnt):
- Welche Software/Tools werden genutzt (nur ob überhaupt genannt, nicht Versionsnummern)
- Wer ist zuständig (Person oder Rolle – "ich mache das selbst" reicht völlig)
- Wie werden Daten aufbewahrt (irgendeine Erwähnung reicht, z.B. "in der Cloud", "auf dem Rechner")
- Gibt es einen Prozess für den beschriebenen Bereich (irgendeine Beschreibung reicht)

Antworte NUR als JSON: { "hints": ["..."], "missing_fields": ["..."], "confidence": 0-100 }
Bei confidence: 80+ = gut ausgefüllt, 50-79 = ein paar Lücken, unter 50 = wesentliche Infos fehlen.`;

    const userPrompt = `Kapitel: ${chapterContext}

Mandanten-Notizen:
${client_notes}

${onboarding_answers ? `Onboarding-Antworten:\n${JSON.stringify(onboarding_answers, null, 2)}` : ""}

Analysiere die Notizen und gib strukturierte Hinweise zurück.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
      const errorMessage =
        openaiResponse.status === 429
          ? "OpenAI Rate-Limit erreicht. Bitte versuchen Sie es in Kürze erneut."
          : `OpenAI API Fehler (${openaiResponse.status})`;
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: openaiResponse.status === 429 ? 429 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const rawText = openaiData?.choices?.[0]?.message?.content || "{}";

    let result: { hints: string[]; missing_fields: string[]; confidence: number };
    try {
      result = JSON.parse(rawText);
    } catch {
      result = { hints: ["Analyse konnte nicht verarbeitet werden."], missing_fields: [], confidence: 0 };
    }

    const normalizedResult = {
      hints: normalizeHints(result.hints),
      missing_fields: normalizeHints(result.missing_fields),
      confidence: typeof result.confidence === "number" ? result.confidence : 0,
    };

    const allHints = [...normalizedResult.missing_fields, ...normalizedResult.hints];
    const storedPrecheck = buildStoredPrecheck(normalizedResult);

    // Save to chapter_data
    const { data: existing } = await supabase
      .from("chapter_data")
      .select("id")
      .eq("project_id", project_id)
      .eq("chapter_key", chapter_key)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from("chapter_data")
        .update({
          client_precheck_hints: storedPrecheck,
          precheck_hints_count: allHints.length,
        })
        .eq("id", existing.id);

      if (updateError) {
        await supabase
          .from("chapter_data")
          .update({
            client_precheck_hints: allHints,
            precheck_hints_count: allHints.length,
          })
          .eq("id", existing.id);
      }
    } else {
      const { error: insertError } = await supabase.from("chapter_data").insert({
        project_id,
        chapter_key,
        client_precheck_hints: storedPrecheck,
        precheck_hints_count: allHints.length,
        status: "client_draft",
      });

      if (insertError) {
        await supabase.from("chapter_data").insert({
          project_id,
          chapter_key,
          client_precheck_hints: allHints,
          precheck_hints_count: allHints.length,
          status: "client_draft",
        });
      }
    }

    return new Response(JSON.stringify(normalizedResult), {
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
