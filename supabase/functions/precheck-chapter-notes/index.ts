import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHAPTER_CHECKPOINTS: Record<string, string> = {
  unternehmen: "Wie Geschäftsvorgänge entstehen · Wie Aufträge zustande kommen und Belege entstehen",
  organisation: "Aufgabenverteilung im Tagesablauf · Weitergabe von Aufgaben/Belegen",
  zustaendigkeiten: "Aufgabenverteilung im buchhalterischen Ablauf",
  buchfuehrung: "Ablauf der Buchführung · Umgang mit Korrekturen · Protokollierung",
  pflege_vfd: "Wann/wie die Verfahrensdoku aktualisiert wird",
  rechnungsausgang: "Auftrag → Rechnung · Übermittlung · Ablage",
  rechnungseingang: "Empfang/Erfassung · Prüfung/Freigabe · Ablage",
  kassenprozess: "Bargeschäft-Ablauf · Tagesabschluss · Belege → Buchhaltung",
  buchhaltung: "Beleg → Buchhaltung · Buchung/Zuordnung · Dauerhafte Ablage",
  bankverkehr: "Zahlung/Autorisierung · Zuordnung Beleg/Buchung · Abstimmung",
  scanprozess: "Digitalisierung · Qualitätssicherung · Umgang mit Originalen",
  zahlungsanbieter: "Umsätze → Buchhaltung · Belegzuordnung · Gebührenerfassung",
  marktplatz: "Bestellungen → Buchung · Sammelzahlungen/Gebühren",
  email: "Erkennung steuerrelevanter Mails · Archivierung",
  e_rechnung: "Empfang ZUGFeRD/XRechnung · XML-Erhalt · Aufbewahrung",
  buchhaltungssoftware: "Softwarename · Zugriffsregelung · Updates",
  schnittstellen: "Datenfluss zwischen Systemen · Fehlererkennung",
  cloud: "Eingesetzte Systeme · Datenzugriffssicherheit · AV-Verträge",
  datensicherung: "Sicherungsablauf · Verantwortlichkeit · Verlustfall",
  wiederherstellung: "Ablauf einer Backup-Wiederherstellung",
  archivierung: "Aufbewahrungsort · Wiederfindbarkeit · Fristen · Löschung",
  datenzugriff: "Bereitstellung für Prüfer · Exportformat",
  scanprozess_betrieb: "Schritt-für-Schritt-Digitalisierung · Qualitätskontrolle · Originalverbleib",
  updates: "Update-Durchführung · Systemwechsel",
  aenderungsmanagement: "Nachvollziehbare Änderungsdokumentation",
  berechtigungen: "Zugriff/Rechte · Funktionstrennung",
  freigaben: "Nachweisbare Freigaben · Freigabe-Erteilung",
  plausibilitaet: "Regelmäßige Prüfungen · Nachweisbarkeit",
  verantwortlichkeiten: "Kontrollverantwortung · Durchführungssicherstellung",
  fehlerbehandlung: "Fehlererkennung/-korrektur · Korrekturdokumentation",
  personal: "Lohnabrechnungs-Auslöser · Ablauf · Aufbewahrung",
};

const normalizeHints = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

