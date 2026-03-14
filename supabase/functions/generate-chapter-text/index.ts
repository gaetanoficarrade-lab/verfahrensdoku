import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAPTER_CONTEXT: Record<string, { title: string; description: string }> = {
  // Kapitel 1 – Allgemeine Beschreibung
  "1_1": { title: "Unternehmensbeschreibung", description: "Kerntätigkeit, Branche, Rechtsform, Geschäftsmodell, Geschäftsvorgänge, Auftragsanbahnung, Belegentstehung." },
  "1_2": { title: "Organisatorischer Aufbau", description: "Aufgabenverteilung im Tagesablauf, Weitergabe von Aufgaben und Belegen, Standorte, Abteilungen." },
  "1_3": { title: "Zuständigkeiten & Verantwortlichkeiten", description: "Aufgabenverteilung im buchhalterischen Ablauf, Verantwortung für Buchhaltung, IT, Vertretungsregelungen." },
  "1_4": { title: "Buchführungsgrundsätze", description: "Ablauf der Buchführung, Umgang mit Korrekturen, Protokollierung, Kontenrahmen, Buchungssystematik." },
  "1_5": { title: "Pflege der Verfahrensdokumentation", description: "Wann und wie die Verfahrensdokumentation aktualisiert wird, Verantwortung, Versionierung." },
  // Kapitel 2 – Anwenderdokumentation
  "2_1": { title: "Rechnungsausgang / Debitoren", description: "Auftrag → Rechnung, Rechnungserstellung, Nummerierung, Übermittlung, Ablage, Archivierung." },
  "2_2": { title: "Rechnungseingang / Kreditoren", description: "Empfang/Erfassung, Prüfung/Freigabe, Verbuchung, Ablage, Archivierung." },
  "2_3": { title: "Kassenprozesse", description: "Bargeschäft-Ablauf, Tagesabschluss, Kassenbuch, Belege → Buchhaltung, Aufbewahrung." },
  "2_4": { title: "Zahlungsanbieter", description: "Umsätze → Buchhaltung, Belegzuordnung, Gebührenerfassung, Abgleich, Archivierung." },
  "2_5": { title: "Marktplatz-/Plattformverkäufe", description: "Bestellungen → Buchung, Sammelzahlungen/Gebühren, Umsatzerfassung, Abrechnungen." },
  "2_6": { title: "Digitalisierung / Scanprozess", description: "Scanverfahren, Bildqualität, Qualitätssicherung, Originalverbleib." },
  "2_7": { title: "Buchhaltungsverarbeitung", description: "Beleg → Buchhaltung, Buchung/Zuordnung, dauerhafte Ablage, Periodenabschluss." },
  "2_8": { title: "Zahlungsverkehr / Bank", description: "Zahlung/Autorisierung, Zuordnung Beleg/Buchung, Abstimmung, Kontoauszüge, Archivierung." },
  "2_9": { title: "Personal / Lohn", description: "Lohnabrechnungs-Auslöser, Ablauf, Software, Übertragung in FiBu, Aufbewahrung." },
  // Kapitel 3 – Technische Systemdokumentation
  "3_1": { title: "Buchhaltungssoftware", description: "Softwarename, Zugriffsregelung, Updates, Berechtigungen." },
  "3_2": { title: "Schnittstellen", description: "Datenfluss zwischen Systemen, Datenformate, Fehlererkennung, Fehlerbehandlung." },
  "3_3": { title: "E-Rechnungsprozesse", description: "Empfang ZUGFeRD/XRechnung, XML-Erhalt, Validierung, Aufbewahrung." },
  "3_4": { title: "Cloud-Software / SaaS", description: "Eingesetzte Systeme, Serverstandort, Datenzugriffssicherheit, AV-Verträge." },
  "3_5": { title: "E-Mail-Systeme & Archivierung", description: "Erkennung steuerrelevanter Mails, E-Mail-Provider, Archivierung, Aufbewahrung." },
  "3_6": { title: "Zahlungsplattformen", description: "Technische Anbindung, Transaktionslogs, Datenintegrität, Umsatzerfassung." },
  // Kapitel 4 – Betriebsdokumentation
  "4_1": { title: "Datensicherung", description: "Sicherungsablauf, Häufigkeit, Umfang, Speicherort, Verantwortlichkeit, Verlustfall." },
  "4_2": { title: "Wiederherstellung", description: "Ablauf einer Backup-Wiederherstellung, Testzyklen, Wiederherstellungszeit." },
  "4_3": { title: "Systemänderungen & Updates", description: "Update-Durchführung, Planung, Freigabe, Dokumentation, Systemwechsel, Datenintegrität." },
  "4_4": { title: "Archivierung & Aufbewahrung", description: "Aufbewahrungsort, Wiederfindbarkeit, Fristen, Formate, Lesbarkeit, Löschung." },
  "4_5": { title: "Datenzugriff der Finanzverwaltung", description: "Bereitstellung für Prüfer, Exportformat, Z1/Z2/Z3, Ansprechpartner." },
  "4_6": { title: "Änderungs- und Versionsmanagement", description: "Nachvollziehbare Änderungsdokumentation, Versionierung, Changelog, Genehmigung." },
  "4_7": { title: "Digitalisierung von Papierbelegen", description: "Schritt-für-Schritt-Digitalisierung, Qualitätskontrolle, Originalverbleib." },
  // Kapitel 5 – Internes Kontrollsystem
  "5_1": { title: "Berechtigungen", description: "Zugriff/Rechte, Funktionstrennung, Vergabe, Entzug, Überprüfung." },
  "5_2": { title: "Freigaben", description: "Nachweisbare Freigaben, Freigabe-Erteilung, Kompetenzen, Wertgrenzen." },
  "5_3": { title: "Plausibilitätskontrollen", description: "Regelmäßige Prüfungen, Nachweisbarkeit, automatische Prüfungen, Abweichungen." },
  "5_4": { title: "Verantwortlichkeiten", description: "Kontrollverantwortung, Durchführungssicherstellung, IKS-Gesamtverantwortung." },
  "5_5": { title: "Umgang mit Fehlern", description: "Fehlererkennung/-korrektur, Korrekturdokumentation, Eskalation, Prävention." },
};

