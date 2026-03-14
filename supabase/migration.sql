-- =====================================================
-- GoBD-Suite: Vollständiges Datenbankschema
-- Ausführen in Supabase SQL Editor
-- =====================================================

-- 1. ENUMS
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin', 'tenant_user', 'client');
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE public.project_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE public.workflow_status AS ENUM ('onboarding', 'data_entry', 'precheck', 'review', 'client_approval', 'finalized', 'submitted');
CREATE TYPE public.chapter_status AS ENUM ('empty', 'client_draft', 'client_submitted', 'advisor_review', 'advisor_approved', 'finalized');
CREATE TYPE public.document_status AS ENUM ('draft', 'review', 'approved', 'finalized');
CREATE TYPE public.workflow_action AS ENUM (
  'created', 'submitted', 'returned', 'approved', 'finalized',
  'draft_ready', 'client_approved', 'submitted_incomplete',
  'chapter_submitted', 'chapter_returned', 'chapter_approved',
  'comment_added'
);

-- 2. TABLES
-- =====================================================

-- Plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  max_clients INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 10,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Tenants (Lizenznehmer / Kanzleien)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  plan_id UUID REFERENCES public.plans(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (auto-created via trigger)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tenant_id UUID REFERENCES public.tenants(id),
  first_name TEXT,
  last_name TEXT,
  email TEXT
);

-- User Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Clients (Mandanten)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  industry TEXT,
  contact_name TEXT,
  contact_email TEXT,
  user_id UUID REFERENCES auth.users(id),
  legal_form TEXT,
  founding_year INTEGER,
  has_employees BOOLEAN DEFAULT false,
  accounting_mode TEXT,
  has_business_account BOOLEAN DEFAULT false,
  accounting_contact TEXT,
  it_contact TEXT,
  uses_external_payroll BOOLEAN DEFAULT false,
  tax_number TEXT,
  scope_org_units TEXT,
  scope_dv_systems TEXT,
  scope_processes TEXT,
  doc_owner_name TEXT,
  doc_owner_role TEXT,
  process_owner_name TEXT,
  it_owner_name TEXT,
  external_providers TEXT,
  prefill_confidence JSONB DEFAULT '{}'::jsonb,
  onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'draft',
  workflow_status workflow_status NOT NULL DEFAULT 'onboarding',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  draft_ready_at TIMESTAMPTZ,
  client_approved_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ,
  submitted_incomplete_at TIMESTAMPTZ,
  incomplete_chapters_count INTEGER DEFAULT 0
);

-- Project Onboarding (1:1 with project)
CREATE TABLE public.project_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  answers JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ
);

-- Chapter Data
CREATE TABLE public.chapter_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  chapter_key TEXT NOT NULL,
  client_notes TEXT,
  submitted_client_notes TEXT,
  submitted_at TIMESTAMPTZ,
  client_precheck_hints TEXT,
  generated_text TEXT,
  generated_hints TEXT,
  editor_text TEXT,
  advisor_notes TEXT,
  status chapter_status NOT NULL DEFAULT 'empty',
  precheck_hints_count INTEGER DEFAULT 0,
  UNIQUE (project_id, chapter_key)
);

