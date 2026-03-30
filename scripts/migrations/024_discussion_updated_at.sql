-- Add updated_at to discussion_posts so edits are tracked
ALTER TABLE discussion_posts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