const buildStoredPrecheck = (hints: string[], sufficient: boolean) =>
  JSON.stringify({
    checked: true,
    hints,
    missing_fields: [],
    confidence: sufficient ? 100 : 40,
    sufficient,
    checked_at: new Date().toISOString(),
  });

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

    // Resolve chapter checkpoints – try direct key, then mapped from chapter_key like "1_1"
    const resolveCheckpoints = (key: string): string => {
      if (CHAPTER_CHECKPOINTS[key]) return CHAPTER_CHECKPOINTS[key];
      return "Auslöser · Durchführung · Nachweis · Aufbewahrung";
    };

    const checkpoints = resolveCheckpoints(chapter_key);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY ist nicht konfiguriert." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hasEmployees = onboarding_answers?.has_employees !== false;

    const systemPrompt = `Du bist ein freundlicher Interview-Assistent, der einem Unternehmer hilft, seinen Arbeitsalltag zu beschreiben.
Du führst ein Gespräch, KEINE Steuerprüfung.
Ziel: Der Mandant soll sofort wissen, was er konkret noch erzählen muss.

WICHTIGSTE GRUNDREGEL – KAPITELBEZOGENE PRÜFUNG:
Du darfst NUR prüfen, was zum aktuellen Kapitel gehört.
Du darfst KEINE Inhalte aus anderen Kapiteln verlangen oder bemängeln.

${!hasEmployees ? `[SONDERREGEL EINZELUNTERNEHMER – HAS_EMPLOYEES=false]:
Wenn der Mandant sinngemäß schreibt dass alle Aufgaben vom Inhaber persönlich durchgeführt werden, ist das Kapitel für Zuständigkeiten VOLLSTÄNDIG.
Gib dann hints=[] und sufficient=true zurück.
` : ""}
INTERVIEWMODUS:
Wenn Informationen fehlen, stellst du gezielte Ergänzungsfragen – wie in einem freundlichen Gespräch.

VALIDIERUNGSREGEL:
Du darfst NUR prüfen, ob die kapitelbezogenen Prüfpunkte erkennbar abgedeckt sind.
Du darfst KEINE zusätzlichen fachlichen Anforderungen erfinden.
Hinweise dürfen NUR erscheinen, wenn ein Prüfpunkt KOMPLETT fehlt.
Nach Beantwortung aller Leitfragen gilt der Abschnitt grundsätzlich als vollständig.

SONDERREGEL VERSIONSNUMMERN:
Du darfst NIEMALS nach Versionsnummern von Software fragen.
Der Name der Software reicht vollständig aus (z.B. "Lexoffice", "Funnelpay", "Stripe").
Software wird ständig aktualisiert – Versionsnummern sind für den Mandanten nicht zumutbar zu pflegen.

SONDERREGEL UNVERÄNDERBARKEIT:
Wenn der Mandant beschreibt dass er Rechnungen nicht löschen kann sondern stornieren muss, oder dass seine Software keine nachträglichen Änderungen erlaubt, gilt Unveränderbarkeit als vollständig beschrieben.
Auch umgangssprachliche Beschreibungen akzeptieren.

STRENGE REGELN FÜR HINWEISE:
- MAXIMAL 2 Hinweise gleichzeitig. Niemals mehr.
- Jeder Hinweis ist eine kurze, konkrete Frage in Alltagssprache.
- KEINE Fachbegriffe (verboten: Unveränderbarkeit, GoBD-Konformität, Dokumentationspflicht, Aufbewahrungspflicht, Belegfunktion etc.)
- KEINE langen Aufzählungen mit vielen Anforderungen.
- KEINE Erklärungen, was die GoBD verlangen.
- Du darfst NIEMALS erklären, warum etwas wichtig ist. Stelle einfach die Frage.

BEISPIELE FÜR GUTE FRAGEN:
- "Wo werden Ihre Rechnungen nach der Erstellung gespeichert?"
- "Wie kommt eine Eingangsrechnung zu Ihnen – per E-Mail, Download oder Post?"
- "Woran erkennt man später, dass der Kunde Sie wirklich beauftragt hat?"
- "Was machen Sie konkret, wenn eine Rechnung falsch ist?"

VERBOTEN sind Hinweise wie:
- "nicht ausreichend beschrieben"
- "nicht nachvollziehbar"
- "bitte genauer erläutern"
- Jegliche Fachsprache oder abstrakte Formulierungen

SPEZIALREGEL – MÜNDLICHE EINIGUNG:
Wenn der Mandant eine mündliche Vereinbarung beschreibt, darfst du NICHT verlangen einen Vertrag zu beschreiben.
Frage stattdessen nach der Nachweiskette – welche Aufzeichnungen danach entstehen.

STOPPREGEL:
Sobald die Angaben logisch nachvollziehbar sind, darfst du NICHT weiter nach Details fragen.
Wenn alle Prüfpunkte erkennbar abgedeckt sind → hints=[] und sufficient=true.

WEITERE REGELN:
- Du prüfst NUR die Vollständigkeit, NICHT die Richtigkeit.
- Du bist KEIN Steuerberater und KEIN Prüfer.
- Du gibst KEINE Bewertungen, KEINE Fachbegriffe, KEINE Paragraphen.
- Du gibst KEINE Verbesserungsvorschläge.
- Einfache Alltagssprache, freundlich und respektvoll (Sie-Form)

KAPITELBEZOGENE PRÜFPUNKTE für dieses Kapitel:
${checkpoints}

AUSGABEFORMAT (JSON):
{ "hints": ["Frage 1", "Frage 2"], "sufficient": true/false }
Maximal 2 Einträge in hints.
Wenn alles abgedeckt ist: hints=[] und sufficient=true.
Antworte NUR mit dem JSON-Objekt, ohne Markdown-Codeblöcke.`;

    const userPrompt = `Kapitel-Prüfpunkte: ${checkpoints}

Mandanten-Notizen:
${client_notes}

${onboarding_answers ? `Onboarding-Antworten:\n${JSON.stringify(onboarding_answers, null, 2)}` : ""}

Analysiere die Notizen und gib das JSON zurück.`;

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

    let parsed: { hints?: unknown; sufficient?: boolean };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { hints: ["Analyse konnte nicht verarbeitet werden."], sufficient: false };
    }

    const hints = normalizeHints(parsed.hints).slice(0, 2);
    const sufficient = parsed.sufficient === true;

    // Map to legacy format expected by ChapterEditor
    const normalizedResult = {
      hints,
      missing_fields: [] as string[],
      confidence: sufficient ? 100 : 40,
    };

    const storedPrecheck = buildStoredPrecheck(hints, sufficient);

    // Save to chapter_data
    const { data: existing } = await supabase
      .from("chapter_data")
      .select("id")
      .eq("project_id", project_id)
      .eq("chapter_key", chapter_key)
      .maybeSingle();

    const allHints = hints;

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