/**
 * AnalyticsTab — tutorial completions, practice problems, and step heatmap.
 *
 * Three section cards:
 *   1. Tutorial completion counts with thumbs up/down satisfaction scores.
 *   2. Practice problem solve rates.
 *   3. Per-step difficulty heatmap (lazy-loaded when a tutorial is selected).
 */

import { SectionCard, EmptyRow } from "../components";
import { slugToTitle } from "../utils";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function AnalyticsTab({ data }: Props) {
  const { analytics, practiceStats, stepStats, heatmapSlug, loadStepStats } = data;

  return (
    <div className="space-y-5">

      {/* ── Tutorial completions & ratings ─────────────────────────────── */}
      <SectionCard title="Tutorial completions & ratings">
        <div className="overflow-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <Th align="left">Tutorial</Th>
                <Th>Done</Th>
                <Th>👍</Th>
                <Th>👎</Th>
                <Th last>Score</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {analytics.map((t) => {
                const total = t.thumbs_up + t.thumbs_down;
                const score = total > 0 ? Math.round((t.thumbs_up / total) * 100) : null;
                return (
                  <tr key={t.slug} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-2.5">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(t.slug)}</span>
                      <span className="ml-2 text-xs text-zinc-400">{t.slug}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{t.completed_count}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">{t.thumbs_up}</td>
                    <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">{t.thumbs_down}</td>
                    <td className="px-5 py-2.5 text-right">
                      {score !== null
                        ? <span className={score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500"}>{score}%</span>
                        : <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                    </td>
                  </tr>
                );
              })}
              {analytics.length === 0 && <EmptyRow cols={5} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Practice problems ──────────────────────────────────────────── */}
      <SectionCard title="Practice problems">
        <div className="overflow-auto -mx-5 -mb-5">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <Th align="left">Problem</Th>
                <Th>Solved</Th>
                <Th>Attempts</Th>
                <Th last>Rate</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {practiceStats.map((p) => (
                <tr key={p.problem_slug} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-5 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(p.problem_slug)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{p.solved_count}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{p.attempt_count}</td>
                  <td className="px-5 py-2.5 text-right">{p.attempt_count > 0 ? Math.round((p.solved_count / p.attempt_count) * 100) + "%" : "—"}</td>
                </tr>
              ))}
              {practiceStats.length === 0 && <EmptyRow cols={4} />}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Step difficulty heatmap ────────────────────────────────────── */}
      <SectionCard title="Step difficulty heatmap" description="Pick a tutorial to see pass rates per step.">
        <select
          value={heatmapSlug}
          onChange={(e) => loadStepStats(e.target.value)}
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">Select tutorial…</option>
          {analytics.map((t) => <option key={t.slug} value={t.slug}>{slugToTitle(t.slug)}</option>)}
        </select>

        {stepStats.length > 0 && (
          <div className="mt-4 space-y-2">
            {stepStats.map((s) => {
              const total = s.pass_count + s.fail_count;
              const pct = total > 0 ? Math.round((s.pass_count / total) * 100) : 0;
              return (
                <div key={s.step_index} className="flex items-center gap-3">
                  <span className="w-14 text-right text-xs font-medium text-zinc-500">Step {s.step_index + 1}</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className={"h-2.5 rounded-full transition-all " + (pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: Math.max(pct, 2) + "%" }} />
                  </div>
                  <span className="w-20 text-right text-xs text-zinc-400">{pct}% ({total})</span>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ── Reusable table header cell ──────────────────────────────────────────── */

function Th({ children, align = "right", last }: { children: React.ReactNode; align?: "left" | "right"; last?: boolean }) {
  return (
    <th className={`${last ? "px-5" : align === "left" ? "px-5" : "px-4"} py-2.5 text-${align} text-xs font-semibold uppercase tracking-wide text-zinc-400`}>
      {children}
    </th>
  );
}
