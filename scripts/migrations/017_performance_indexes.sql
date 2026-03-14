-- Additional performance indexes for frequently-queried columns.
-- Safe to run multiple times (IF NOT EXISTS).

-- progress: composite index for getProgress / getProgressCount (filters by user_id AND language)
CREATE INDEX IF NOT EXISTS idx_progress_user_lang
  ON progress(user_id, language);

-- progress: index on language alone for getPopularLanguages GROUP BY language
CREATE INDEX IF NOT EXISTS idx_progress_language
  ON progress(language);

-- step_progress: partial index for getCompletedStepCountByLanguage which filters WHERE skipped = FALSE
CREATE INDEX IF NOT EXISTS idx_step_progress_user_skipped
  ON step_progress(user_id) WHERE skipped = FALSE;
