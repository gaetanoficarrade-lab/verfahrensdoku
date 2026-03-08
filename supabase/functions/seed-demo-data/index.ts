import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify the user is a super_admin
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claims, error: claimsErr } =
    await supabaseUser.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claims.claims.sub as string;

  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();

  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ─── 1. Plan ───
    const { data: plan } = await supabaseAdmin
      .from("plans")
      .upsert(
        {
          name: "Professional",
          max_clients: 50,
          max_projects: 100,
          price_monthly: 149.0,
        },
        { onConflict: "name" }
      )
      .select()
      .single();

    const planId = plan?.id;

    // Fallback: if upsert didn't work on name (no unique constraint), just select or insert
    let finalPlanId = planId;
    if (!finalPlanId) {
      const { data: existingPlan } = await supabaseAdmin
        .from("plans")
        .select("id")
        .eq("name", "Professional")
        .maybeSingle();
      if (existingPlan) {
        finalPlanId = existingPlan.id;
      } else {
        const { data: newPlan } = await supabaseAdmin
          .from("plans")
          .insert({
            name: "Professional",
            max_clients: 50,
            max_projects: 100,
            price_monthly: 149.0,
          })
          .select()
          .single();
        finalPlanId = newPlan?.id;
      }
    }

    // ─── 2. Tenant ───
    const { data: tenant } = await supabaseAdmin
      .from("tenants")
      .insert({
        name: "Musterkanzlei Müller & Partner",
        contact_name: "Thomas Müller",
        contact_email: "mueller@musterkanzlei.de",
        plan_id: finalPlanId,
        is_active: true,
      })
      .select()
      .single();

    const tenantId = tenant!.id;

    // ─── Tenant Settings ───
    await supabaseAdmin.from("tenant_settings").insert({
      tenant_id: tenantId,
      brand_name: "Musterkanzlei Müller & Partner",
      primary_color: "#1e3a5f",
      address: "Kanzleistraße 12, 80333 München",
      phone: "+49 89 1234567",
      website: "https://www.musterkanzlei-mueller.de",
      imprint:
        "Musterkanzlei Müller & Partner\nKanzleistraße 12\n80333 München\nTel: +49 89 1234567\nE-Mail: info@musterkanzlei-mueller.de\nUSt-IdNr.: DE123456789",
    });

    // ─── 3. Client ───
    const { data: client } = await supabaseAdmin
      .from("clients")
      .insert({
        tenant_id: tenantId,
        company: "Beispiel GmbH",
        industry: "IT-Dienstleistungen",
        contact_name: "Anna Schmidt",
        contact_email: "schmidt@beispiel-gmbh.de",
        legal_form: "GmbH",
        founding_year: 2018,
        has_employees: true,
        accounting_mode: "Soll-Versteuerung",
        has_business_account: true,
        accounting_contact: "Anna Schmidt (Geschäftsführerin)",
        it_contact: "Markus Weber (IT-Leiter)",
        uses_external_payroll: true,
        tax_number: "143/123/12345",
        scope_org_units: "Hauptniederlassung München, 3 Mitarbeiter",
        scope_dv_systems: "DATEV Unternehmen online, Microsoft 365, Lexoffice",
        scope_processes:
          "Rechnungseingang, Rechnungsausgang, Zahlungsverkehr, Personalwesen",
        doc_owner_name: "Anna Schmidt",
        doc_owner_role: "Geschäftsführerin",
        process_owner_name: "Thomas Müller (Steuerberater)",
        it_owner_name: "Markus Weber",
        external_providers: "Musterkanzlei Müller & Partner (Steuerberatung), ADP (Lohnabrechnung)",
        onboarding_status: "completed",
      })
      .select()
      .single();

    const clientId = client!.id;

    // ─── 4. Project ───
    const { data: project } = await supabaseAdmin
      .from("projects")
      .insert({
        tenant_id: tenantId,
        client_id: clientId,
        name: "Verfahrensdokumentation 2024",
        status: "active",
        workflow_status: "data_entry",
      })
      .select()
      .single();

    const projectId = project!.id;

    // ─── 5. Onboarding (all 7 sections filled) ───
    const onboardingAnswers = {
      // Section 1: Unternehmen
      company_name: "Beispiel GmbH",
      legal_form: "GmbH",
      industry: "IT-Dienstleistungen",
      founding_year: "2018",
      // Section 2: Beteiligte Personen
      HAS_EMPLOYEES: true,
      HAS_TAX_ADVISOR: true,
      ACCOUNTING_CONTACT: "Anna Schmidt (Geschäftsführerin)",
      // Section 3: Buchhaltung
      BOOKKEEPING_BY: "tax_advisor",
      document_transfer_method: "DATEV Unternehmen online",
      // Section 4: Einnahmen & Rechnungen
      INVOICE_CREATION_TYPE: "software",
      HAS_CASH: false,
      USES_PAYMENT_PROVIDER: false,
      USES_MARKETPLACE: false,
      HAS_E_INVOICING: "no",
      // Section 5: Software & Systeme
      SOFTWARE_LIST:
        "DATEV Unternehmen online, Microsoft 365, Lexoffice (Rechnungsstellung)",
      USES_CLOUD: "yes",
      // Section 6: Bank & Zahlungsverkehr
      HAS_BUSINESS_ACCOUNT: true,
      USES_ONLINE_BANKING: true,
      HAS_AUTO_BANK_IMPORT: "yes",
      // Section 7: Dokumente & Belege
      DOCUMENT_TYPE: "mixed",
      HAS_SCAN_PROCESS: true,
    };

    await supabaseAdmin.from("project_onboarding").insert({
      project_id: projectId,
      answers: onboardingAnswers,
      completed_at: new Date().toISOString(),
    });

    // ─── 6. Chapter Data – realistic client_notes for active chapters ───

    // All chapters with realistic demo data
    const chapterEntries: Array<{
      chapter_key: string;
      client_notes: string | null;
      status: string;
      editor_text?: string | null;
    }> = [
      // ── Chapter 1: Allgemeine Beschreibung ──
      {
        chapter_key: "1_1",
        status: "client_submitted",
        client_notes: `Die Beispiel GmbH ist ein IT-Dienstleistungsunternehmen mit Sitz in München, gegründet 2018. Unsere Kerntätigkeit umfasst die Entwicklung individueller Softwarelösungen sowie IT-Beratung für mittelständische Unternehmen.

Ein typischer Auftrag beginnt mit einer Kundenanfrage per E-Mail oder Telefon. Nach einem Erstgespräch erstellen wir ein Angebot in Lexoffice. Bei Beauftragung wird ein Projektvertrag geschlossen und die Leistung erbracht. Nach Abschluss wird eine Rechnung über Lexoffice erstellt.

Geschäftstätigkeit wird belegt durch: Angebote, Auftragsbestätigungen, Projektverträge, Stundenzettel, Abnahmeprotokolle und Rechnungen. Diese Dokumente werden digital in Microsoft 365 (SharePoint) aufbewahrt, die Aufbewahrungsfrist beträgt 10 Jahre.

Die Beispiel GmbH ist eine Gesellschaft mit beschränkter Haftung (GmbH) und besteht seit 2018. Geschäftsführerin ist Anna Schmidt.`,
      },
      {
        chapter_key: "1_2",
        status: "client_submitted",
        client_notes: `Die Beispiel GmbH hat einen Standort in München mit 3 Mitarbeitern:

- Anna Schmidt (Geschäftsführerin) – verantwortlich für Finanzen, Vertrieb und Projektleitung
- Markus Weber (Senior Entwickler / IT-Leiter) – verantwortlich für Softwareentwicklung und IT-Infrastruktur
- Lisa Bauer (Junior Entwicklerin) – Softwareentwicklung und Kundensupport

Die Aufgabenverteilung ist klar geregelt: Anna Schmidt verantwortet alle kaufmännischen Prozesse, Markus Weber die technische Infrastruktur. Ein formales Organigramm existiert aufgrund der kleinen Unternehmensgröße nicht, die Zuständigkeiten sind jedoch in einer internen Dokumentation festgehalten.

Die Organisationsstruktur wird bei Personaländerungen aktualisiert, mindestens jedoch einmal jährlich überprüft.`,
      },
      {
        chapter_key: "1_3",
        status: "client_submitted",
        client_notes: `Für die Buchführung und steuerrelevante Prozesse ist primär Anna Schmidt (Geschäftsführerin) verantwortlich. Die laufende Buchführung wird von der Musterkanzlei Müller & Partner durchgeführt.

Vertretung: Bei Abwesenheit von Frau Schmidt werden dringende Zahlungsfreigaben von Markus Weber übernommen (eingeschränkte Bankvollmacht).

Zugriffsrechte:
- DATEV Unternehmen online: Anna Schmidt (Vollzugriff), Musterkanzlei (Vollzugriff)
- Lexoffice: Anna Schmidt (Administrator), Markus Weber (Lesezugriff für Rechnungen)
- Online-Banking: Anna Schmidt (Vollzugriff), Markus Weber (eingeschränkt, nur Überweisungen bis 5.000 €)

Zuständigkeiten sind in der internen IT-Dokumentation auf SharePoint festgehalten. Änderungen werden per Versionierung nachvollzogen.`,
      },
      {
        chapter_key: "1_4",
        status: "advisor_review",
        client_notes: `Die Buchführung erfolgt nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) in Verbindung mit den GoBD. Wir wenden die Soll-Versteuerung an.

Kontenrahmen: SKR04 (DATEV-Standard)
Buchungszeitraum: monatlich, Belege werden wöchentlich über DATEV Unternehmen online bereitgestellt.

Vollständigkeit wird sichergestellt durch:
- Fortlaufende Rechnungsnummern in Lexoffice
- Automatischer Bankdatenimport in DATEV
- Monatliche Abstimmung durch die Steuerberaterkanzlei

Die Einhaltung wird durch die Musterkanzlei Müller & Partner im Rahmen der laufenden Buchführung überwacht. Buchführungsrichtlinien und der Kontenplan sind in DATEV hinterlegt.

Abweichungen vom regulären Buchungsablauf (z.B. manuelle Korrekturbuchungen) werden vom Steuerberater dokumentiert und freigegeben.`,
        editor_text: `## 1.4 Buchführungsgrundsätze

### Grundlagen
Die Beispiel GmbH führt ihre Buchführung nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) gemäß §§ 238 ff. HGB in Verbindung mit den Grundsätzen zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff (GoBD, BMF-Schreiben vom 28.11.2019).

Es wird die **Soll-Versteuerung** gemäß § 16 Abs. 1 UStG angewendet.

### Kontenrahmen und Buchungssystematik
Die Buchführung erfolgt unter Verwendung des **Standardkontenrahmens SKR04** (DATEV). Der Kontenplan wird von der steuerberatenden Kanzlei Musterkanzlei Müller & Partner gepflegt und bei Bedarf angepasst.

### Buchungsrhythmus
- Belege werden **wöchentlich** über DATEV Unternehmen online an die Kanzlei übermittelt
- Die Verbuchung erfolgt **monatlich** durch die Kanzlei
- Eine Abstimmung der offenen Posten erfolgt **monatlich**

### Sicherstellung der Vollständigkeit
Die Vollständigkeit der Buchführung wird durch folgende Maßnahmen gewährleistet:

1. **Fortlaufende Rechnungsnummern** – automatisch generiert durch Lexoffice
2. **Automatischer Bankdatenimport** – täglicher Abruf der Kontoumsätze über die DATEV-Bankschnittstelle
3. **Monatliche Abstimmung** – Kontenabstimmung und Plausibilitätsprüfung durch die Steuerberaterkanzlei

### Abweichungen und Korrekturen
Abweichungen vom regulären Buchungsablauf (z. B. manuelle Korrekturbuchungen, Stornierungen) werden ausschließlich von der Steuerberaterkanzlei vorgenommen und mit einem Buchungstext dokumentiert, der den Grund der Korrektur enthält.

---
*[DEMO – Wasserzeichen: Dieses Dokument wurde mit Demodaten erstellt]*`,
      },
      {
        chapter_key: "1_5",
        status: "empty",
        client_notes: `Anna Schmidt ist als Geschäftsführerin für die Pflege der Verfahrensdokumentation verantwortlich. Unterstützt wird sie durch die Musterkanzlei Müller & Partner.

Die Dokumentation wird mindestens einmal jährlich überprüft, bei wesentlichen Änderungen an Prozessen oder IT-Systemen wird sie zeitnah aktualisiert.

Änderungen werden über die GoBD-Suite mit Versionierung dokumentiert. Die aktuelle Version der Verfahrensdokumentation wird in der GoBD-Suite gespeichert und ist für berechtigte Personen jederzeit abrufbar.`,
      },

      // ── Chapter 2: Anwenderdokumentation ──
      {
        chapter_key: "2_1",
        status: "client_submitted",
        client_notes: `Ausgangsrechnungen werden in Lexoffice erstellt. Der Prozess:

1. Projektabschluss oder Monatsende (bei laufenden Verträgen)
2. Anna Schmidt erstellt die Rechnung in Lexoffice basierend auf Stundenzetteln/Projektvertrag
3. Fortlaufende Rechnungsnummer wird automatisch von Lexoffice vergeben
4. Rechnung wird als PDF per E-Mail an den Kunden versendet
5. Gleichzeitig automatische Übertragung an DATEV Unternehmen online

Zuordnung: Jede Rechnung enthält die Projektnummer und wird in Lexoffice dem entsprechenden Kunden zugeordnet.

Archivierung: Rechnungen werden in Lexoffice (10 Jahre) und als Kopie auf SharePoint gespeichert.

Stornos und Korrekturrechnungen werden über die Stornofunktion in Lexoffice erstellt. Der Vorgang wird automatisch protokolliert.`,
      },
      {
        chapter_key: "2_2",
        status: "client_submitted",
        client_notes: `Eingangsrechnungen erreichen uns auf folgenden Wegen:
- Per E-Mail (ca. 90%) an rechnungen@beispiel-gmbh.de
- Per Post (ca. 10%) – werden sofort gescannt

Ablauf bei Eingang:
1. Rechnung wird in DATEV Unternehmen online hochgeladen (automatisch aus E-Mail-Postfach oder manuell nach Scan)
2. Anna Schmidt prüft die Rechnung sachlich und rechnerisch
3. Freigabe erfolgt direkt in DATEV Unternehmen online per Klick
4. Die Steuerberaterkanzlei verbucht die freigegebene Rechnung

Archivierung: Alle Eingangsrechnungen werden unveränderbar in DATEV Unternehmen online gespeichert (10 Jahre).

Mahnungen werden manuell geprüft. Strittige Rechnungen werden mit dem Lieferanten direkt geklärt und der Status in DATEV als Notiz vermerkt.`,
      },
      // 2_3 Kasse → inaktiv (kein Bargeld)
      // 2_4 Zahlungsanbieter → inaktiv
      // 2_5 Marktplatz → inaktiv
      {
        chapter_key: "2_6",
        status: "empty",
        client_notes: `Papierbelege (ca. 10% der Eingangsrechnungen) werden mit einem Dokumentenscanner (Fujitsu ScanSnap iX1600) digitalisiert.

Prozess:
1. Beleg wird zeitnah nach Eingang gescannt (spätestens am nächsten Arbeitstag)
2. Scan erfolgt als PDF, mindestens 300 dpi, in Farbe
3. Das gescannte Dokument wird in DATEV Unternehmen online hochgeladen
4. Nach erfolgreichem Upload und Prüfung wird das Papieroriginal für die gesetzliche Aufbewahrungsfrist aufbewahrt

Es wird kein ersetzendes Scannen nach TR-RESISCAN durchgeführt. Die Papieroriginale werden daher aufbewahrt.`,
      },
      {
        chapter_key: "2_7",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "2_8",
        status: "empty",
        client_notes: `Die Beispiel GmbH verfügt über ein Geschäftskonto bei der Sparkasse München.

Online-Banking wird über die Sparkassen-App und das Web-Portal durchgeführt. Automatischer Bankdatenimport in DATEV ist eingerichtet (täglicher Abruf).

Zahlungsfreigaben:
- Bis 5.000 €: Einzelfreigabe durch Anna Schmidt oder Markus Weber
- Über 5.000 €: Nur durch Anna Schmidt

Alle Kontobewegungen werden automatisch in DATEV importiert und von der Steuerberaterkanzlei den entsprechenden Buchungen zugeordnet.`,
      },
      {
        chapter_key: "2_9",
        status: "empty",
        client_notes: `Die Beispiel GmbH beschäftigt 2 Angestellte (neben der Geschäftsführerin).

Die Lohn- und Gehaltsabrechnung wird extern durch ADP Employer Services durchgeführt. Der Prozess:
1. Anna Schmidt übermittelt monatlich die Anwesenheitsdaten und ggf. Änderungen an ADP
2. ADP erstellt die Lohnabrechnungen
3. Die Lohndaten werden digital an DATEV übermittelt
4. Gehälter werden per Dauerauftrag bzw. Überweisung vom Geschäftskonto bezahlt

Personalakten werden digital auf SharePoint (verschlüsselter Ordner) aufbewahrt.`,
      },

      // ── Chapter 3: Technische Systemdokumentation ──
      {
        chapter_key: "3_1",
        status: "empty",
        client_notes: `Eingesetzte Buchhaltungssoftware:
- DATEV Unternehmen online (Hauptbuchhaltung, wird von der Steuerberaterkanzlei bedient)
- Lexoffice (Rechnungsstellung, Angebote, CRM)

DATEV: Cloud-basiert, Zugriff über Browser. Automatische Updates durch DATEV. Datenhaltung in DATEV-Rechenzentrum (Deutschland).

Lexoffice: Cloud-basiert (SaaS), Zugriff über Browser und App. Automatische Updates. Datenhaltung bei Lexware/Haufe (Deutschland).

Schnittstelle: Lexoffice → DATEV (automatischer Belegexport)`,
      },
      {
        chapter_key: "3_2",
        status: "empty",
        client_notes: null,
      },
      // 3_3 E-Rechnung → inaktiv
      {
        chapter_key: "3_4",
        status: "empty",
        client_notes: `Folgende Cloud-Dienste werden eingesetzt:
- Microsoft 365 Business (E-Mail, SharePoint, Teams)
- DATEV Unternehmen online
- Lexoffice
- GitHub (Softwareentwicklung)

Alle Dienste werden im SaaS-Modell genutzt. Datenhaltung erfolgt ausschließlich in deutschen bzw. EU-Rechenzentren. Verträge zur Auftragsverarbeitung (AVV) liegen für alle Anbieter vor.`,
      },
      {
        chapter_key: "3_5",
        status: "empty",
        client_notes: null,
      },
      // 3_6 Zahlungsplattformen → inaktiv

      // ── Chapter 4: Betriebsdokumentation ──
      {
        chapter_key: "4_1",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_2",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_3",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_4",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_5",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_6",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "4_7",
        status: "empty",
        client_notes: null,
      },

      // ── Chapter 5: Internes Kontrollsystem ──
      {
        chapter_key: "5_1",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "5_2",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "5_3",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "5_4",
        status: "empty",
        client_notes: null,
      },
      {
        chapter_key: "5_5",
        status: "empty",
        client_notes: null,
      },
    ];

    // Insert all chapter data
    const chapterInserts = chapterEntries.map((ch) => ({
      project_id: projectId,
      chapter_key: ch.chapter_key,
      client_notes: ch.client_notes,
      submitted_client_notes:
        ch.status === "client_submitted" || ch.status === "advisor_review"
          ? ch.client_notes
          : null,
      submitted_at:
        ch.status === "client_submitted" || ch.status === "advisor_review"
          ? new Date().toISOString()
          : null,
      editor_text: ch.editor_text || null,
      status: ch.status,
    }));

    await supabaseAdmin.from("chapter_data").insert(chapterInserts);

    return new Response(
      JSON.stringify({
        success: true,
        tenantId,
        clientId,
        projectId,
        message:
          "Demo-Daten erfolgreich angelegt: Musterkanzlei Müller & Partner → Beispiel GmbH → Verfahrensdokumentation 2024",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Seed error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Seed failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