const normalizeHints = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.includes("\n")) {
      return trimmed
        .split("\n")
        .map((line) => line.replace(/^[-•]\s*/, "").trim())
        .filter(Boolean);
    }
    if (trimmed.includes(",")) {
      return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [trimmed];
  }
  return [];
};

const extractPrecheckHints = (raw: unknown): string[] => {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) return normalizeHints(raw);

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return normalizeHints(parsed);
      if (parsed && typeof parsed === "object") {
        const payload = parsed as { hints?: unknown; missing_fields?: unknown };
        return [...normalizeHints(payload.missing_fields), ...normalizeHints(payload.hints)];
      }
    } catch {
      return normalizeHints(trimmed);
    }

    return [];
  }

  if (typeof raw === "object") {
    const payload = raw as { hints?: unknown; missing_fields?: unknown };
    return [...normalizeHints(payload.missing_fields), ...normalizeHints(payload.hints)];
  }

  return [];
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

    const precheckHints = extractPrecheckHints(chapterData?.client_precheck_hints);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Du bist ein erfahrener Steuerberater und GoBD-Experte. Du erstellst professionelle Verfahrensdokumentationen nach GoBD (BMF-Schreiben vom 28.11.2019) für deutsche Unternehmen.

Deine Aufgabe: Erstelle den professionellen Text für das Kapitel "${chapter.title}" einer Verfahrensdokumentation.
Relevante Aspekte: ${chapter.description}

WICHTIGE REGELN:

- Schreibe im Stil einer professionellen Verfahrensdokumentation (sachlich, präzise, vollständig)
- Verwende die Ich/Wir-Form basierend auf HAS_EMPLOYEES (Einzelunternehmer = 'ich/der Inhaber', mit Mitarbeitern = 'wir/das Unternehmen')
- Integriere alle Onboarding-Informationen automatisch ohne sie nochmal abzufragen
- Füge bei IT-Kapiteln immer einen Hinweis zur Versionsdokumentation ein
- Beschreibe immer: Auslöser → Durchführung → Nachweis → Aufbewahrung
- Nenne immer konkrete Aufbewahrungsfristen (§ 147 AO: 10 Jahre für Buchungsbelege, 6 Jahre für Handelsbriefe)
- Bei deaktivierten Modulen: Formuliere professionelle Negativvermerke die bestätigen dass dieser Prozess nicht stattfindet und was bei zukünftiger Aktivierung zu tun ist
- Mindestlänge: 200 Wörter pro Kapitel
- Bei Berechtigungskapiteln: Erstelle immer eine Berechtigungsmatrix als Tabelle
- Bei Freigabekapiteln: Beschreibe das Vier-Augen-Prinzip und Vertretungsregelungen
- Zitiere relevante Gesetzesgrundlagen (§ 147 AO, § 257 HGB, GoBD)

QUALITÄTSSTANDARD: Der Text muss einer Betriebsprüfung standhalten. Ein Betriebsprüfer muss anhand des Textes alle Prozesse vollständig nachvollziehen können.

Antworte NUR als JSON: { "generated_text": "Kapiteltext mit Markdown-Formatierung", "quality_score": 0-100 }`;

    const userPrompt = `Kapitel: ${chapter.title}
Beschreibung: ${chapter.description}

Mandanten-Notizen:
${client_notes}

${precheckHints.length > 0 ? `Precheck-Hinweise (bekannte Lücken):\n${precheckHints.map((h: string, i: number) => `${i + 1}. ${h}`).join("\n")}` : ""}

${onboarding_answers ? `Onboarding-Antworten:\n${JSON.stringify(onboarding_answers, null, 2)}` : ""}

Generiere jetzt den professionellen Verfahrensdokumentations-Text für dieses Kapitel.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI API error:", openaiResponse.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiData = await openaiResponse.json();
    const rawText = openaiData?.choices?.[0]?.message?.content || "{}";

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
