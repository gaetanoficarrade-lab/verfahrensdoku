import { supabase } from '@/integrations/supabase/client';
import { GOBD_CHAPTERS } from './chapter-structure';
import type { OnboardingAnswers } from './onboarding-variables';

const DEMO_ONBOARDING: OnboardingAnswers = {
  company_name: 'Muster GmbH',
  legal_form: 'GmbH',
  industry: 'Unternehmensberatung',
  founding_year: '2020',
  HAS_EMPLOYEES: true,
  HAS_TAX_ADVISOR: true,
  ACCOUNTING_CONTACT: 'Max Mustermann',
  BOOKKEEPING_BY: 'tax_advisor',
  document_transfer_method: 'DATEV Unternehmen online',
  INVOICE_CREATION_TYPE: 'lexoffice',
  HAS_CASH: false,
  USES_PAYMENT_PROVIDER: false,
  USES_MARKETPLACE: false,
  HAS_E_INVOICING: 'no',
  SOFTWARE_LIST: 'Lexoffice, Microsoft 365, DATEV',
  USES_CLOUD: 'yes',
  HAS_BUSINESS_ACCOUNT: true,
  USES_ONLINE_BANKING: true,
  HAS_AUTO_BANK_IMPORT: 'yes',
  DOCUMENT_TYPE: 'digital',
  HAS_SCAN_PROCESS: false,
};

