-- Migration 019: Promote practice_unlocks table from runtime DDL to a proper migration.
-- Previously this table was created at runtime on first request via ensurePracticeUnlocksTable().
-- This migration makes the schema predictable at deploy time.

CREATE TABLE IF NOT EXISTS practice_unlocks (
  id           SERIAL      PRIMARY KEY,
  user_id      INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_slug TEXT        NOT NULL,
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, problem_slug)
);

CREATE INDEX IF NOT EXISTS idx_practice_unlocks_user ON practice_unlocks(user_id, unlocked_at);
