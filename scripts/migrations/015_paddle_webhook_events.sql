-- Migration 015: Deduplicate Paddle webhooks
-- Stores every processed Paddle event_id so duplicate deliveries are a no-op.
CREATE TABLE IF NOT EXISTS paddle_webhook_events (
  event_id    TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
