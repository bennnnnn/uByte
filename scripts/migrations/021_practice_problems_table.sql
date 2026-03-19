-- Migration 021: Add practice_problems table.
-- Problems are stored as JSONB so complex nested structures (starter code per language,
-- test cases, judge harnesses) don't require normalisation. The slug remains the
-- stable external identifier used by all existing routes and foreign keys.

CREATE TABLE IF NOT EXISTS practice_problems (
  id          BIGSERIAL   PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  difficulty  TEXT        NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category    TEXT,
  description TEXT        NOT NULL,
  examples    JSONB       NOT NULL DEFAULT '[]',
  starter     JSONB       NOT NULL DEFAULT '{}',
  test_cases  JSONB       NOT NULL DEFAULT '[]',
  judge_harness JSONB     NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_problems_difficulty ON practice_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_practice_problems_category   ON practice_problems(category);
