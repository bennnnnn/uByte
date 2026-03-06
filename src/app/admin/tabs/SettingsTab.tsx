/**
 * SettingsTab — global site configuration (exam pass threshold).
 *
 * Currently only exposes the exam pass percentage. Pricing is managed
 * through Paddle and intentionally excluded from admin config to avoid
 * display-vs-charge mismatches.
 */

import { SectionCard, SaveButton, SaveFeedback, LoadingBlock } from "../components";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function SettingsTab({ data }: Props) {
  const { siteSettings, setSiteSettings, siteSettingsSaving, siteSettingsMessage, saveSiteSettings } = data;

  return (
    <div className="max-w-2xl">
      <SectionCard title="Exam configuration" description="The pass threshold applies globally to all exams. Changes take effect immediately.">
        {siteSettings === null ? <LoadingBlock /> : (
          <div className="space-y-5">

            {/* ── Pass threshold input ─────────────────────────────────── */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Pass threshold (%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={siteSettings.exam_pass_percent}
                  onChange={(e) => setSiteSettings((s) => s ? { ...s, exam_pass_percent: e.target.value } : s)}
                  className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-right font-mono text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">Minimum score to pass</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">Users must score at least this % to earn a certificate.</p>
                </div>
              </div>
            </div>

            {/* ── Save ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <SaveButton saving={siteSettingsSaving} label="Save" onClick={saveSiteSettings} />
              <SaveFeedback message={siteSettingsMessage} />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
