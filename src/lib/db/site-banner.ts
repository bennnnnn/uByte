import { getSql } from "./client";

export type BannerType = "announcement" | "promo" | "sale" | "info";

export interface SiteBanner {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
  bannerType: BannerType;
  bannerIcon: string;
}

const DEFAULTS: SiteBanner = {
  enabled: false,
  message: "",
  linkUrl: "",
  linkText: "",
  bannerType: "announcement",
  bannerIcon: "",
};

const VALID_TYPES: BannerType[] = ["announcement", "promo", "sale", "info"];

/** Get site banner config (public). */
export async function getSiteBanner(): Promise<SiteBanner> {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT key, value FROM site_settings
      WHERE key IN ('banner_enabled', 'banner_message', 'banner_link_url', 'banner_link_text', 'banner_type', 'banner_icon')
    `;
    const map = new Map((rows as { key: string; value: string }[]).map((r) => [r.key, r.value]));
    const rawType = map.get("banner_type") ?? "";
    return {
      enabled: map.get("banner_enabled") === "1",
      message: map.get("banner_message") ?? DEFAULTS.message,
      linkUrl: map.get("banner_link_url") ?? DEFAULTS.linkUrl,
      linkText: map.get("banner_link_text") ?? DEFAULTS.linkText,
      bannerType: (VALID_TYPES.includes(rawType as BannerType) ? rawType : "announcement") as BannerType,
      bannerIcon: map.get("banner_icon") ?? DEFAULTS.bannerIcon,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/** Update banner (admin only). */
export async function setSiteBanner(updates: Partial<SiteBanner>): Promise<void> {
  const sql = getSql();
  if (updates.enabled !== undefined) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_enabled', ${updates.enabled ? "1" : "0"}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.message !== undefined) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_message', ${String(updates.message).slice(0, 500)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.linkUrl !== undefined) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_link_url', ${String(updates.linkUrl).slice(0, 500)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.linkText !== undefined) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_link_text', ${String(updates.linkText).slice(0, 100)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.bannerType !== undefined && VALID_TYPES.includes(updates.bannerType)) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_type', ${updates.bannerType}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
  if (updates.bannerIcon !== undefined) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES ('banner_icon', ${String(updates.bannerIcon).slice(0, 10)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  }
}
