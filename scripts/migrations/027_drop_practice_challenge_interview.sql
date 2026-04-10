-- Remove practice problems, daily challenge, and interview hub (tutorials-only product).

DROP TABLE IF EXISTS interview_votes CASCADE;
DROP TABLE IF EXISTS interview_experiences CASCADE;

-- discussion_posts + discussion_reports kept for per-tutorial Q&A

DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS practice_code_drafts CASCADE;
DROP TABLE IF EXISTS practice_notes CASCADE;
DROP TABLE IF EXISTS practice_attempts CASCADE;
DROP TABLE IF EXISTS practice_problems CASCADE;
DROP TABLE IF EXISTS practice_unlocks CASCADE;
DROP TABLE IF EXISTS practice_views CASCADE;

DROP TABLE IF EXISTS challenge_runs CASCADE;

-- Resume pointer: only tutorials from now on
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_last_activity'
  ) THEN
    DELETE FROM user_last_activity WHERE activity_type = 'practice';
    ALTER TABLE user_last_activity DROP CONSTRAINT IF EXISTS user_last_activity_activity_type_check;
    ALTER TABLE user_last_activity ADD CONSTRAINT user_last_activity_activity_type_check
      CHECK (activity_type = 'tutorial');
  END IF;
END $$;
