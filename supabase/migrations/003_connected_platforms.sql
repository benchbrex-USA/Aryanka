-- ============================================================
-- Aryanka SaaS - Connected Platforms & Social OAuth
-- Run this in Supabase SQL Editor after 002_user_profiles.sql
-- ============================================================

-- ============================================================
-- CONNECTED PLATFORMS TABLE
-- Stores OAuth tokens for each user's connected social accounts
-- ============================================================
create table if not exists connected_platforms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('linkedin', 'twitter', 'reddit', 'youtube', 'instagram')),
  platform_user_id text,
  platform_username text,
  platform_display_name text,
  platform_avatar_url text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  raw_profile jsonb default '{}',
  is_active boolean default true,
  connected_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, platform)
);

-- ============================================================
-- PLATFORM POSTS TABLE
-- Tracks every post syndicated to each platform
-- ============================================================
create table if not exists platform_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blog_post_id uuid references blog_posts(id) on delete set null,
  platform text not null check (platform in ('linkedin', 'twitter', 'reddit', 'youtube', 'instagram')),
  platform_post_id text,
  platform_post_url text,
  title text,
  content text,
  status text not null default 'pending' check (status in ('pending', 'posted', 'failed', 'deleted')),
  error_message text,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  impressions integer default 0,
  posted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists connected_platforms_user_id_idx on connected_platforms(user_id);
create index if not exists connected_platforms_platform_idx on connected_platforms(platform);
create index if not exists platform_posts_user_id_idx on platform_posts(user_id);
create index if not exists platform_posts_blog_post_id_idx on platform_posts(blog_post_id);
create index if not exists platform_posts_platform_idx on platform_posts(platform);
create index if not exists platform_posts_status_idx on platform_posts(status);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create trigger update_connected_platforms_updated_at
  before update on connected_platforms
  for each row execute function update_updated_at_column();

create trigger update_platform_posts_updated_at
  before update on platform_posts
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table connected_platforms enable row level security;
alter table platform_posts enable row level security;

-- connected_platforms: users can only see/manage their own connections
create policy "Users can view own connected platforms"
  on connected_platforms for select
  using (auth.uid() = user_id);

create policy "Users can insert own connected platforms"
  on connected_platforms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own connected platforms"
  on connected_platforms for update
  using (auth.uid() = user_id);

create policy "Users can delete own connected platforms"
  on connected_platforms for delete
  using (auth.uid() = user_id);

-- platform_posts: users can only see/manage their own posts
create policy "Users can view own platform posts"
  on platform_posts for select
  using (auth.uid() = user_id);

create policy "Users can insert own platform posts"
  on platform_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own platform posts"
  on platform_posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own platform posts"
  on platform_posts for delete
  using (auth.uid() = user_id);

-- Service role bypass (for API routes using admin client)
create policy "Service role can manage connected platforms"
  on connected_platforms for all
  using (true)
  with check (true);

create policy "Service role can manage platform posts"
  on platform_posts for all
  using (true)
  with check (true);
