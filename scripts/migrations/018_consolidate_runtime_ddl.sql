-- Migration 018: Consolidate runtime DDL and add missing indexes
-- These tables and columns were previously created at runtime on first request.
-- Moving them here ensures predictable schema state at deploy time.
-- All statements are idempotent (IF NOT EXISTS / IF EXISTS).

-- ── step_progress ─────────────────────────────────────────────────────────────
-- Individual lesson-step completion tracking. One row per (user, language, slug, step).
CREATE TABLE IF NOT EXISTS step_progress (
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutorial_slug TEXT NOT NULL,
  step_index    INTEGER NOT NULL,
  language      TEXT NOT NULL DEFAULT 'go',
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  skipped       BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, tutorial_slug, step_index, language)
);
ALTER TABLE step_progress ADD COLUMN IF NOT EXISTS skipped  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE step_progress ADD COLUMN IF NOT EXISTS language TEXT    NOT NULL DEFAULT 'go';

-- ── ai_feedback_cache ─────────────────────────────────────────────────────────
-- Simple text cache keyed by a hash. Different from ai_feedback_responses (structured JSONB).
CREATE TABLE IF NOT EXISTS ai_feedback_cache (
  cache_key   TEXT PRIMARY KEY,
  feedback    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_cache_created ON ai_feedback_cache(created_at);

-- ── ai_usage_daily + ai_cooldown ──────────────────────────────────────────────
-- Already in 002_ai_cost_controls.sql; kept here as a safety net.
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day        DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
CREATE TABLE IF NOT EXISTS ai_cooldown (
  user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_called_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── submissions ───────────────────────────────────────────────────────────────
-- Already in 002_ai_cost_controls.sql; extra columns added here as safety net.
CREATE TABLE IF NOT EXISTS submissions (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,
  problem_id         TEXT NOT NULL,
  language           TEXT NOT NULL,
  code               TEXT NOT NULL,
  code_hash          TEXT NOT NULL,
  verdict            TEXT NOT NULL,
  judge0_token       TEXT,
  compile_output     TEXT,
  runtime_output     TEXT,
  runtime_error      TEXT,
  time_ms            INTEGER,
  memory_kb          INTEGER,
  failed_test_index  INTEGER,
  failed_input       TEXT,
  failed_expected    TEXT,
  failed_actual      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem_created
  ON submissions(user_id, problem_id, created_at DESC);

-- ── users: extra columns ──────────────────────────────────────────────────────
-- Added at runtime in src/lib/db/users.ts; promoting to migration.
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_goal                  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at    TEXT;

-- ── users(google_id) index ────────────────────────────────────────────────────
-- getUserByGoogleId does a full table scan without this index.
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
