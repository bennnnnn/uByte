-- Key-value store for admin-configurable site settings (pricing, feature flags, etc.)
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed defaults (only if not already set)
INSERT INTO site_settings (key, value) VALUES
  ('monthly_price_cents', '999'),
  ('yearly_price_cents', '4999')
ON CONFLICT (key) DO NOTHING;
