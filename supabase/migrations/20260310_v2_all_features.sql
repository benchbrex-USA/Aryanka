-- ============================================================
-- Aryanka v2.0 — All 30 Competitive Features Migration
-- ============================================================

-- ─── Feature 1: Scheduled Posts / Content Calendar ──────────
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT,
  content       TEXT NOT NULL,
  platforms     TEXT[] NOT NULL DEFAULT '{}',
  platform_variants JSONB DEFAULT '{}',   -- {linkedin: '...', twitter: '...'}
  image_url     TEXT,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | published | failed | cancelled
  blog_post_id  UUID,
  error_message TEXT,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON scheduled_posts(user_id);

-- ─── Feature 4: Email Drip Sequences ────────────────────────
CREATE TABLE IF NOT EXISTS drip_sequences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'form_submitted', -- form_submitted|lead_status_changed|score_threshold|manual
  trigger_config JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  step_count  INT DEFAULT 0,
  enrolled_count INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drip_sequence_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     UUID REFERENCES drip_sequences(id) ON DELETE CASCADE,
  step_number     INT NOT NULL,
  step_type       TEXT NOT NULL DEFAULT 'email', -- email|wait|condition|linkedin_connect|linkedin_message
  delay_hours     INT DEFAULT 0,
  subject         TEXT,
  body            TEXT,
  condition_field TEXT,
  condition_op    TEXT,
  condition_value TEXT,
  yes_next_step   INT,
  no_next_step    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_drip_steps_seq ON drip_sequence_steps(sequence_id, step_number);

CREATE TABLE IF NOT EXISTS drip_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id     UUID REFERENCES drip_sequences(id) ON DELETE CASCADE,
  lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
  lead_email      TEXT NOT NULL,
  current_step    INT DEFAULT 0,
  status          TEXT DEFAULT 'active', -- active|paused|completed|unsubscribed
  next_send_at    TIMESTAMPTZ,
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(sequence_id, lead_id)
);
CREATE INDEX IF NOT EXISTS idx_drip_enroll_status ON drip_enrollments(status, next_send_at);

-- ─── Feature 7: Automated Lead Scoring Rules ────────────────
CREATE TABLE IF NOT EXISTS scoring_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  trigger_event TEXT NOT NULL, -- email_opened|email_clicked|form_submitted|demo_booked|lead_status_changed|source_is|unsubscribed
  trigger_value TEXT,          -- for source_is, status_changed etc.
  points        INT NOT NULL,  -- positive or negative
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_score_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID REFERENCES leads(id) ON DELETE CASCADE,
  old_score  INT,
  new_score  INT,
  delta      INT,
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_score_history_lead ON lead_score_history(lead_id, created_at DESC);

-- ─── Feature 11: Content Approval Workflow ───────────────────
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft';
-- draft | pending_review | approved | rejected
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS submitted_by UUID;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── Feature 12: Subscriber Management ──────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  name         TEXT,
  status       TEXT DEFAULT 'active',   -- active|unsubscribed|bounced
  source       TEXT DEFAULT 'website',  -- form|blog|direct|import
  source_ref   TEXT,
  preferences  JSONB DEFAULT '{}',
  tags         TEXT[] DEFAULT '{}',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  UNIQUE(user_id, email)
);
CREATE INDEX IF NOT EXISTS idx_subscribers_user ON subscribers(user_id, status);

-- ─── Feature 13: Audience Segments ──────────────────────────
CREATE TABLE IF NOT EXISTS segments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  filters     JSONB NOT NULL DEFAULT '{}', -- [{field, op, value}]
  lead_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Feature 18: Lead Import Jobs ───────────────────────────
CREATE TABLE IF NOT EXISTS lead_import_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename        TEXT,
  status          TEXT DEFAULT 'pending', -- pending|processing|done|failed
  total_rows      INT DEFAULT 0,
  imported_count  INT DEFAULT 0,
  duplicate_count INT DEFAULT 0,
  error_count     INT DEFAULT 0,
  error_rows      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- ─── Feature 21: Brand Mentions ─────────────────────────────
CREATE TABLE IF NOT EXISTS brand_mentions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform   TEXT NOT NULL, -- reddit|twitter
  keyword    TEXT NOT NULL,
  title      TEXT,
  body       TEXT,
  url        TEXT,
  author     TEXT,
  sentiment  TEXT DEFAULT 'neutral', -- positive|neutral|negative
  replied    BOOLEAN DEFAULT false,
  found_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_user ON brand_mentions(user_id, found_at DESC);

CREATE TABLE IF NOT EXISTS listening_keywords (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword    TEXT NOT NULL,
  platforms  TEXT[] DEFAULT '{reddit,twitter}',
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

-- ─── Feature 26: Shareable Report Tokens ────────────────────
CREATE TABLE IF NOT EXISTS report_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token        TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  label        TEXT,
  password_hash TEXT,
  days_range   INT DEFAULT 30,
  is_active    BOOLEAN DEFAULT true,
  view_count   INT DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Enrich existing leads table with enrichment fields ─────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_industry TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_location TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS enrichment_source TEXT;

-- ─── Post content platform variants support ─────────────────
-- already handled via scheduled_posts.platform_variants JSONB
