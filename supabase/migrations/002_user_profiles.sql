-- ============================================================
-- Aryanka SaaS - User Profiles & Settings
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- User profiles (linked to Supabase Auth)
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  bio text,
  avatar_url text,
  company text,
  role text,
  notification_new_lead boolean default true,
  notification_demo_booked boolean default true,
  notification_weekly_report boolean default true,
  notification_high_score_lead boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

-- Users can only read/update their own profile
create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on user_profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();
