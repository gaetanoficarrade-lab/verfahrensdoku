import { supabase } from '@/integrations/supabase/client';

export async function seedDemoData() {
  // ─── 1. Find or create Professional plan ───
  let planId: string;
  const { data: existingPlan } = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Professional')
    .maybeSingle();

  if (existingPlan) {
    planId = existingPlan.id;
  } else {
    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert({ name: 'Professional', max_clients: 25, max_projects: 50, price_monthly: 149.0 })
      .select()
      .single();
    if (error) throw error;
    planId = newPlan.id;
  }

  // ─── 2. Tenant ───
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .insert({
      name: 'Musterkanzlei Müller & Partner',
      contact_name: 'Thomas Müller',
      contact_email: 'mueller@musterkanzlei.de',
      plan_id: planId,
      is_active: true,
    })
    .select()
    .single();
  if (tenantErr) throw tenantErr;

  const tenantId = tenant.id;

  // ─── Tenant Settings ───
  await supabase.from('tenant_settings').insert({
    tenant_id: tenantId,
    brand_name: 'Musterkanzlei Müller & Partner',
    primary_color: '#1e3a5f',
    address: 'Kanzleistraße 12, 80333 München',
    phone: '+49 89 1234567',
    website: 'https://www.musterkanzlei-mueller.de',
    imprint:
      'Musterkanzlei Müller & Partner\nKanzleistraße 12\n80333 München\nTel: +49 89 1234567\nE-Mail: info@musterkanzlei-mueller.de\nUSt-IdNr.: DE123456789',
  });

  // ─── 3. Client ───
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      tenant_id: tenantId,
      company: 'Beispiel GmbH',
      industry: 'IT-Dienstleistungen',
      contact_name: 'Anna Schmidt',
      contact_email: 'schmidt@beispiel-gmbh.de',
      legal_form: 'GmbH',
      founding_year: 2018,
      has_employees: true,
      accounting_mode: 'Soll-Versteuerung',
      has_business_account: true,
      accounting_contact: 'Anna Schmidt (Geschäftsführerin)',
      it_contact: 'Markus Weber (IT-Leiter)',
      uses_external_payroll: true,
      tax_number: '143/123/12345',
      scope_org_units: 'Hauptniederlassung München, 3 Mitarbeiter',
      scope_dv_systems: 'DATEV Unternehmen online, Microsoft 365, Lexoffice',
      scope_processes: 'Rechnungseingang, Rechnungsausgang, Zahlungsverkehr, Personalwesen',
      doc_owner_name: 'Anna Schmidt',
      doc_owner_role: 'Geschäftsführerin',
      process_owner_name: 'Thomas Müller (Steuerberater)',
      it_owner_name: 'Markus Weber',
      external_providers: 'Musterkanzlei Müller & Partner (Steuerberatung), ADP (Lohnabrechnung)',
      onboarding_status: 'completed',
    })
    .select()
    .single();
  if (clientErr) throw clientErr;

  const clientId = client.id;

  // ─── 4. Project ───
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      tenant_id: tenantId,
      client_id: clientId,
      name: 'Verfahrensdokumentation 2024',
      status: 'active',
      workflow_status: 'data_entry',
    })
    .select()
    .single();
  if (projErr) throw projErr;

  const projectId = project.id;

  // ─── 5. Onboarding ───
  const onboardingAnswers = {
    company_name: 'Beispiel GmbH',
    legal_form: 'GmbH',
    industry: 'IT-Dienstleistungen',
    founding_year: '2018',
    HAS_EMPLOYEES: true,
    HAS_TAX_ADVISOR: true,
    ACCOUNTING_CONTACT: 'Anna Schmidt (Geschäftsführerin)',
    BOOKKEEPING_BY: 'tax_advisor',
    document_transfer_method: 'DATEV Unternehmen online',
    INVOICE_CREATION_TYPE: 'software',
    HAS_CASH: false,
    USES_PAYMENT_PROVIDER: false,
    USES_MARKETPLACE: false,
    HAS_E_INVOICING: 'no',
    SOFTWARE_LIST: 'DATEV Unternehmen online, Microsoft 365, Lexoffice (Rechnungsstellung)',
    USES_CLOUD: 'yes',
    HAS_BUSINESS_ACCOUNT: true,
    USES_ONLINE_BANKING: true,
    HAS_AUTO_BANK_IMPORT: 'yes',
    DOCUMENT_TYPE: 'mixed',
    HAS_SCAN_PROCESS: true,
  };

  await supabase.from('project_onboarding').insert({
    project_id: projectId,
    answers: onboardingAnswers,
    completed_at: new Date().toISOString(),
  });

  // ─── 6. Chapter Data ───
  const now = new Date().toISOString();

  const chapters = [
    {
      chapter_key: '1_1',
      status: 'client_submitted',
      client_notes: `Die Beispiel GmbH ist ein IT-Dienstleistungsunternehmen mit Sitz in München, gegründet 2018. Unsere Kerntätigkeit umfasst die Entwicklung individueller Softwarelösungen sowie IT-Beratung für mittelständische Unternehmen.\n\nEin typischer Auftrag beginnt mit einer Kundenanfrage per E-Mail oder Telefon. Nach einem Erstgespräch erstellen wir ein Angebot in Lexoffice. Bei Beauftragung wird ein Projektvertrag geschlossen und die Leistung erbracht. Nach Abschluss wird eine Rechnung über Lexoffice erstellt.\n\nGeschäftstätigkeit wird belegt durch: Angebote, Auftragsbestätigungen, Projektverträge, Stundenzettel, Abnahmeprotokolle und Rechnungen. Diese Dokumente werden digital in Microsoft 365 (SharePoint) aufbewahrt, die Aufbewahrungsfrist beträgt 10 Jahre.\n\nDie Beispiel GmbH ist eine Gesellschaft mit beschränkter Haftung (GmbH) und besteht seit 2018. Geschäftsführerin ist Anna Schmidt.`,
    },
    {
      chapter_key: '1_2',
      status: 'client_submitted',
      client_notes: `Die Beispiel GmbH hat einen Standort in München mit 3 Mitarbeitern:\n\n- Anna Schmidt (Geschäftsführerin) – verantwortlich für Finanzen, Vertrieb und Projektleitung\n- Markus Weber (Senior Entwickler / IT-Leiter) – verantwortlich für Softwareentwicklung und IT-Infrastruktur\n- Lisa Bauer (Junior Entwicklerin) – Softwareentwicklung und Kundensupport\n\nDie Aufgabenverteilung ist klar geregelt: Anna Schmidt verantwortet alle kaufmännischen Prozesse, Markus Weber die technische Infrastruktur. Ein formales Organigramm existiert aufgrund der kleinen Unternehmensgröße nicht, die Zuständigkeiten sind jedoch in einer internen Dokumentation festgehalten.\n\nDie Organisationsstruktur wird bei Personaländerungen aktualisiert, mindestens jedoch einmal jährlich überprüft.`,
    },
    {
      chapter_key: '1_3',
      status: 'client_submitted',
      client_notes: `Für die Buchführung und steuerrelevante Prozesse ist primär Anna Schmidt (Geschäftsführerin) verantwortlich. Die laufende Buchführung wird von der Musterkanzlei Müller & Partner durchgeführt.\n\nVertretung: Bei Abwesenheit von Frau Schmidt werden dringende Zahlungsfreigaben von Markus Weber übernommen (eingeschränkte Bankvollmacht).\n\nZugriffsrechte:\n- DATEV Unternehmen online: Anna Schmidt (Vollzugriff), Musterkanzlei (Vollzugriff)\n- Lexoffice: Anna Schmidt (Administrator), Markus Weber (Lesezugriff)\n- Online-Banking: Anna Schmidt (Vollzugriff), Markus Weber (eingeschränkt, bis 5.000 €)\n\nZuständigkeiten sind in der internen IT-Dokumentation auf SharePoint festgehalten.`,
    },
    {
      chapter_key: '1_4',
      status: 'advisor_review',
      client_notes: `Die Buchführung erfolgt nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) in Verbindung mit den GoBD. Wir wenden die Soll-Versteuerung an.\n\nKontenrahmen: SKR04 (DATEV-Standard)\nBuchungszeitraum: monatlich, Belege werden wöchentlich über DATEV Unternehmen online bereitgestellt.\n\nVollständigkeit wird sichergestellt durch:\n- Fortlaufende Rechnungsnummern in Lexoffice\n- Automatischer Bankdatenimport in DATEV\n- Monatliche Abstimmung durch die Steuerberaterkanzlei`,
      editor_text: `## 1.4 Buchführungsgrundsätze\n\n### Grundlagen\nDie Beispiel GmbH führt ihre Buchführung nach den Grundsätzen ordnungsmäßiger Buchführung (GoB) gemäß §§ 238 ff. HGB in Verbindung mit den GoBD (BMF-Schreiben vom 28.11.2019).\n\nEs wird die **Soll-Versteuerung** gemäß § 16 Abs. 1 UStG angewendet.\n\n### Kontenrahmen und Buchungssystematik\nDie Buchführung erfolgt unter Verwendung des **Standardkontenrahmens SKR04** (DATEV). Der Kontenplan wird von der Musterkanzlei Müller & Partner gepflegt.\n\n### Buchungsrhythmus\n- Belege werden **wöchentlich** über DATEV Unternehmen online übermittelt\n- Die Verbuchung erfolgt **monatlich** durch die Kanzlei\n- Abstimmung der offenen Posten erfolgt **monatlich**\n\n### Sicherstellung der Vollständigkeit\n1. **Fortlaufende Rechnungsnummern** – automatisch durch Lexoffice\n2. **Automatischer Bankdatenimport** – täglicher Abruf über DATEV-Bankschnittstelle\n3. **Monatliche Abstimmung** – durch die Steuerberaterkanzlei\n\n### Abweichungen und Korrekturen\nAbweichungen (z. B. Korrekturbuchungen, Stornierungen) werden ausschließlich von der Steuerberaterkanzlei vorgenommen und dokumentiert.\n\n---\n*[DEMO – Wasserzeichen: Dieses Dokument wurde mit Demodaten erstellt]*`,
    },
    {
      chapter_key: '1_5',
      status: 'empty',
      client_notes: `Anna Schmidt ist als Geschäftsführerin für die Pflege der Verfahrensdokumentation verantwortlich. Die Dokumentation wird mindestens einmal jährlich überprüft.`,
    },
    {
      chapter_key: '2_1',
      status: 'client_submitted',
      client_notes: `Ausgangsrechnungen werden in Lexoffice erstellt. Fortlaufende Rechnungsnummer wird automatisch vergeben. Rechnung wird als PDF per E-Mail versendet und automatisch an DATEV übertragen. Archivierung in Lexoffice (10 Jahre) und SharePoint.`,
    },
    {
      chapter_key: '2_2',
      status: 'client_submitted',
      client_notes: `Eingangsrechnungen per E-Mail (90%) und Post (10%, werden gescannt). Ablauf: Upload in DATEV → sachliche/rechnerische Prüfung durch Anna Schmidt → Freigabe in DATEV → Verbuchung durch Steuerberater. Archivierung in DATEV (10 Jahre).`,
    },
    {
      chapter_key: '2_6',
      status: 'empty',
      client_notes: `Papierbelege werden mit Fujitsu ScanSnap iX1600 digitalisiert (PDF, 300 dpi, Farbe). Upload in DATEV. Kein ersetzendes Scannen – Papieroriginale werden aufbewahrt.`,
    },
    {
      chapter_key: '2_7', status: 'empty', client_notes: null,
    },
    {
      chapter_key: '2_8',
      status: 'empty',
      client_notes: `Geschäftskonto bei Sparkasse München. Online-Banking über Sparkassen-App. Automatischer Bankdatenimport in DATEV. Zahlungsfreigaben: bis 5.000 € Einzelfreigabe, über 5.000 € nur durch Geschäftsführerin.`,
    },
    {
      chapter_key: '2_9',
      status: 'empty',
      client_notes: `2 Angestellte. Lohnabrechnung extern durch ADP. Monatliche Datenübermittlung an ADP → Lohnabrechnungen → Lohndaten an DATEV. Personalakten digital auf SharePoint.`,
    },
    {
      chapter_key: '3_1',
      status: 'empty',
      client_notes: `DATEV Unternehmen online (Hauptbuchhaltung, Cloud). Lexoffice (Rechnungsstellung, Cloud). Schnittstelle: Lexoffice → DATEV (automatischer Belegexport).`,
    },
    { chapter_key: '3_2', status: 'empty', client_notes: null },
    {
      chapter_key: '3_4',
      status: 'empty',
      client_notes: `Cloud-Dienste: Microsoft 365 Business, DATEV, Lexoffice, GitHub. Alle SaaS, Datenhaltung in DE/EU. AVV liegt für alle Anbieter vor.`,
    },
    { chapter_key: '3_5', status: 'empty', client_notes: null },
    { chapter_key: '4_1', status: 'empty', client_notes: null },
    { chapter_key: '4_2', status: 'empty', client_notes: null },
    { chapter_key: '4_3', status: 'empty', client_notes: null },
    { chapter_key: '4_4', status: 'empty', client_notes: null },
    { chapter_key: '4_5', status: 'empty', client_notes: null },
    { chapter_key: '4_6', status: 'empty', client_notes: null },
    { chapter_key: '4_7', status: 'empty', client_notes: null },
    { chapter_key: '5_1', status: 'empty', client_notes: null },
    { chapter_key: '5_2', status: 'empty', client_notes: null },
    { chapter_key: '5_3', status: 'empty', client_notes: null },
    { chapter_key: '5_4', status: 'empty', client_notes: null },
    { chapter_key: '5_5', status: 'empty', client_notes: null },
  ];

  const chapterInserts = chapters.map((ch) => ({
    project_id: projectId,
    chapter_key: ch.chapter_key,
    client_notes: ch.client_notes,
    submitted_client_notes:
      ch.status === 'client_submitted' || ch.status === 'advisor_review'
        ? ch.client_notes
        : null,
    submitted_at:
      ch.status === 'client_submitted' || ch.status === 'advisor_review' ? now : null,
    editor_text: (ch as any).editor_text || null,
    status: ch.status,
  }));

  const { error: chapterErr } = await supabase.from('chapter_data').insert(chapterInserts);
  if (chapterErr) throw chapterErr;

  return {
    tenantId,
    clientId,
    projectId,
    message: 'Demo-Daten erfolgreich angelegt: Musterkanzlei Müller & Partner → Beispiel GmbH → Verfahrensdokumentation 2024',
  };
}
