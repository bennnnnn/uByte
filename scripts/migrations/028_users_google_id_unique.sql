-- One Google OAuth subject (sub) must not map to multiple uByte users.
-- NULL google_id remains allowed for password-only accounts.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_unique ON users (google_id) WHERE google_id IS NOT NULL;
