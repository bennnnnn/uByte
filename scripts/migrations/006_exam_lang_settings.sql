-- Per-language exam settings: questions per exam and duration (admin-editable).
-- Replaces global exam_size / exam_duration_minutes in site_settings.
-- Run after 004. Safe to run multiple times.

CREATE TABLE IF NOT EXISTS exam_lang_settings (
  lang TEXT PRIMARY KEY,
  exam_size INT NOT NULL DEFAULT 40 CHECK (exam_size >= 1 AND exam_size <= 200),
  exam_duration_minutes INT NOT NULL DEFAULT 45 CHECK (exam_duration_minutes >= 5 AND exam_duration_minutes <= 180),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed defaults for all exam languages (only if row missing)
INSERT INTO exam_lang_settings (lang, exam_size, exam_duration_minutes)
VALUES
  ('go', 40, 45),
  ('python', 40, 45),
  ('javascript', 40, 45),
  ('java', 40, 45),
  ('rust', 40, 45),
  ('cpp', 40, 45)
ON CONFLICT (lang) DO NOTHING;
