-- ============================================================
-- Migration 006: Full System Integration
-- Adds: notifications, visitor_sessions, referrals, nps_responses
-- ============================================================

-- In-app notifications
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  type        text not null, -- 'new_lead','email_opened','email_clicked','demo_booked','blog_published','sequence_complete','platform_connected','team_joined'
  title       text not null,
  body        text,
  link        text,
  metadata    jsonb default '{}',
  read        boolean default false,
  created_at  timestamptz default now()
);
create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_unread_idx  on notifications(user_id, read) where read = false;
alter table notifications enable row level security;
create policy "Users see their own notifications" on notifications
  for all using (auth.uid() = user_id);

-- Anonymous visitor tracking (no PII)
create table if not exists visitor_sessions (
  id           uuid primary key default gen_random_uuid(),
  session_id   text,
  page         text,
  page_title   text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  utm_term     text,
  referrer     text,
  device_type  text, -- 'desktop','mobile','tablet'
  country      text,
  created_at   timestamptz default now()
);
create index if not exists visitor_sessions_created_at_idx on visitor_sessions(created_at);
create index if not exists visitor_sessions_session_idx   on visitor_sessions(session_id);

-- Referral program
create table if not exists referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_user_id uuid references auth.users,
  ref_code         text unique not null,
  referee_email    text,
  referee_user_id  uuid references auth.users,
  status           text default 'pending', -- 'pending','signed_up','converted'
  converted_at     timestamptz,
  created_at       timestamptz default now()
);
create index if not exists referrals_referrer_idx on referrals(referrer_user_id);
create index if not exists referrals_ref_code_idx on referrals(ref_code);
alter table referrals enable row level security;
create policy "Users see their own referrals" on referrals
  for select using (auth.uid() = referrer_user_id);

-- NPS survey responses (one per user)
create table if not exists nps_responses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null unique,
  score      integer not null check (score >= 0 and score <= 10),
  comment    text,
  created_at timestamptz default now()
);
alter table nps_responses enable row level security;
create policy "Users manage their own NPS" on nps_responses
  for all using (auth.uid() = user_id);

-- Add lead_id foreign key to email_sequences if not present
do $$ begin
  alter table email_sequences add column if not exists lead_id uuid references leads(id);
exception when others then null;
end $$;

-- Add score tracking to leads if needed
alter table leads add column if not exists email_opens   integer default 0;
alter table leads add column if not exists email_clicks  integer default 0;

-- Add resend_message_id to email_events for webhook correlation
alter table email_events add column if not exists resend_message_id text;
create index if not exists email_events_resend_msg_idx on email_events(resend_message_id) where resend_message_id is not null;

-- Add opened_count + clicked_count to email_campaigns if missing
alter table email_campaigns add column if not exists opened_count  integer default 0;
alter table email_campaigns add column if not exists clicked_count integer default 0;
