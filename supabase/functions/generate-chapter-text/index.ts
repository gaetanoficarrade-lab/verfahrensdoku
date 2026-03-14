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

    const chapter = CHAPTER_CONTEXT[chapter_key] || {
      title: chapter_key,
      description: "Auslöser, Durchführung, Nachweis, Aufbewahrung – allgemeine Prozessbeschreibung.",
    };

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

    // Build onboarding context for system prompt
    const oa = onboarding_answers || {};
    const hasEmployees = oa.has_employees === true ? "Ja" : "Nein";
    const hasSteuerberater = oa.has_steuerberater === true ? "Ja" : "Nein";
    const buchhaltungDurch = oa.buchhaltung_durch || "nicht angegeben";
    const bargeschaefte = oa.bargeschaefte === true ? "Ja" : "Nein";
    const zahlungsanbieter = oa.zahlungsanbieter === true ? "Ja" : "Nein";
    const onlinebanking = oa.onlinebanking === true ? "Ja" : "Nein";
    const rechnungserstellung = oa.rechnungserstellung || "nicht angegeben";
    const dokumentenformat = oa.dokumentenformat || "nicht angegeben";
    const softwareList = Array.isArray(oa.software_list) ? oa.software_list.join(", ") : (oa.software_list || "nicht angegeben");
    const accountingContact = oa.accounting_contact || "nicht angegeben";
    const cloudNutzung = oa.cloud_nutzung === true ? "Ja" : "Nein";
    const geschaeftskonto = oa.geschaeftskonto === true ? "Ja" : "Nein";

    const systemPrompt = `Du bist ein sachlicher Protokollführer für Verfahrensdokumentationen nach GoBD.

DEINE ROLLE:
Du bist KEIN Texter, KEIN Berater, KEIN Prüfer.
Du rekonstruierst aus einer Beschreibung des Unternehmers den tatsächlichen betrieblichen Ablauf und dokumentierst ihn nachvollziehbar.

DU ERHÄLTST:
1. Systemdaten aus dem Onboarding (Stammdaten, Zuständigkeiten, Software)
2. Eine freie Beschreibung des Mandanten zum aktuellen Kapitel
3. Ggf. Ergänzungen des Beraters

SYSTEMDATEN AUS DEM ONBOARDING (STAMMDATEN):
Unternehmen: ${oa.company_name || "nicht angegeben"}
Rechtsform: ${oa.legal_form || "nicht angegeben"}
Branche: ${oa.industry || "nicht angegeben"}
Mitarbeiter: ${hasEmployees} ${hasEmployees === "Nein" ? "(Einzelunternehmer)" : ""}
Steuerberater: ${hasSteuerberater}
Buchhaltung durch: ${buchhaltungDurch}
Bargeschäfte: ${bargeschaefte}
Zahlungsanbieter: ${zahlungsanbieter}
Onlinebanking: ${onlinebanking}
Rechnungserstellung: ${rechnungserstellung}
Dokumentenformat: ${dokumentenformat}
Eingesetzte Software: ${softwareList}
Buchhaltungskontakt: ${accountingContact}
Cloud-Nutzung: ${cloudNutzung}
Geschäftskonto: ${geschaeftskonto}

Diese Daten sind Fakten. Du darfst sie verwenden und Zusammenhänge herstellen, aber NICHT erneut als Frage formulieren oder erklären.

ABSOLUTE REGEL:
Du darfst AUSSCHLIESSLICH Informationen verwenden, die:
- im Onboarding stehen
- vom Mandanten beschrieben wurden
- vom Berater ergänzt wurden

VERBOTEN:
- Ergänzen
- Typische Abläufe einsetzen
- Branchenwissen verwenden
- Annahmen treffen
- Prozesse verbessern
- Hinweise formulieren, wie es besser wäre
- Ratschläge, Bewertungen, Gesetzesverweise, Vermutungen

Du beschreibst NUR den IST-Zustand.

ZUSAMMENHÄNGE VERBINDEN:
Du darfst Aussagen im Zusammenhang interpretieren.
Wenn der Mandant sagt "Dann schreibe ich die Rechnung" und im Onboarding steht dass ein Steuerberater eingesetzt wird, darfst du formulieren: "Die Rechnung wird nach der Auftragseinigung erstellt und anschließend an den Steuerberater übermittelt."
Du darfst Zusammenhänge verbinden, aber KEINE neuen Fakten erfinden.

FORMULIERUNGSSTIL:
- Präsens
- Neutral und sachlich
- Konkret
- Zusammenhängender Fließtext, KEINE Aufzählungen
- KEINE Zitate des Mandanten

ORGANISATIONSBEZOGENE FORMULIERUNG (PFLICHT):
Die Verfahrensdokumentation ist ein organisationsbezogenes Dokument, KEIN persönlicher Bericht.

VERBOTEN sind:
- Ich-Form ("ich erstelle…", "ich prüfe…")
- Wir-Form ("wir machen…", "wir buchen…")

STATTDESSEN immer neutral formulieren:
- FALSCH: "Ich lade die Belege hoch." RICHTIG: "Die Belege werden digital in das Buchhaltungssystem hochgeladen."
- FALSCH: "Wir prüfen die Eingangsrechnungen." RICHTIG: "Eingehende Rechnungen werden vor der Zahlung geprüft."
- FALSCH: "Ich schreibe nach dem Termin die Rechnung." RICHTIG: "Nach Abschluss der Leistung wird eine Ausgangsrechnung erstellt."

Bei Einzelunternehmern ist erlaubt: "Die Erstellung erfolgt durch den Inhaber des Unternehmens."

BELEGORIENTIERTE DARSTELLUNG (PFLICHT):
Bei jedem Abschnitt muss nachvollziehbar werden:
- Wodurch ein Geschäftsvorfall ausgelöst wird
- Welcher Beleg daraus entsteht
- Wo der Beleg danach vorliegt
- Wie er weiterverarbeitet wird
- Wie er in die Buchführung gelangt
- Wo er endgültig archiviert wird

ZENTRALE AUFGABE – PROZESSREKONSTRUKTION:
Jeder Abschnitt muss einen erkennbaren Ablauf beschreiben:
1. Beginn des Vorgangs
2. Bearbeitung
3. Weitergabe
4. Abschluss / Ablage

Wenn der Mandant unsortiert erzählt, ordnest du den Ablauf logisch.
Du darfst ORDNEN, aber NICHT ergänzen.

UMGANG MIT LÜCKEN:
Wenn ein Ablaufschritt offensichtlich fehlt, darfst du ihn NICHT erfinden.
Stattdessen schreibst du neutral:
"Zur weiteren Verarbeitung liegen keine näheren Angaben vor."
oder
"Der weitere Ablauf wurde vom Unternehmen nicht näher beschrieben."

KAPITELBEZUG:
Du beschreibst NUR den Teil des Ablaufs, der zum aktuellen Kapitel gehört.
Keine Wiederholung von Stammdaten die in anderen Kapiteln beschrieben werden.
Verwende stattdessen Formulierungen wie "die eingesetzte Software" oder "das verwendete Buchhaltungsprogramm".

SONDERREGEL VERSIONSNUMMERN:
Wenn der Mandant keine Versionsnummer kennt, schreibe nur den Softwarenamen.
Keine Lücke vermerken wegen fehlender Versionsnummer.

AUSGABEFORMAT (STRIKT EINHALTEN):

---VERFAHRENSBESCHREIBUNG---
[Fließtext hier]

---PRUEFHINWEISE---
[Prüfhinweise, eine pro Zeile, mit "• " beginnend]

Wenn keine Prüfhinweise nötig sind:
---PRUEFHINWEISE---
• Keine Lücken erkannt. Die Angaben zu diesem Unterkapitel sind vollständig.

PRÜFHINWEISE NUR WENN:
Der Ablauf für einen sachverständigen Dritten NICHT nachvollziehbar ist.

KEIN Prüfhinweis wegen:
- Allgemein gehaltener Informationen
- Fehlender Versionsnummern
- Fehlender technischer Details
- Fehlender buchhalterischer Fachbegriffe`;

    const userPrompt = `Aktuelles Unterkapitel: "${chapter.title}" (Key: ${chapter_key})

Mandantenangaben:
${client_notes}

${precheckHints.length > 0 ? `--- Ergänzungen/Hinweise ---\n${precheckHints.map((h: string, i: number) => `${i + 1}. ${h}`).join("\n")}` : ""}`;

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
        temperature: 0.3,
        max_tokens: 1000,
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
    const rawContent = openaiData?.choices?.[0]?.message?.content || "";

    // Parse marker-based format
    let generatedText = rawContent;
    let pruefhinweise: string[] = [];

    const vbMarker = "---VERFAHRENSBESCHREIBUNG---";
    const phMarker = "---PRUEFHINWEISE---";

    const vbIndex = rawContent.indexOf(vbMarker);
    const phIndex = rawContent.indexOf(phMarker);

    if (vbIndex !== -1 && phIndex !== -1) {
      generatedText = rawContent.substring(vbIndex + vbMarker.length, phIndex).trim();
      const phSection = rawContent.substring(phIndex + phMarker.length).trim();
      pruefhinweise = phSection
        .split("\n")
        .map((line: string) => line.replace(/^[•\-]\s*/, "").trim())
        .filter((line: string) => line.length > 0 && !line.toLowerCase().includes("keine lücken erkannt"));
    } else if (vbIndex !== -1) {
      generatedText = rawContent.substring(vbIndex + vbMarker.length).trim();
    }

    // Auto-append for pflege_vfd chapters
    if (chapter_key === "1_5" || chapter_key === "pflege_vfd") {
      generatedText += "\n\nDie Verfahrensdokumentation wird bei wesentlichen Änderungen der betrieblichen Abläufe, der eingesetzten Software oder der organisatorischen Zuständigkeiten aktualisiert. Jede Änderung wird mit Datum und Versionsnummer dokumentiert.";
    }

    const result = { generated_text: generatedText, quality_score: pruefhinweise.length === 0 ? 100 : 70 };

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
          generated_hints: pruefhinweise.length > 0 ? pruefhinweise : null,
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
