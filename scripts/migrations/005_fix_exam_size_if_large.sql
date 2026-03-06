-- Fix exam_size when it was set to question-bank size by mistake (e.g. 160).
-- Leaves exam_size unchanged if it's already a sensible per-exam value (1–100).
-- Run after 004. Safe to run multiple times.

UPDATE site_settings
SET value = '40', updated_at = NOW()
WHERE key = 'exam_size'
  AND value ~ '^\d+$'
  AND CAST(value AS INTEGER) > 100;
