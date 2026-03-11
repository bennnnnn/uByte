-- 014: Add email_marketing preference column to users table.
-- 1 = subscribed (default), 0 = unsubscribed.
-- Transactional emails (verify, password reset, security) ignore this flag.
-- Marketing emails (drip, streak reminder, weekly digest) respect it.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_marketing SMALLINT NOT NULL DEFAULT 1;
