import { getSql } from "./client";

const CACHE_TTL_MS = 60_000;
let _cache: Record<string, string> | null = null;
let _cacheAt = 0;

const DEFAULTS: Record<string, string> = {
  exam_pass_percent: "70",
};

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
