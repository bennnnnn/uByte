/**
 * BannerTab — manage the site-wide announcement banner.
 *
 * Lets the admin toggle the banner, edit the message text,
 * and configure the CTA link URL / label. A "Live" badge
 * shows when the banner is currently visible to users.
 */

import { SectionCard, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function BannerTab({ data }: Props) {
  const { bannerData, setBannerData, bannerSaving, bannerMessage, saveBanner } = data;

  return (
    <div className="max-w-2xl">
      <SectionCard title="Announcement banner" description="Displays a message below the header for all users. Users can dismiss it for the session.">
        {bannerData === null ? <LoadingBlock /> : (
          <div className="space-y-4">

            {/* ── Enabled toggle ───────────────────────────────────────── */}
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={bannerData.enabled}
                onChange={(e) => setBannerData((b) => b ? { ...b, enabled: e.target.checked } : b)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner enabled</span>
              {bannerData.enabled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Live</span>}
            </label>

            {/* ── Fields: message, link URL, link text ─────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Message</span>
                <textarea
                  value={bannerData.message}
                  onChange={(e) => setBannerData((b) => b ? { ...b, message: e.target.value } : b)}
                  placeholder="e.g. 80% off this week!"
                  rows={2}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </label>

              <div className="space-y-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Link URL</span>
                  <input type="text" value={bannerData.linkUrl} onChange={(e) => setBannerData((b) => b ? { ...b, linkUrl: e.target.value } : b)} placeholder="/pricing" className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Link text</span>
                  <input type="text" value={bannerData.linkText} onChange={(e) => setBannerData((b) => b ? { ...b, linkText: e.target.value } : b)} placeholder="Sign up" className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                </label>
              </div>
            </div>

            {/* ── Save ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 pt-1">
              <SaveButton saving={bannerSaving} label="Save banner" onClick={saveBanner} />
              <SaveFeedback message={bannerMessage} />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