-- Chapter Files
CREATE TABLE public.chapter_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_data_id UUID NOT NULL REFERENCES public.chapter_data(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document Versions
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  status document_status NOT NULL DEFAULT 'draft',
  pdf_path TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document Workflow Log (append-only)
CREATE TABLE public.document_workflow_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_version_id UUID REFERENCES public.document_versions(id),
  user_id UUID REFERENCES auth.users(id),
  action workflow_action NOT NULL,
  comment TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Client Change Log
CREATE TABLE public.client_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  source TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invite Tokens
CREATE TABLE public.invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit Log (append-only)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. FUNCTIONS
-- =====================================================

-- has_role: Check if user has a specific role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- get_user_tenant_id: Get the tenant_id for a user (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- handle_new_user: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id UUID;
  _first_name TEXT;
  _last_name TEXT;
  _is_team_invite BOOLEAN;
BEGIN
  _first_name := NEW.raw_user_meta_data ->> 'first_name';
  _last_name := NEW.raw_user_meta_data ->> 'last_name';
  _tenant_id := (NEW.raw_user_meta_data ->> 'tenant_id')::UUID;
  _is_team_invite := (NEW.raw_user_meta_data ->> 'team_invite') = 'true';

  INSERT INTO public.profiles (user_id, tenant_id, first_name, last_name, email)
  VALUES (NEW.id, _tenant_id, _first_name, _last_name, NEW.email);

  IF NEW.raw_user_meta_data ->> 'invite_token' IS NOT NULL THEN
    -- Team invite: assign tenant_user role
    IF _is_team_invite THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tenant_user')
      ON CONFLICT DO NOTHING;
    ELSE
      -- Client invite: assign client role and link to client
      INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'client')
      ON CONFLICT DO NOTHING;

      IF NEW.raw_user_meta_data ->> 'client_id' IS NOT NULL THEN
        UPDATE public.clients
        SET user_id = NEW.id
        WHERE id = (NEW.raw_user_meta_data ->> 'client_id')::UUID;
      END IF;
    END IF;

    -- Mark invite token as used
    UPDATE public.invite_tokens
    SET is_active = false, used_by = NEW.id, used_at = now()
    WHERE token = NEW.raw_user_meta_data ->> 'invite_token';
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent UPDATE/DELETE on audit_log
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit-Log-Einträge dürfen nicht geändert oder gelöscht werden.';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();

-- Prevent UPDATE/DELETE on document_workflow_log
CREATE OR REPLACE FUNCTION public.prevent_workflow_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Workflow-Log-Einträge dürfen nicht geändert oder gelöscht werden.';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_workflow_log_update
  BEFORE UPDATE ON public.document_workflow_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_workflow_log_modification();

CREATE TRIGGER prevent_workflow_log_delete
  BEFORE DELETE ON public.document_workflow_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_workflow_log_modification();


-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_workflow_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;


-- 5. RLS POLICIES
-- =====================================================

-- Plans: readable by all authenticated users
CREATE POLICY "Plans are readable" ON public.plans
  FOR SELECT TO authenticated USING (true);

-- Super admins can manage plans
CREATE POLICY "Super admins manage plans" ON public.plans
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Tenants: users see only their own tenant
CREATE POLICY "Users see own tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage tenants" ON public.tenants
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Profiles: users see profiles in their tenant
CREATE POLICY "Users see own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- User Roles: only readable by super_admin or own
CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Clients: tenant isolation
CREATE POLICY "Tenant users see own clients" ON public.clients
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Tenant admins manage clients" ON public.clients
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'tenant_user')))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Client users see their own client record
CREATE POLICY "Client users see own client" ON public.clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Projects: tenant isolation
CREATE POLICY "Tenant users see own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Tenant admins manage projects" ON public.projects
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'tenant_user')))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Client users see projects linked to their client
CREATE POLICY "Client sees own projects" ON public.projects
  FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  );

