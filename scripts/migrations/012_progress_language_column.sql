-- Migration 012: Add language column to progress table
--
-- The progress table originally had UNIQUE(user_id, tutorial_slug) with no language.
-- All early rows have language = NULL (treated as 'go' in app code).
-- This migration:
--   1. Adds the language column (TEXT, default 'go')
--   2. Backfills existing NULL rows to 'go'
--   3. Drops the old two-column unique constraint
--   4. Adds the correct three-column unique constraint
--
-- Safe to run multiple times (all statements use IF NOT EXISTS / IF EXISTS / DO NOTHING).

-- Step 1: Add column if not already there
ALTER TABLE progress ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'go';

-- Step 2: Backfill any rows where language is empty string (shouldn't happen, but just in case)
UPDATE progress SET language = 'go' WHERE language = '' OR language IS NULL;

-- Step 3: Add the new three-column unique constraint (only if it doesn't exist yet)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'progress_user_id_language_tutorial_slug_key'
  ) THEN
    ALTER TABLE progress ADD CONSTRAINT progress_user_id_language_tutorial_slug_key
      UNIQUE (user_id, language, tutorial_slug);
  END IF;
END $$;

-- Step 4: Drop the old two-column unique constraint (only if it still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'progress_user_id_tutorial_slug_key'
  ) THEN
    ALTER TABLE progress DROP CONSTRAINT progress_user_id_tutorial_slug_key;
  END IF;
END $$;
