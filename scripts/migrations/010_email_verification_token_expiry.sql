ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_expires_at TEXT;
