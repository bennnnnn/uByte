import { getSql } from "./client";

const CACHE_TTL_MS = 60_000;
let _cache: Record<string, string> | null = null;
let _cacheAt = 0;

export const SITE_SETTING_DEFAULTS: Record<string, string> = {
  // Numeric
  exam_pass_percent:   "70",
  max_ai_calls_per_day: "200",
  // Feature flags (1 = enabled, 0 = disabled)
  registration_open:            "1",
  maintenance_mode:             "0",
  ai_enabled:                   "1",
  referral_enabled:             "1",
  certifications_enabled:       "1",
  interview_simulator_enabled:  "1",
  pro_features_enabled:         "1",
};

// Keep backward-compat alias
const DEFAULTS = SITE_SETTING_DEFAULTS;

async function loadAll(): Promise<Record<string, string>> {
  const now = Date.now();
  if (_cache && now - _cacheAt < CACHE_TTL_MS) return _cache;

  const sql = getSql();
  const rows = await sql`SELECT key, value FROM site_settings`;
  const map: Record<string, string> = { ...DEFAULTS };
  for (const r of rows as { key: string; value: string }[]) {
    map[r.key] = r.value;
  }
  _cache = map;
  _cacheAt = now;
  return map;
}

/** Invalidate the in-memory cache (call after admin updates). */
export function invalidateSiteSettingsCache(): void {
  _cache = null;
  _cacheAt = 0;
}

/** Get a single site setting by key. */
export async function getSiteSetting(key: string): Promise<string> {
  const all = await loadAll();
  return all[key] ?? DEFAULTS[key] ?? "";
}

/** Get all site settings as a map. */
export async function getAllSiteSettings(): Promise<Record<string, string>> {
  return loadAll();
}

/** Set one or more site settings in a single batched upsert. */
export async function setSiteSettings(
  updates: Record<string, string>
): Promise<void> {
  const entries = Object.entries(updates);
  if (entries.length === 0) return;

  const sql = getSql();
  const keys   = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v);
  await sql`
    INSERT INTO site_settings (key, value, updated_at)
    SELECT unnest(${keys}::text[]), unnest(${values}::text[]), NOW()
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
  invalidateSiteSettingsCache();
}

// ─── Typed helpers ──────────────────────────────────────────────────────────

export async function getExamPassPercent(): Promise<number> {
  const v = await getSiteSetting("exam_pass_percent");
  const n = parseInt(v, 10);
  return isNaN(n) || n < 1 || n > 100 ? 70 : n;
}

export async function getMaxAiCallsPerDay(): Promise<number> {
  const v = await getSiteSetting("max_ai_calls_per_day");
  const n = parseInt(v, 10);
  return isNaN(n) || n < 1 ? 200 : n;
}

/** Returns true if the feature flag is enabled (value = "1"). */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  const v = await getSiteSetting(key);
  return v === "1";
}

/**
 * Check maintenance mode by querying the DB directly (no in-memory cache).
 * This ensures the flag takes effect immediately across all serverless instances
 * rather than waiting up to 60 s for the per-instance cache to expire.
 */
export async function getMaintenanceModeStatus(): Promise<boolean> {
  try {
    const sql = getSql();
    const [row] = await sql`SELECT value FROM site_settings WHERE key = 'maintenance_mode'`;
    return (row as { value: string } | undefined)?.value === "1";
  } catch {
    // DB unavailable — fall back to cached value so we don't break the site
    return _cache?.["maintenance_mode"] === "1";
  }
}
