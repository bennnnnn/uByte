-- Platform hardening: indexes and tables previously created at runtime in API handlers.

CREATE TABLE IF NOT EXISTS discussion_reports (
  id          SERIAL PRIMARY KEY,
  post_id     INTEGER NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_discussion_reports_post_id ON discussion_reports(post_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
