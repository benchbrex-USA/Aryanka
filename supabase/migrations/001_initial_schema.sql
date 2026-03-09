-- ============================================================
-- Aryanka SaaS - Initial Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- LEADS TABLE
-- ============================================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  name text,
  company text,
  phone text,
  source text not null default 'website',
  type text not null default 'signup' check (type in ('signup', 'lead_magnet', 'newsletter', 'contact')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'unsubscribed')),
  score integer default 0 check (score >= 0 and score <= 100),
  notes text,
  tags text[] default '{}',
  metadata jsonb default '{}',
  ip_address text,
  user_agent text,
  assigned_to uuid,
  last_contacted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_email on leads(email);
create index idx_leads_status on leads(status);
create index idx_leads_source on leads(source);
create index idx_leads_created_at on leads(created_at desc);
create index idx_leads_score on leads(score desc);

-- ============================================================
-- DEMO BOOKINGS TABLE
-- ============================================================
create table if not exists demo_bookings (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  company text not null,
  role text,
  team_size text,
  use_case text,
  preferred_time text,
  phone text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  scheduled_at timestamptz,
  meeting_url text,
  notes text,
  lead_id uuid references leads(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_demo_bookings_email on demo_bookings(email);
create index idx_demo_bookings_status on demo_bookings(status);
create index idx_demo_bookings_created_at on demo_bookings(created_at desc);

-- ============================================================
-- BLOG POSTS TABLE (SEO Content Engine)
-- ============================================================
create table if not exists blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  author text default 'Aryanka Team',
  tags text[] default '{}',
  meta_title text,
  meta_description text,
  keywords text[],
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  views integer default 0,
  reading_time integer default 5, -- minutes
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);
create index idx_blog_posts_published_at on blog_posts(published_at desc);
create index idx_blog_posts_tags on blog_posts using gin(tags);

-- ============================================================
-- ANALYTICS EVENTS TABLE
-- ============================================================
create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  lead_id uuid references leads(id),
  page text,
  source text,
  referrer text,
  ip_address text,
  user_agent text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_analytics_event_type on analytics_events(event_type);
create index idx_analytics_created_at on analytics_events(created_at desc);
create index idx_analytics_lead_id on analytics_events(lead_id);

-- ============================================================
-- EMAIL SEQUENCES TABLE
-- ============================================================
create table if not exists email_sequences (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) not null,
  email text not null,
  sequence_name text not null default 'welcome',
  current_step integer default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'unsubscribed')),
  last_sent_at timestamptz,
  next_send_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_email_sequences_lead_id on email_sequences(lead_id);
create index idx_email_sequences_status on email_sequences(status);
create index idx_email_sequences_next_send_at on email_sequences(next_send_at);

-- ============================================================
-- CONTENT SYNDICATION TABLE
-- ============================================================
create table if not exists content_syndication (
  id uuid primary key default uuid_generate_v4(),
  blog_post_id uuid references blog_posts(id),
  platform text not null check (platform in ('linkedin', 'reddit', 'medium', 'twitter', 'youtube', 'instagram')),
  status text not null default 'pending' check (status in ('pending', 'published', 'failed', 'scheduled')),
  platform_post_id text,
  platform_url text,
  adapted_content text,
  scheduled_at timestamptz,
  published_at timestamptz,
  engagement jsonb default '{}', -- likes, shares, comments
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_syndication_blog_post_id on content_syndication(blog_post_id);
create index idx_syndication_platform on content_syndication(platform);
create index idx_syndication_status on content_syndication(status);

-- ============================================================
-- CRM ACTIVITIES TABLE
-- ============================================================
create table if not exists crm_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads(id) not null,
  type text not null check (type in ('email', 'call', 'demo', 'note', 'stage_change', 'proposal')),
  title text not null,
  description text,
  metadata jsonb default '{}',
  created_by text,
  created_at timestamptz default now()
);

create index idx_crm_activities_lead_id on crm_activities(lead_id);
create index idx_crm_activities_type on crm_activities(type);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_leads_updated_at before update on leads for each row execute function update_updated_at_column();
create trigger update_demo_bookings_updated_at before update on demo_bookings for each row execute function update_updated_at_column();
create trigger update_blog_posts_updated_at before update on blog_posts for each row execute function update_updated_at_column();
create trigger update_email_sequences_updated_at before update on email_sequences for each row execute function update_updated_at_column();
create trigger update_content_syndication_updated_at before update on content_syndication for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table leads enable row level security;
alter table demo_bookings enable row level security;
alter table blog_posts enable row level security;
alter table analytics_events enable row level security;
alter table email_sequences enable row level security;
alter table content_syndication enable row level security;
alter table crm_activities enable row level security;

-- Blog posts are publicly readable when published
create policy "Public can read published blog posts" on blog_posts
  for select using (status = 'published');

-- Analytics events can be inserted by anyone (for tracking)
create policy "Anyone can insert analytics events" on analytics_events
  for insert with check (true);

-- Service role can do everything (used by API routes)
-- (service role bypasses RLS by default in Supabase)

-- ============================================================
-- SEED: Sample blog posts for SEO
-- ============================================================
insert into blog_posts (title, slug, excerpt, status, tags, keywords, reading_time, published_at) values
(
  'How to Generate 500 B2B Leads Per Month Without Spending on Ads',
  'how-to-generate-b2b-leads-without-ads',
  'A step-by-step playbook for generating high-quality B2B leads through content marketing, SEO, and social syndication — zero ad budget required.',
  'published',
  array['lead-generation', 'b2b', 'organic-traffic', 'seo'],
  array['b2b lead generation', 'organic leads', 'lead generation without ads', 'b2b marketing'],
  8,
  now()
),
(
  'The Ultimate Guide to Organic Traffic for SaaS in 2024',
  'organic-traffic-strategies-for-saas',
  'How fast-growing SaaS companies are driving tens of thousands of monthly visitors without a single paid click.',
  'published',
  array['seo', 'saas', 'organic-traffic', 'content-marketing'],
  array['organic traffic saas', 'saas seo strategy', 'content marketing saas'],
  10,
  now()
),
(
  'Content Syndication: The Complete Playbook for Maximum Reach',
  'content-syndication-guide-2024',
  'Learn how to repurpose a single piece of content across 6 platforms and multiply your organic reach without extra work.',
  'published',
  array['content-syndication', 'linkedin', 'reddit', 'medium'],
  array['content syndication', 'content distribution', 'repurpose content'],
  7,
  now()
),
(
  'LinkedIn Lead Generation: The 2024 Playbook That Actually Works',
  'linkedin-lead-generation-playbook',
  'Forget cold outreach. Here is how to build an inbound LinkedIn funnel that delivers qualified leads to your inbox every week.',
  'published',
  array['linkedin', 'lead-generation', 'social-media', 'b2b'],
  array['linkedin lead generation', 'linkedin b2b marketing', 'linkedin organic growth'],
  9,
  now()
),
(
  'Email Nurture Sequences That Convert at 12%+ (With Templates)',
  'email-nurture-sequences-that-convert',
  '5 battle-tested email sequence templates that warm up cold leads and guide them to a buying decision — with real conversion data.',
  'published',
  array['email-marketing', 'lead-nurture', 'conversion', 'saas'],
  array['email nurture sequence', 'lead nurture email', 'email marketing saas'],
  6,
  now()
);
