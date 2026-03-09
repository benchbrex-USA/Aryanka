-- ============================================================
-- Aryanka SaaS - Advanced Features
-- Run in Supabase SQL Editor after 003_connected_platforms.sql
-- ============================================================

-- ============================================================
-- UTM TRACKING — add columns to leads
-- ============================================================
alter table leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists referrer_url text,
  add column if not exists page_url text;

-- ============================================================
-- WORKSPACES (multiple websites/domains per user, up to 5)
-- ============================================================
create table if not exists workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  domain text,
  slug text,
  logo_url text,
  is_default boolean default false,
  plan text default 'starter' check (plan in ('starter', 'growth', 'enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(owner_id, slug)
);

-- ============================================================
-- WORKSPACE MEMBERS (team collaboration, invites, roles)
-- ============================================================
create table if not exists workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  invited_email text,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  invite_token text unique default uuid_generate_v4()::text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  unique(workspace_id, invited_email)
);

-- ============================================================
-- A/B TESTS (CTA variants)
-- ============================================================
create table if not exists ab_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  page text not null default '/',
  element text not null default 'cta_button',
  variant_a jsonb not null default '{"text": "Get Started Free", "color": "brand"}',
  variant_b jsonb not null default '{"text": "Book a Demo", "color": "accent"}',
  impressions_a integer default 0,
  impressions_b integer default 0,
  conversions_a integer default 0,
  conversions_b integer default 0,
  winner text check (winner in ('a', 'b')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- CUSTOM FORMS (form builder)
-- ============================================================
create table if not exists custom_forms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  fields jsonb not null default '[{"id":"email","type":"email","label":"Email","required":true}]',
  settings jsonb default '{"redirect_url": "", "success_message": "Thanks! We will be in touch."}',
  lead_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WEBHOOKS (Slack, CRM, custom outbound)
-- ============================================================
create table if not exists webhooks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  events text[] not null default '{new_lead}',
  secret text default uuid_generate_v4()::text,
  is_active boolean default true,
  last_triggered_at timestamptz,
  delivery_count integer default 0,
  last_status integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- INVOICES (billing)
-- ============================================================
create table if not exists invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text unique,
  amount numeric(10,2) not null,
  currency text default 'INR',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  line_items jsonb default '[]',
  customer_name text,
  customer_email text,
  customer_address text,
  billing_period_start date,
  billing_period_end date,
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- WHITE LABEL SETTINGS
-- ============================================================
create table if not exists white_label_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_name text,
  logo_url text,
  favicon_url text,
  primary_color text default '#3B82F6',
  accent_color text default '#10B981',
  custom_domain text,
  hide_powered_by boolean default false,
  custom_footer_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- EXTEND user_profiles with new fields
-- ============================================================
alter table user_profiles
  add column if not exists slack_webhook_url text,
  add column if not exists custom_email_domain text,
  add column if not exists account_manager_name text,
  add column if not exists account_manager_email text,
  add column if not exists sso_enabled boolean default false,
  add column if not exists sso_provider text;

-- ============================================================
-- EXTEND connected_platforms to support Medium
-- ============================================================
alter table connected_platforms
  drop constraint if exists connected_platforms_platform_check;

alter table connected_platforms
  add constraint connected_platforms_platform_check
  check (platform in ('linkedin', 'twitter', 'reddit', 'youtube', 'instagram', 'medium'));

alter table platform_posts
  drop constraint if exists platform_posts_platform_check;

alter table platform_posts
  add constraint platform_posts_platform_check
  check (platform in ('linkedin', 'twitter', 'reddit', 'youtube', 'instagram', 'medium'));

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists workspaces_owner_id_idx on workspaces(owner_id);
create index if not exists workspace_members_workspace_id_idx on workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on workspace_members(user_id);
create index if not exists workspace_members_invite_token_idx on workspace_members(invite_token);
create index if not exists ab_tests_user_id_idx on ab_tests(user_id);
create index if not exists custom_forms_user_id_idx on custom_forms(user_id);
create index if not exists webhooks_user_id_idx on webhooks(user_id);
create index if not exists invoices_user_id_idx on invoices(user_id);
create index if not exists invoices_status_idx on invoices(status);
create index if not exists leads_utm_source_idx on leads(utm_source);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create trigger update_workspaces_updated_at
  before update on workspaces
  for each row execute function update_updated_at_column();

create trigger update_ab_tests_updated_at
  before update on ab_tests
  for each row execute function update_updated_at_column();

create trigger update_custom_forms_updated_at
  before update on custom_forms
  for each row execute function update_updated_at_column();

create trigger update_webhooks_updated_at
  before update on webhooks
  for each row execute function update_updated_at_column();

create trigger update_invoices_updated_at
  before update on invoices
  for each row execute function update_updated_at_column();

create trigger update_white_label_settings_updated_at
  before update on white_label_settings
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table ab_tests enable row level security;
alter table custom_forms enable row level security;
alter table webhooks enable row level security;
alter table invoices enable row level security;
alter table white_label_settings enable row level security;

-- workspaces
create policy "Users manage own workspaces" on workspaces for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
-- workspace_members
create policy "Workspace owner manages members" on workspace_members for all using (
  exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
) with check (
  exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
);
create policy "Members can view their own invites" on workspace_members for select using (user_id = auth.uid() or invited_email = (select email from auth.users where id = auth.uid()));
-- ab_tests
create policy "Users manage own ab_tests" on ab_tests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- custom_forms
create policy "Users manage own forms" on custom_forms for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- webhooks
create policy "Users manage own webhooks" on webhooks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- invoices
create policy "Users manage own invoices" on invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- white_label_settings
create policy "Users manage own white label" on white_label_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Service role full access
create policy "Service role manages workspaces" on workspaces for all using (true) with check (true);
create policy "Service role manages members" on workspace_members for all using (true) with check (true);
create policy "Service role manages ab_tests" on ab_tests for all using (true) with check (true);
create policy "Service role manages forms" on custom_forms for all using (true) with check (true);
create policy "Service role manages webhooks" on webhooks for all using (true) with check (true);
create policy "Service role manages invoices" on invoices for all using (true) with check (true);
create policy "Service role manages white_label" on white_label_settings for all using (true) with check (true);
