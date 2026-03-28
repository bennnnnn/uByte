-- Tutorial thumbs-up / thumbs-down ratings
CREATE TABLE IF NOT EXISTS tutorial_ratings (
  user_id       TEXT        NOT NULL,
  lang          TEXT        NOT NULL,
  tutorial_slug TEXT        NOT NULL,
  rating        SMALLINT    NOT NULL CHECK (rating IN (1, -1)),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lang, tutorial_slug)
);

CREATE INDEX IF NOT EXISTS tutorial_ratings_slug_idx
  ON tutorial_ratings (lang, tutorial_slug);
