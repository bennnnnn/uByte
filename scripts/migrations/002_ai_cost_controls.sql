-- AI cost controls: submissions, AI feedback cache, usage quota, cooldown
-- Run after 001 / main migrate.sql. Safe to run multiple times (IF NOT EXISTS).

-- Submissions (store each Judge0 submission for AI feedback and cache keying)
CREATE TABLE IF NOT EXISTS submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  problem_id TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  verdict TEXT NOT NULL,
  judge0_token TEXT,
  compile_output TEXT,
  runtime_output TEXT,
  runtime_error TEXT,
  time_ms INT,
  memory_kb INT,
  failed_test_index INT,
  failed_input TEXT,
  failed_expected TEXT,
  failed_actual TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON submissions(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);

-- AI feedback cache (keyed by problem, language, code hash, verdict, failure signature, hint level)
CREATE TABLE IF NOT EXISTS ai_feedback_responses (
  id BIGSERIAL PRIMARY KEY,
  problem_id TEXT NOT NULL,
  language TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  verdict TEXT NOT NULL,
  failure_signature TEXT NOT NULL,
  hint_level INT NOT NULL,
  model_name TEXT NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (problem_id, language, code_hash, verdict, failure_signature, hint_level, model_name)
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_responses_lookup ON ai_feedback_responses(problem_id, language, code_hash, verdict, failure_signature, hint_level, model_name);

-- Daily AI usage quota per user
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- Cooldown: last AI call per user (for 10s throttle)
CREATE TABLE IF NOT EXISTS ai_cooldown (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  last_called_at TIMESTAMPTZ NOT NULL
);