export async function seedDemoData() {
  const errors: string[] = [];

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
    if (error) throw new Error(`Plan-Fehler: ${error.message}`);
    planId = newPlan.id;
  }
  console.log('[SEED] Plan ID:', planId);

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
  if (tenantErr) throw new Error(`Tenant-Fehler: ${tenantErr.message}`);
  const tenantId = tenant.id;
  console.log('[SEED] Tenant ID:', tenantId);

  // ─── Tenant Settings ───
  const { error: tsErr } = await supabase.from('tenant_settings').insert({
    tenant_id: tenantId,
    brand_name: 'Musterkanzlei Müller & Partner',
    primary_color: '#1e3a5f',
    address: 'Kanzleistraße 12, 80333 München',
    phone: '+49 89 1234567',
    website: 'https://www.musterkanzlei-mueller.de',
    imprint: 'Musterkanzlei Müller & Partner\nKanzleistraße 12\n80333 München\nTel: +49 89 1234567\nE-Mail: info@musterkanzlei-mueller.de\nUSt-IdNr.: DE123456789',
  });
  if (tsErr) errors.push(`Tenant-Settings: ${tsErr.message}`);

  // ─── 3. Client (Kunde) – Muster GmbH ───
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      tenant_id: tenantId,
      company: 'Muster GmbH',
      industry: 'Unternehmensberatung',
      contact_name: 'Max Mustermann',
      contact_email: 'mustermann@muster-gmbh.de',
      legal_form: 'GmbH',
      founding_year: 2020,
      has_employees: true,
      accounting_mode: 'Soll-Versteuerung',
      has_business_account: true,
      accounting_contact: 'Max Mustermann',
      it_contact: 'Max Mustermann',
      uses_external_payroll: false,
      tax_number: '143/123/12345',
      scope_org_units: 'Hauptniederlassung München',
      scope_dv_systems: 'DATEV Unternehmen online, Microsoft 365, Lexoffice',
      scope_processes: 'Rechnungseingang, Rechnungsausgang, Zahlungsverkehr',
      doc_owner_name: 'Max Mustermann',
      doc_owner_role: 'Geschäftsführer',
      process_owner_name: 'Thomas Müller (Steuerberater)',
      it_owner_name: 'Max Mustermann',
      external_providers: 'Musterkanzlei Müller & Partner (Steuerberatung)',
      onboarding_status: 'completed',
    })
    .select()
    .single();
  if (clientErr) throw new Error(`Client-Fehler: ${clientErr.message} (Code: ${clientErr.code}, Details: ${clientErr.details})`);
  if (!client) throw new Error('Client wurde nicht erstellt – kein Datensatz zurückgegeben');
  const clientId = client.id;
  console.log('[SEED] Client ID:', clientId);

  // ─── Verify client was actually persisted ───
  const { data: verifyClient, error: verifyErr } = await supabase
    .from('clients')
    .select('id, company, tenant_id')
    .eq('id', clientId)
    .single();
  if (verifyErr || !verifyClient) {
    throw new Error(`Client-Verifizierung fehlgeschlagen: ${verifyErr?.message || 'Nicht gefunden'}. Der Kunde wurde möglicherweise durch RLS blockiert.`);
  }
  console.log('[SEED] Client verified:', verifyClient);

  // ─── 4. Project ───
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .insert({
      tenant_id: tenantId,
      client_id: clientId,
      name: 'Verfahrensdokumentation 2024',
      status: 'active',
      workflow_status: 'in_progress',
    })
    .select()
    .single();
  if (projErr) throw new Error(`Project-Fehler: ${projErr.message} (Code: ${projErr.code})`);
  if (!project) throw new Error('Projekt wurde nicht erstellt');
  const projectId = project.id;
  console.log('[SEED] Project ID:', projectId);

  // ─── 5. Onboarding (completed → chapter structure visible) ───
  const { error: onbErr } = await supabase.from('project_onboarding').insert({
    project_id: projectId,
    answers: DEMO_ONBOARDING,
    completed_at: new Date().toISOString(),
  });
  if (onbErr) errors.push(`Onboarding: ${onbErr.message}`);

  // ─── 6. Chapter Data – structure only, NO content ───
  // Leitfragen are visible, but all text fields remain empty.
  // The tester must enter content themselves to test AI features.
  const chapterInserts: any[] = [];

  for (const mainCh of GOBD_CHAPTERS) {
    for (const sc of mainCh.subChapters) {
      const isActive = sc.isActive(DEMO_ONBOARDING);

      chapterInserts.push({
        project_id: projectId,
        chapter_key: sc.key,
        client_notes: null,
        submitted_client_notes: null,
        submitted_at: null,
        client_precheck_hints: null,
        generated_text: null,
        editor_text: null,
        status: isActive ? 'open' : 'inactive',
        precheck_hints_count: 0,
      });
    }
  }

  const { error: chapterErr } = await supabase.from('chapter_data').insert(chapterInserts);
  if (chapterErr) errors.push(`Kapitel: ${chapterErr.message}`);
  console.log('[SEED] Chapters inserted:', chapterInserts.length);

  // ─── Final verification ───
  const [vClient, vProject, vChapters, vOnb] = await Promise.all([
    supabase.from('clients').select('id').eq('id', clientId).single(),
    supabase.from('projects').select('id').eq('id', projectId).single(),
    supabase.from('chapter_data').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('project_onboarding').select('id').eq('project_id', projectId).maybeSingle(),
  ]);

  const verification = {
    clientExists: !!vClient.data,
    projectExists: !!vProject.data,
    chapterCount: vChapters.count || 0,
    onboardingExists: !!vOnb.data,
  };
  console.log('[SEED] Final verification:', verification);

  const warningMsg = errors.length > 0 ? `\n⚠️ Warnungen: ${errors.join(', ')}` : '';

  return {
    tenantId,
    clientId,
    projectId,
    verification,
    message: `Mustermandant angelegt:\n• Tenant: ${tenantId}\n• Client: Muster GmbH (${verification.clientExists ? '✓' : '✗'})\n• Projekt: ${projectId} (${verification.projectExists ? '✓' : '✗'})\n• Kapitel: ${verification.chapterCount} (alle leer – Leitfragen sichtbar)\n• Onboarding: ${verification.onboardingExists ? '✓' : '✗'}${warningMsg}`,
  };
}
