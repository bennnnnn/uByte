-- Indexes to speed up public per-language exam stats queries.
-- Safe to run multiple times.

-- Aggregate queries group by lang with submitted attempts only.
CREATE INDEX IF NOT EXISTS idx_exam_attempts_lang_submitted
  ON exam_attempts(lang, submitted_at)
  WHERE submitted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_attempts_lang_user_submitted
  ON exam_attempts(lang, user_id)
  WHERE submitted_at IS NOT NULL;

