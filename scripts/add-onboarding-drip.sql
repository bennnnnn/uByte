-- Onboarding email drip log
-- Tracks which drip emails have been sent to each user so the cron job
-- never double-sends.  email_type values: 'day3', 'day7'
-- (the 'welcome' / day0 email is sent inline from the signup route,
--  no DB record needed since it fires exactly once per signup.)

CREATE TABLE IF NOT EXISTS onboarding_email_log (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_type TEXT    NOT NULL,  -- 'day3' | 'day7'
  sent_at    TEXT    DEFAULT (NOW()::text),
  UNIQUE(user_id, email_type)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_email_log_user_id ON onboarding_email_log(user_id);
