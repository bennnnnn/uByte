import Link from "next/link";
import { LANGUAGES } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { UserExamLangStats } from "@/lib/db/exam-attempts";

function getDifficultyFromPassRate(passRate: number, hasData: boolean): { label: string; color: string } {
  // text-*-700 on *-100 backgrounds: all pass WCAG AA (≥4.5:1) for the 11px badge text.
  if (!hasData) return { label: "New", color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
  if (passRate >= 70) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
  if (passRate >= 40) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
}

export type ExamCardStats = Omit<UserExamLangStats, "lang">;

export interface ExamCardPublicStats {
  usersTaken: number;
  attemptsSubmitted: number;
  passRatePercent: number;
}

interface Props {
  slug: string;
  examConfig: { examSize: number; examDurationMinutes: number };
  stats?: ExamCardStats;
  publicStats?: ExamCardPublicStats;
  isLoggedIn?: boolean;
}

export default function ExamCard({ slug, examConfig, stats, publicStats, isLoggedIn = false }: Props) {
  const config = LANGUAGES[slug as keyof typeof LANGUAGES];
  if (!config) return null;

  const isPassed  = stats?.hasCertificate ?? false;
  const tryAgain  = stats && stats.attemptCount > 0 && !stats.lastPassed && !stats.hasCertificate;
  const totalAttempts = publicStats?.attemptsSubmitted ?? 0;
  const passRate  = publicStats?.passRatePercent ?? 0;
  const hasData   = totalAttempts > 0;
  const difficulty = getDifficultyFromPassRate(passRate, hasData);

  const ctaLabel = tryAgain ? "Try again →" : isPassed ? "View cert →" : "Take certification →";

  return (
    <Link
      href={`/certifications/${slug}`}
      aria-label={`${config.name} certification exam — difficulty: ${difficulty.label}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-surface-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700"
    >
      <div className="flex flex-1 flex-col gap-5 p-6">
        {/* Top row: icon + name + difficulty + status */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-2xl dark:border-zinc-700/60 dark:bg-zinc-800">
            {getLangIcon(slug)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{config.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficulty.color}`}>
                {difficulty.label}
              </span>
              {isPassed && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ Certified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Exam info + stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Questions</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{examConfig.examSize}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Time limit</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {examConfig.examDurationMinutes}<span className="ml-0.5 text-sm font-normal text-zinc-600 dark:text-zinc-400">min</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Attempts</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {totalAttempts > 0 ? totalAttempts.toLocaleString() : "0"}
            </p>
          </div>
          {/* Show user's best score if they've failed before; otherwise show community pass rate */}
          {isLoggedIn && tryAgain && stats?.bestScore != null ? (
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Your best</p>
              {/* amber-700 on white: ~5.0:1 — passes WCAG AA */}
              <p className="mt-0.5 text-lg font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {stats.bestScore}%
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Pass rate</p>
              <p className={`mt-0.5 text-lg font-bold tabular-nums ${
                !hasData ? "text-zinc-500 dark:text-zinc-400" : passRate >= 60 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
              }`}>
                {hasData ? `${passRate}%` : "—"}
              </p>
            </div>
          )}
        </div>

        {/* CTA button */}
        <span className="mt-auto flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all group-hover:-translate-y-0.5 group-hover:bg-indigo-500">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}
