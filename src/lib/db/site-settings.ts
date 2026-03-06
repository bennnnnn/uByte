import { getSql } from "./client";

// In-memory cache with TTL to avoid hitting DB on every page load.
const CACHE_TTL_MS = 60_000;
let _cache: Record<string, string> | null = null;
let _cacheAt = 0;

const DEFAULTS: Record<string, string> = {
  exam_pass_percent: "70",
  monthly_price_cents: "999",
  yearly_price_cents: "4999",
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

/** Set one or more site settings. */
export async function setSiteSettings(
  updates: Record<string, string>
): Promise<void> {
  const sql = getSql();
  for (const [key, value] of Object.entries(updates)) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  invalidateSiteSettingsCache();
}

// ─── Typed helpers for common settings ──────────────────────────────────────

export async function getExamPassPercent(): Promise<number> {
  const v = await getSiteSetting("exam_pass_percent");
  const n = parseInt(v, 10);
  return isNaN(n) || n < 1 || n > 100 ? 70 : n;
}

export async function getMonthlyPriceCents(): Promise<number> {
  const v = await getSiteSetting("monthly_price_cents");
  const n = parseInt(v, 10);
  return isNaN(n) || n < 0 ? 999 : n;
}

export async function getYearlyPriceCents(): Promise<number> {
  const v = await getSiteSetting("yearly_price_cents");
  const n = parseInt(v, 10);
  return isNaN(n) || n < 0 ? 4999 : n;
}

export interface SitePricing {
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  monthlyEquivalentCents: number;
  yearlyIfMonthlyCents: number;
  yearlySavingsCents: number;
  yearlyDiscountPercent: number;
}

export async function getSitePricing(): Promise<SitePricing> {
  const monthly = await getMonthlyPriceCents();
  const yearly = await getYearlyPriceCents();
  const yearlyIfMonthly = monthly * 12;
  const savings = yearlyIfMonthly - yearly;
  const discount = yearlyIfMonthly > 0
    ? Math.round((savings / yearlyIfMonthly) * 100)
    : 0;
  return {
    monthlyPriceCents: monthly,
    yearlyPriceCents: yearly,
    monthlyEquivalentCents: Math.round(yearly / 12),
    yearlyIfMonthlyCents: yearlyIfMonthly,
    yearlySavingsCents: savings,
    yearlyDiscountPercent: discount,
  };
}