-- Project Onboarding: follows project access
CREATE POLICY "Project onboarding tenant access" ON public.project_onboarding
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Client users can read and update their own project onboarding
CREATE POLICY "Client users access own onboarding" ON public.project_onboarding
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.clients c ON p.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- Chapter Data: follows project access (tenant + client)
CREATE POLICY "Chapter data tenant access" ON public.chapter_data
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    )
    OR project_id IN (
      SELECT p.id FROM public.projects p
      JOIN public.clients c ON p.client_id = c.id
      WHERE c.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Chapter Files: follows chapter access
CREATE POLICY "Chapter files tenant access" ON public.chapter_files
  FOR ALL TO authenticated
  USING (
    chapter_data_id IN (
      SELECT cd.id FROM public.chapter_data cd
      JOIN public.projects p ON cd.project_id = p.id
      WHERE p.tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Document Versions: follows project access
CREATE POLICY "Document versions tenant access" ON public.document_versions
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Document Workflow Log: tenant read, insert only
CREATE POLICY "Workflow log tenant read" ON public.document_workflow_log
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Workflow log insert" ON public.document_workflow_log
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Client Change Log: tenant access
CREATE POLICY "Client change log tenant access" ON public.client_change_log
  FOR ALL TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Invite Tokens: tenant access + anon SELECT for registration validation
CREATE POLICY "Tenant manages invite tokens" ON public.invite_tokens
  FOR ALL TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Anon can validate invite tokens" ON public.invite_tokens
  FOR SELECT TO anon
  USING (is_active = true AND expires_at > now());

-- Audit Log: tenant read, insert only
CREATE POLICY "Audit log tenant read" ON public.audit_log
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Audit log insert" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin')
  );


-- 6. STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('chapter-uploads', 'chapter-uploads', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('document-versions', 'document-versions', false);

-- Storage RLS: tenant-based access
CREATE POLICY "Tenant users access chapter uploads"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'chapter-uploads')
  WITH CHECK (bucket_id = 'chapter-uploads');

CREATE POLICY "Tenant users access document versions"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'document-versions')
  WITH CHECK (bucket_id = 'document-versions');


-- 7. INDEXES
-- =====================================================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_tenant_id ON public.profiles(tenant_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_clients_tenant_id ON public.clients(tenant_id);
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_projects_tenant_id ON public.projects(tenant_id);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_chapter_data_project_id ON public.chapter_data(project_id);
CREATE INDEX idx_chapter_files_chapter_data_id ON public.chapter_files(chapter_data_id);
CREATE INDEX idx_document_versions_project_id ON public.document_versions(project_id);
CREATE INDEX idx_document_workflow_log_project_id ON public.document_workflow_log(project_id);
CREATE INDEX idx_client_change_log_client_id ON public.client_change_log(client_id);
CREATE INDEX idx_invite_tokens_token ON public.invite_tokens(token);
CREATE INDEX idx_invite_tokens_tenant_id ON public.invite_tokens(tenant_id);
CREATE INDEX idx_audit_log_tenant_id ON public.audit_log(tenant_id);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_tenant_settings_tenant_id ON public.tenant_settings(tenant_id);


-- 8. TENANT SETTINGS
-- =====================================================

CREATE TABLE public.tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  brand_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e3a5f',
  address TEXT,
  phone TEXT,
  website TEXT,
  imprint TEXT,
  imprint_url TEXT,
  privacy_text TEXT,
  privacy_url TEXT,
  button_text_color TEXT,
  menu_text_color TEXT,
  brand_text_color TEXT,
  sidebar_bg_color TEXT,
  menu_active_color TEXT,
  menu_active_text_color TEXT,
  font_family TEXT,
  custom_css TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_tenant_settings
  BEFORE UPDATE ON public.tenant_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: tenant_admin can read and write own settings
CREATE POLICY "Tenant admin reads own settings" ON public.tenant_settings
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Tenant admin manages own settings" ON public.tenant_settings
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- All tenant users can read settings (for branding display)
CREATE POLICY "Tenant users read settings" ON public.tenant_settings
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Storage bucket for tenant assets (logos etc.)
INSERT INTO storage.buckets (id, name, public) VALUES ('tenant-assets', 'tenant-assets', true);

CREATE POLICY "Tenant admins manage tenant assets"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'tenant-assets')
  WITH CHECK (bucket_id = 'tenant-assets');


-- 9. WEBHOOK TABLES
-- =====================================================

CREATE TABLE public.tenant_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.tenant_webhooks(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tenant_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tenant_webhooks_tenant_id ON public.tenant_webhooks(tenant_id);
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_tenant_id ON public.webhook_logs(tenant_id);

-- RLS: tenant_admin can manage own webhooks
CREATE POLICY "Tenant admin manages webhooks" ON public.tenant_webhooks
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Tenant admin reads webhook logs" ON public.webhook_logs
  FOR SELECT TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Webhook logs insert" ON public.webhook_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );


-- 10. SEED DATA: Plans
-- =====================================================

INSERT INTO public.plans (name, max_clients, max_projects, price_monthly) VALUES
  ('Starter', 5, 10, 49.00),
  ('Professional', 25, 50, 149.00),
  ('Enterprise', 100, 500, 399.00);


-- 11. PLATFORM SETTINGS (Super-Admin)
-- =====================================================

CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_platform_settings
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Only super_admin can read and write platform settings
CREATE POLICY "Super admin manages platform settings" ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- All authenticated users can read legal settings (for footer display)
CREATE POLICY "All users read legal settings" ON public.platform_settings
  FOR SELECT TO authenticated
  USING (key = 'legal');


-- 12. AFFILIATE SYSTEM
-- =====================================================

-- Affiliate Programs (global config by super_admin)
CREATE TABLE public.affiliate_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Standard',
  commission_percent NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  cookie_lifetime_days INTEGER NOT NULL DEFAULT 90,
  min_payout NUMERIC(10,2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate Links (one per tenant)
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  program_id UUID REFERENCES public.affiliate_programs(id),
  slug TEXT NOT NULL UNIQUE,
  previous_slugs JSONB DEFAULT '[]'::jsonb,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate Clicks (tracking)
CREATE TABLE public.affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  ip_hash TEXT,
  referrer_url TEXT,
  user_agent_category TEXT, -- 'desktop', 'mobile', 'tablet'
  country_code TEXT, -- 'DE', 'AT', 'CH', 'OTHER'
  landing_page TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate Conversions
CREATE TABLE public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  click_id UUID REFERENCES public.affiliate_clicks(id),
  converted_tenant_id UUID REFERENCES public.tenants(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'paid'
  commission_amount NUMERIC(10,2),
  admin_comment TEXT,
  is_manual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at_affiliate_programs
  BEFORE UPDATE ON public.affiliate_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_affiliate_links
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_affiliate_links_slug ON public.affiliate_links(slug);
CREATE INDEX idx_affiliate_links_tenant_id ON public.affiliate_links(tenant_id);
CREATE INDEX idx_affiliate_clicks_link_id ON public.affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_affiliate_clicks_created ON public.affiliate_clicks(created_at);
CREATE INDEX idx_affiliate_conversions_link_id ON public.affiliate_conversions(affiliate_link_id);

-- RLS: Affiliate Programs
CREATE POLICY "All authenticated read programs" ON public.affiliate_programs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admin manages programs" ON public.affiliate_programs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: Affiliate Links
CREATE POLICY "Tenant sees own affiliate link" ON public.affiliate_links
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()) OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Tenant admin manages own link" ON public.affiliate_links
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Anon can read active links (for tracking endpoint)
CREATE POLICY "Anon reads active links" ON public.affiliate_links
  FOR SELECT TO anon USING (is_active = true);

-- RLS: Affiliate Clicks
CREATE POLICY "Tenant sees own clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (
    affiliate_link_id IN (
      SELECT id FROM public.affiliate_links WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

-- Anon can insert clicks (tracking)
CREATE POLICY "Anon inserts clicks" ON public.affiliate_clicks
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated inserts clicks" ON public.affiliate_clicks
  FOR INSERT TO authenticated WITH CHECK (true);

-- Super admin sees all clicks
CREATE POLICY "Super admin sees all clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: Affiliate Conversions
CREATE POLICY "Tenant sees own conversions" ON public.affiliate_conversions
  FOR SELECT TO authenticated
  USING (
    affiliate_link_id IN (
      SELECT id FROM public.affiliate_links WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admin manages conversions" ON public.affiliate_conversions
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Seed default affiliate program
INSERT INTO public.affiliate_programs (name, commission_percent, cookie_lifetime_days, min_payout)
VALUES ('Standard', 10.00, 90, 50.00);


-- 13. CLIENT LIMIT ENFORCEMENT
-- =====================================================

-- Check if tenant can still create clients (counts ALL clients including deleted)
CREATE OR REPLACE FUNCTION public.check_client_limit(tenant_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.clients
  WHERE tenant_id = tenant_uuid;

  SELECT p.max_clients INTO max_allowed
  FROM public.tenants t
  JOIN public.plans p ON t.plan_id = p.id
  WHERE t.id = tenant_uuid;

  IF max_allowed IS NULL THEN
    RETURN true;
  END IF;

  RETURN current_count < max_allowed;
END;
$$;

-- Enforce client limit on INSERT (super_admin can override)
CREATE POLICY "Enforce client limit" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (
    public.check_client_limit(tenant_id)
    OR public.has_role(auth.uid(), 'super_admin')
  );


-- 14. NOTIFICATIONS
-- =====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created ON public.notifications(created_at);

CREATE POLICY "Users see own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);


-- 15. TRIAL PERIOD
-- =====================================================

ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT;


-- 16. DELETION REQUESTS (GDPR)
-- =====================================================

CREATE TABLE public.deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own deletion requests" ON public.deletion_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users create deletion requests" ON public.deletion_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin manages deletion requests" ON public.deletion_requests
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));


-- 17. PAYMENT HISTORY (Stripe Prep)
-- =====================================================

CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_payment_history_tenant_id ON public.payment_history(tenant_id);

CREATE POLICY "Tenant admin sees own payments" ON public.payment_history
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admin manages payments" ON public.payment_history
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));


-- 18. PLATFORM SETTINGS SEED DATA
-- =====================================================

INSERT INTO public.platform_settings (key, value) VALUES
  ('trial_enabled', '"true"'),
  ('trial_days', '"14"'),
  ('session_timeout_minutes', '"30"'),
  ('session_warning_minutes', '"5"'),
  ('affiliate_cookie_days', '"30"'),
  ('affiliate_default_commission', '"20"'),
  ('invite_expiry_days', '"7"')
ON CONFLICT (key) DO NOTHING;


-- 19. CHAPTER VERSIONS (Version History)
-- =====================================================

CREATE TABLE public.chapter_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_data_id UUID REFERENCES public.chapter_data(id) ON DELETE CASCADE,
  editor_text TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  change_reason TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_type TEXT NOT NULL DEFAULT 'edit'
);

ALTER TABLE public.chapter_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_chapter_versions_chapter ON public.chapter_versions(chapter_data_id);

CREATE POLICY "Users see versions for their chapters" ON public.chapter_versions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert versions" ON public.chapter_versions
  FOR INSERT TO authenticated WITH CHECK (true);


-- 20. CHAPTER COMMENTS
-- =====================================================

CREATE TABLE public.chapter_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_data_id UUID REFERENCES public.chapter_data(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_chapter_comments_chapter ON public.chapter_comments(chapter_data_id);

CREATE POLICY "Users see comments" ON public.chapter_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users insert comments" ON public.chapter_comments
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own comments" ON public.chapter_comments
  FOR UPDATE TO authenticated USING (user_id = auth.uid());


-- 21. PROMO CODES
-- =====================================================

CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 10,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin manages promo codes" ON public.promo_codes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated read active codes" ON public.promo_codes
  FOR SELECT TO authenticated USING (is_active = true);


-- 22. CHAPTER TEMPLATES
-- =====================================================

CREATE TABLE public.chapter_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  chapter_key TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chapter_templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_chapter_templates_tenant ON public.chapter_templates(tenant_id);

CREATE POLICY "Tenant sees own templates" ON public.chapter_templates
  FOR SELECT TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Tenant admin manages templates" ON public.chapter_templates
  FOR ALL TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'tenant_user')))
    OR public.has_role(auth.uid(), 'super_admin')
  );


