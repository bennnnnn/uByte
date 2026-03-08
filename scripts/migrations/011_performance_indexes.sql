-- Performance indexes for frequently-queried tables.
-- Safe to run multiple times (IF NOT EXISTS).

-- rate_limits: queries always filter by (key, hit_at)
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_hit
  ON rate_limits(key, hit_at);

-- progress: queried by user_id + lang for tutorial completion checks
CREATE INDEX IF NOT EXISTS idx_progress_user_lang
  ON progress(user_id, lang);

-- submissions: queried by user_id + problem_id for consecutive failures
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem
  ON submissions(user_id, problem_id, created_at DESC);

-- activity_log: queried by user_id for profile activity
CREATE INDEX IF NOT EXISTS idx_activity_log_user
  ON activity_log(user_id, created_at DESC);

-- notifications: queried by user_id ordered by created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);

-- chat_messages: queried by slug ordered by created_at
CREATE INDEX IF NOT EXISTS idx_chat_messages_slug
  ON chat_messages(slug, created_at DESC);

-- users: queried by stripe_customer_id (paddle customer ID) in webhooks
CREATE INDEX IF NOT EXISTS idx_users_paddle_customer
  ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- users: leaderboard sorts by xp DESC
CREATE INDEX IF NOT EXISTS idx_users_xp_desc
  ON users(xp DESC);

-- practice_attempts: leaderboard subquery counts solved per user
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_status
  ON practice_attempts(user_id, status);
