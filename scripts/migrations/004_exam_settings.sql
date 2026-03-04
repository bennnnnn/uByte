-- Exam settings (admin-editable). Fallback to code defaults if not set.
-- Run after 003. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed defaults (only if missing)
INSERT INTO site_settings (key, value)
VALUES
  ('exam_size', '40'),
  ('exam_duration_minutes', '45')
ON CONFLICT (key) DO NOTHING;
