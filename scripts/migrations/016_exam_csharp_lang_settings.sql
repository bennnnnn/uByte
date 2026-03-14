-- Add C# (csharp) to exam_lang_settings with the same defaults as other languages.
-- Migration 006 seeded go/python/javascript/java/rust/cpp but missed csharp.
-- Safe to run multiple times (ON CONFLICT DO NOTHING).

INSERT INTO exam_lang_settings (lang, exam_size, exam_duration_minutes)
VALUES ('csharp', 40, 45)
ON CONFLICT (lang) DO NOTHING;

-- Also ensure pass_percent column (added in 009) is populated for csharp.
-- 009 adds the column with a default, so this is already handled, but be explicit.
UPDATE exam_lang_settings
SET pass_percent = 70
WHERE lang = 'csharp' AND pass_percent IS NULL;
