-- ============================================================
-- Aryanka SaaS — Production Complete Migration
-- Run AFTER 004_advanced_features.sql
-- ============================================================

-- ============================================================
-- STRIPE BILLING — subscription management
-- ============================================================
alter table user_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text default 'free'
    check (subscription_status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  add column if not exists subscription_plan text default 'starter'
    check (subscription_plan in ('starter', 'pro', 'enterprise')),
  add column if not exists subscription_period_end timestamptz,
  add column if not exists trial_end timestamptz;

-- ============================================================
-- EMAIL CAMPAIGNS — real campaign management
-- ============================================================
create table if not exists email_campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  from_name text,
  from_email text,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'paused', 'active')),
  audience text default 'all_leads'
    check (audience in ('all_leads', 'qualified_leads', 'new_leads', 'custom')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer default 0,
  sent_count integer default 0,
  opened_count integer default 0,
  clicked_count integer default 0,
  bounced_count integer default 0,
  unsubscribed_count integer default 0,
  tags text[],
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email campaign events (open/click tracking)
create table if not exists email_events (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references email_campaigns(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  event_type text not null check (event_type in ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  email text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- LEAD UNSUBSCRIBES — track who opted out
-- ============================================================
create table if not exists email_unsubscribes (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

-- ============================================================
-- SEQUENCE ENROLLMENTS — automated nurture tracking
-- ============================================================
-- (email_sequences already exists from migration 001, extend it)
alter table email_sequences
  add column if not exists sequence_name text,
  add column if not exists lead_email text,
  add column if not exists metadata jsonb default '{}';

-- ============================================================
-- PLATFORM POSTS — add content column if missing
-- ============================================================
alter table platform_posts
  add column if not exists title text,
  add column if not exists content text,
  add column if not exists error_message text;

-- ============================================================
-- LEADS — add unsubscribed column
-- ============================================================
alter table leads
  add column if not exists email_unsubscribed boolean default false,
  add column if not exists email_bounced boolean default false;

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists email_campaigns_user_id_idx on email_campaigns(user_id);
create index if not exists email_campaigns_status_idx on email_campaigns(status);
create index if not exists email_events_campaign_id_idx on email_events(campaign_id);
create index if not exists email_events_event_type_idx on email_events(event_type);
create index if not exists email_unsubscribes_email_idx on email_unsubscribes(email);
create index if not exists user_profiles_stripe_customer_id_idx on user_profiles(stripe_customer_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
create trigger update_email_campaigns_updated_at
  before update on email_campaigns
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table email_campaigns enable row level security;
alter table email_events enable row level security;
alter table email_unsubscribes enable row level security;

-- email_campaigns
create policy "Users manage own campaigns" on email_campaigns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Service role manages campaigns" on email_campaigns
  for all using (true) with check (true);

-- email_events
create policy "Users view own campaign events" on email_events
  for select using (
    exists (select 1 from email_campaigns c where c.id = campaign_id and c.user_id = auth.uid())
  );
create policy "Service role manages email events" on email_events
  for all using (true) with check (true);

-- email_unsubscribes
create policy "Users view own unsubscribes" on email_unsubscribes
  for select using (auth.uid() = user_id);
create policy "Anyone can unsubscribe" on email_unsubscribes
  for insert with check (true);
create policy "Service role manages unsubscribes" on email_unsubscribes
  for all using (true) with check (true);
