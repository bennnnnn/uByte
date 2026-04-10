-- Remove practice exam / certification feature (tutorials-only product).
-- Safe to run multiple times.

DROP TABLE IF EXISTS exam_certificates CASCADE;
DROP TABLE IF EXISTS exam_answers CASCADE;
DROP TABLE IF EXISTS exam_attempts CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exam_lang_settings CASCADE;

DELETE FROM site_settings WHERE key IN ('exam_size', 'exam_duration_minutes', 'exam_questions_per_attempt', 'exam_pass_percent');
DELETE FROM site_settings WHERE key LIKE 'exam_questions_per_attempt_%';
DELETE FROM site_settings WHERE key LIKE 'exam_duration_minutes_%';
DELETE FROM site_settings WHERE key LIKE 'exam_pass_percent_%';
