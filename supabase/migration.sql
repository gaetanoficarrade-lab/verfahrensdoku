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

-- Chapter Data: follows project access
CREATE POLICY "Chapter data tenant access" ON public.chapter_data
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects
      WHERE tenant_id = public.get_user_tenant_id(auth.uid())
    ) OR public.has_role(auth.uid(), 'super_admin')
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
