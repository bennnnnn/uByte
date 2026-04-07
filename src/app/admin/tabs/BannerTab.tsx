/**
 * BannerTab — compose and publish the site-wide announcement banner.
 *
 * linkUrl is validated to allow only relative paths or https:// URLs
 * to prevent phishing / javascript: injection.
 */

import { SectionCard, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData, BannerType } from "../hooks";

interface Props {
  data: AdminData;
}

/** Returns an error message if the URL is disallowed, or null if it's fine. */
function validateLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("https://")) return null;
  if (trimmed.startsWith("http://")) return "Warning: http:// links are not secure.";
  return "Only relative paths (e.g. /pricing) or https:// URLs are allowed.";
}

/* ── Type option config ──────────────────────────────────────────────────── */

const BANNER_TYPES: {
  value: BannerType;
  label: string;
  gradient: string;
  defaultIcon: string;
  badgeLabel: string;
}[] = [
  { value: "announcement", label: "Announcement", gradient: "from-violet-600 via-purple-600 to-indigo-700", defaultIcon: "🎉", badgeLabel: "New" },
  { value: "promo",        label: "Promo / Deal",  gradient: "from-orange-500 via-rose-500 to-pink-600",   defaultIcon: "🔥", badgeLabel: "Deal" },
  { value: "sale",         label: "Sale",           gradient: "from-red-500 via-red-600 to-orange-500",     defaultIcon: "⚡", badgeLabel: "Sale" },
  { value: "info",         label: "Info",           gradient: "from-sky-500 via-blue-500 to-blue-700",      defaultIcon: "💡", badgeLabel: "Info" },
];

/* ── Live preview (mirrors SiteBanner styles exactly) ────────────────────── */

function BannerPreview({
  message,
  linkText,
  linkUrl,
  bannerType,
  bannerIcon,
}: {
  message: string;
  linkText: string;
  linkUrl: string;
  bannerType: BannerType;
  bannerIcon: string;
}) {
  const cfg = BANNER_TYPES.find((t) => t.value === bannerType) ?? BANNER_TYPES[0];
  const icon = bannerIcon.trim() || cfg.defaultIcon;
  const showLink = linkText.trim().length > 0 && linkUrl.trim().length > 0;
  const isBlocked = !!validateLinkUrl(linkUrl) && !validateLinkUrl(linkUrl)?.startsWith("Warning");

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${cfg.gradient}`}>
      {/* noise overlay */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />
      <div className="relative flex items-center justify-center gap-3 px-10 py-2.5">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white ring-1 ring-inset ring-white/25">
          <span>{icon}</span>
          <span>{cfg.badgeLabel}</span>
        </span>
        <p className="text-center text-[13px] font-medium leading-snug text-white">
          {message || <span className="opacity-40 italic">Your message will appear here…</span>}
        </p>
        {showLink && !isBlocked && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/30">
            {linkText}
            <svg className="h-3 w-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        )}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/40">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ── Main tab ────────────────────────────────────────────────────────────── */

export default function BannerTab({ data }: Props) {
  const { bannerData, setBannerData, bannerSaving, bannerMessage, saveBanner } = data;

  const urlError = bannerData ? validateLinkUrl(bannerData.linkUrl) : null;
  const isUrlBlocked = urlError && !urlError.startsWith("Warning");

  const handleSave = () => {
    if (isUrlBlocked) return;
    saveBanner();
  };

  const set = <K extends keyof typeof bannerData>(key: K, value: (typeof bannerData)[K]) =>
    setBannerData((b) => b ? { ...b, [key]: value } : b);

  return (
    <div className="max-w-2xl space-y-4">
      <SectionCard
        title="Announcement banner"
        description="Publish a message at the top of the site for all visitors. Users can dismiss it for the session."
      >
        {bannerData === null ? (
          <LoadingBlock />
        ) : (
          <div className="space-y-5">

            {/* ── Enabled + status ────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  id="banner-enabled"
                  name="banner_enabled"
                  type="checkbox"
                  checked={bannerData.enabled}
                  onChange={(e) => set("enabled", e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner enabled</span>
              </label>
              {bannerData.enabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400 dark:bg-zinc-800">
                  Off
                </span>
              )}
            </div>

            {/* ── Banner type ──────────────────────────────────────────────── */}
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Banner type</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BANNER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => set("bannerType", t.value)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 text-xs font-medium transition-all ${
                      bannerData.bannerType === t.value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    <span className={`h-5 w-full rounded-md bg-gradient-to-r ${t.gradient}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Message + icon ───────────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Message</span>
                <textarea
                  id="banner-message"
                  name="banner_message"
                  value={bannerData.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="e.g. 50% off Pro — this weekend only!"
                  rows={2}
                  maxLength={500}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                <span className="text-right text-[11px] text-zinc-400">{bannerData.message.length}/500</span>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Icon <span className="font-normal">(emoji)</span>
                </span>
                <input
                  id="banner-icon"
                  name="banner_icon"
                  type="text"
                  value={bannerData.bannerIcon}
                  onChange={(e) => set("bannerIcon", e.target.value)}
                  placeholder="🎉"
                  maxLength={4}
                  className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                <span className="text-[11px] text-zinc-400">Optional</span>
              </label>
            </div>

            {/* ── Link ────────────────────────────────────────────────────── */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="banner-link-url" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  CTA link URL
                  <span className="ml-1 font-normal text-zinc-400">(optional)</span>
                </label>
                <input
                  id="banner-link-url"
                  name="banner_link_url"
                  type="text"
                  value={bannerData.linkUrl}
                  onChange={(e) => set("linkUrl", e.target.value)}
                  placeholder="/pricing or https://…"
                  className={`rounded-lg border bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-200 ${
                    isUrlBlocked
                      ? "border-red-400 dark:border-red-600"
                      : urlError
                      ? "border-amber-400 dark:border-amber-600"
                      : "border-zinc-200 dark:border-zinc-700"
                  }`}
                />
                {urlError && (
                  <p className={`text-xs ${isUrlBlocked ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {urlError}
                  </p>
                )}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  CTA button text
                  <span className="ml-1 font-normal text-zinc-400">(optional)</span>
                </span>
                <input
                  id="banner-link-text"
                  name="banner_link_text"
                  type="text"
                  value={bannerData.linkText}
                  onChange={(e) => set("linkText", e.target.value)}
                  placeholder="Get Pro"
                  maxLength={50}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </label>
            </div>

            {/* ── Live preview ─────────────────────────────────────────────── */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Live preview</p>
              <BannerPreview
                message={bannerData.message}
                linkText={bannerData.linkText}
                linkUrl={bannerData.linkUrl}
                bannerType={bannerData.bannerType ?? "announcement"}
                bannerIcon={bannerData.bannerIcon ?? ""}
              />
            </div>

            {/* ── Save ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <SaveButton saving={bannerSaving} label="Publish banner" onClick={handleSave} disabled={!!isUrlBlocked} />
              <SaveFeedback message={bannerMessage} />
            </div>

          </div>
        )}
      </SectionCard>
    </div>
  );
}
