-- Neon PostgreSQL schema for golang-tutorials
-- Run this once in the Neon SQL console to set up all tables.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  google_id TEXT,
  avatar TEXT DEFAULT 'gopher',
  bio TEXT DEFAULT '',
  theme TEXT DEFAULT 'system',
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  streak_last_date TEXT,
  last_active_at TEXT,
  created_at TEXT DEFAULT (NOW()::text),
  is_admin INTEGER DEFAULT 0,
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT,
  email_verification_expires_at TEXT,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TEXT,
  token_version INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free',
  paddle_customer_id TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutorial_slug TEXT NOT NULL,
  completed_at TEXT DEFAULT (NOW()::text),
  UNIQUE(user_id, tutorial_slug)
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  viewed_at TEXT DEFAULT (NOW()::text),
  UNIQUE(visitor_id, page_slug)
);

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  unlocked_at TEXT DEFAULT (NOW()::text),
  UNIQUE(user_id, badge_key)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutorial_slug TEXT NOT NULL,
  snippet TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (NOW()::text)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  detail TEXT DEFAULT '',
  created_at TEXT DEFAULT (NOW()::text)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (NOW()::text)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'inactive',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (NOW()::text),
  updated_at TEXT DEFAULT (NOW()::text)
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutorial_slug TEXT NOT NULL,
  value INTEGER NOT NULL CHECK(value IN (1, -1)),
  created_at TEXT DEFAULT (NOW()::text),
  UNIQUE(user_id, tutorial_slug)
);

CREATE TABLE IF NOT EXISTS playground_snippets (
  id SERIAL PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  created_at TEXT DEFAULT (NOW()::text)
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  hit_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_hit ON rate_limits(key, hit_at);

-- Popular content for home sidebar (practice problem views)
CREATE TABLE IF NOT EXISTS practice_views (
  id SERIAL PRIMARY KEY,
  viewer_id TEXT NOT NULL,
  problem_slug TEXT NOT NULL,
  viewed_at TEXT DEFAULT (NOW()::text),
  UNIQUE(viewer_id, problem_slug)
);
CREATE INDEX IF NOT EXISTS idx_practice_views_slug ON practice_views(problem_slug);

-- Exam settings (admin-editable). Fallback to code defaults if not set.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO site_settings (key, value)
VALUES
  ('exam_size', '40'),
  ('exam_duration_minutes', '45')
ON CONFLICT (key) DO NOTHING;

-- Per-language exam settings (admin-editable). Replaces global exam_size/duration for practice exams.
CREATE TABLE IF NOT EXISTS exam_lang_settings (
  lang TEXT PRIMARY KEY,
  exam_size INT NOT NULL DEFAULT 40 CHECK (exam_size >= 1 AND exam_size <= 200),
  exam_duration_minutes INT NOT NULL DEFAULT 45 CHECK (exam_duration_minutes >= 5 AND exam_duration_minutes <= 180),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO exam_lang_settings (lang, exam_size, exam_duration_minutes)
VALUES
  ('go', 40, 45),
  ('python', 40, 45),
  ('javascript', 40, 45),
  ('java', 40, 45),
  ('rust', 40, 45),
  ('cpp', 40, 45),
  ('csharp', 40, 45)
ON CONFLICT (lang) DO NOTHING;

-- Contact messages from the /contact form (stored for admin review)
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TEXT DEFAULT (NOW()::text)
);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- User-submitted interview experiences
CREATE TABLE IF NOT EXISTS interview_experiences (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  outcome     TEXT NOT NULL CHECK (outcome IN ('offer', 'rejection', 'ongoing', 'ghosted')),
  rounds      TEXT NOT NULL,
  tips        TEXT,
  anonymous   BOOLEAN NOT NULL DEFAULT true,
  approved    BOOLEAN NOT NULL DEFAULT false,
  created_at  TEXT DEFAULT (NOW()::text)
);
CREATE INDEX IF NOT EXISTS idx_interview_exp_approved ON interview_experiences(approved, created_at DESC);

-- Votes on interview experiences (helpful / not helpful)
CREATE TABLE IF NOT EXISTS interview_votes (
  id            SERIAL PRIMARY KEY,
  experience_id INTEGER NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  visitor_id    TEXT,
  vote          SMALLINT NOT NULL CHECK (vote IN (1, -1)),
  created_at    TEXT DEFAULT (NOW()::text),
  CONSTRAINT interview_votes_user_uniq    UNIQUE (experience_id, user_id),
  CONSTRAINT interview_votes_visitor_uniq UNIQUE (experience_id, visitor_id)
);

-- Discussion threads per practice problem
CREATE TABLE IF NOT EXISTS discussion_posts (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  parent_id  INTEGER REFERENCES discussion_posts(id) ON DELETE CASCADE,
  body       TEXT NOT NULL CHECK (char_length(body) <= 2000),
  deleted    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_discussion_slug   ON discussion_posts(slug, created_at ASC)  WHERE deleted = false;
CREATE INDEX IF NOT EXISTS idx_discussion_parent ON discussion_posts(parent_id, created_at ASC) WHERE deleted = false;
