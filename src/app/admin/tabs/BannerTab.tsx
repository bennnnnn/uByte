/**
 * BannerTab — manage the site-wide announcement banner.
 *
 * linkUrl is validated to allow only relative paths or https:// URLs
 * to prevent phishing / javascript: injection.
 */

import { SectionCard, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

/** Returns an error message if the URL is disallowed, or null if it's fine. */
function validateLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null; // empty is fine — means no link
  // Allow relative paths
  if (trimmed.startsWith("/")) return null;
  // Allow https
  if (trimmed.startsWith("https://")) return null;
  // Warn about http (allowed but flagged)
  if (trimmed.startsWith("http://")) return "Warning: http:// links are not secure. Use https:// for external links.";
  // Block everything else (javascript:, data:, //evil.com, etc.)
  return "Only relative paths (e.g. /pricing) or https:// URLs are allowed.";
}

export default function BannerTab({ data }: Props) {
  const { bannerData, setBannerData, bannerSaving, bannerMessage, saveBanner } = data;

  const urlError = bannerData ? validateLinkUrl(bannerData.linkUrl) : null;
  const isUrlBlocked = urlError && !urlError.startsWith("Warning");

  const handleSave = () => {
    if (isUrlBlocked) return;
    saveBanner();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <SectionCard title="Announcement banner" description="Displays a message below the header for all users. Users can dismiss it for the session.">
        {bannerData === null ? <LoadingBlock /> : (
          <div className="space-y-4">

            {/* ── Enabled toggle ───────────────────────────────────────── */}
            <label className="flex items-center gap-2.5">
              <input
                id="banner-enabled"
                name="banner_enabled"
                type="checkbox"
                checked={bannerData.enabled}
                onChange={(e) => setBannerData((b) => b ? { ...b, enabled: e.target.checked } : b)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner enabled</span>
              {bannerData.enabled && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  Live
                </span>
              )}
            </label>

            {/* ── Fields: message, link URL, link text ─────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Message</span>
                <textarea
                  id="banner-message"
                  name="banner_message"
                  value={bannerData.message}
                  onChange={(e) => setBannerData((b) => b ? { ...b, message: e.target.value } : b)}
                  placeholder="e.g. 80% off this week!"
                  rows={2}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </label>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="banner-link-url" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Link URL
                    <span className="ml-1 font-normal text-zinc-400">(relative or https://)</span>
                  </label>
                  <input
                    id="banner-link-url"
                    name="banner_link_url"
                    type="text"
                    value={bannerData.linkUrl}
                    onChange={(e) => setBannerData((b) => b ? { ...b, linkUrl: e.target.value } : b)}
                    placeholder="/pricing"
                    className={`rounded-lg border bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800 dark:text-zinc-200 ${
                      isUrlBlocked
                        ? "border-red-400 focus:border-red-500 dark:border-red-600"
                        : urlError
                        ? "border-amber-400 focus:border-amber-500 dark:border-amber-600"
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
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Link text</span>
                  <input
                    id="banner-link-text"
                    name="banner_link_text"
                    type="text"
                    value={bannerData.linkText}
                    onChange={(e) => setBannerData((b) => b ? { ...b, linkText: e.target.value } : b)}
                    placeholder="Sign up"
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </label>
              </div>
            </div>

            {/* ── Live preview ─────────────────────────────────────────── */}
            {bannerData.message && (
              <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Preview</p>
                <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <span>{bannerData.message}</span>
                  {bannerData.linkText && !isUrlBlocked && (
                    <span className="font-medium text-indigo-600 underline dark:text-indigo-400">
                      {bannerData.linkText}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Save ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 pt-1">
              <SaveButton saving={bannerSaving} label="Save banner" onClick={handleSave} disabled={!!isUrlBlocked} />
              <SaveFeedback message={bannerMessage} />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
