-- Add per-language pass percentage to exam_lang_settings.
-- Each language exam can now have its own passing threshold.
-- Defaults to 70% (matching the previous global default).

ALTER TABLE exam_lang_settings
  ADD COLUMN IF NOT EXISTS pass_percent INT NOT NULL DEFAULT 70
  CHECK (pass_percent >= 1 AND pass_percent <= 100);