-- 23. LOGIN LOGS
-- =====================================================

CREATE TABLE public.login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX idx_login_logs_created ON public.login_logs(created_at);

CREATE POLICY "Users see own login logs" ON public.login_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users insert own login logs" ON public.login_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Tenant API Keys
CREATE TABLE public.tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Standard',
  api_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tenant_api_keys_tenant ON public.tenant_api_keys(tenant_id);
CREATE UNIQUE INDEX idx_tenant_api_keys_key ON public.tenant_api_keys(api_key);

CREATE POLICY "Tenant admins manage own API keys" ON public.tenant_api_keys
  FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    tenant_id IN (SELECT p.tenant_id FROM public.profiles p WHERE p.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- =====================================================
-- Plans Restructure: Solo, Berater, Agentur
-- =====================================================

-- Add new columns to plans table
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS price_type TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS setup_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS setup_fee_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS renewal_price NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS duration_months INTEGER;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS trial_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS max_clients_unlimited BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS has_whitelabel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS has_advisor_portal BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS has_ai_features BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS has_pdf_export BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Upgrade rules table
CREATE TABLE IF NOT EXISTS public.plan_upgrade_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  to_plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  requires_setup_fee BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(from_plan_id, to_plan_id)
);

ALTER TABLE public.plan_upgrade_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage upgrade rules" ON public.plan_upgrade_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Delete existing plans and insert new ones
DELETE FROM public.plans;

INSERT INTO public.plans (name, max_clients, max_projects, price_monthly, price_type, setup_fee, setup_fee_enabled, renewal_price, duration_months, trial_days, max_clients_unlimited, has_whitelabel, has_advisor_portal, has_ai_features, has_pdf_export, is_active, sort_order)
VALUES 
  ('Solo', 1, 999, 980, 'one_time', 0, false, 199, 12, 0, false, false, false, true, true, true, 1),
  ('Berater', 5, 999, 399, 'monthly', 590, true, 0, NULL, 7, false, false, true, true, true, true, 2),
  ('Agentur', 999, 999, 799, 'monthly', 590, true, 0, NULL, 7, true, true, true, true, true, true, 3);

-- Upgrade rule: Berater -> Agentur (no setup fee)
INSERT INTO public.plan_upgrade_rules (from_plan_id, to_plan_id, requires_setup_fee)
SELECT b.id, a.id, false
FROM public.plans b, public.plans a
WHERE b.name = 'Berater' AND a.name = 'Agentur';
