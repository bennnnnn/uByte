-- Performance indexes for frequently-queried tables.
-- Safe to run multiple times (IF NOT EXISTS).

-- rate_limits: queries always filter by (key, hit_at)
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_hit
  ON rate_limits(key, hit_at);

-- progress: queried by user_id for tutorial completion checks
CREATE INDEX IF NOT EXISTS idx_progress_user_id
  ON progress(user_id);

-- submissions: queried by user_id + problem_id for consecutive failures
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem
  ON submissions(user_id, problem_id, created_at DESC);

-- activity_log: queried by user_id for profile activity
CREATE INDEX IF NOT EXISTS idx_activity_log_user
  ON activity_log(user_id, created_at DESC);

-- notifications: queried by user_id ordered by created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);

-- tutorial_messages: queried by tutorial_slug ordered by created_at
CREATE INDEX IF NOT EXISTS idx_tutorial_messages_slug_created
  ON tutorial_messages(tutorial_slug, created_at DESC);

-- users: leaderboard sorts by xp DESC
CREATE INDEX IF NOT EXISTS idx_users_xp_desc
  ON users(xp DESC);

-- practice_attempts: leaderboard subquery counts solved per user
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_status
  ON practice_attempts(user_id, status);
