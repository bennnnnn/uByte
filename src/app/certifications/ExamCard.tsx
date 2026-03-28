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

  const ctaLabel = tryAgain ? "Try again →" : isPassed ? "View cert →" : "Take free exam →";

  return (
    <Link
      href={`/certifications/${slug}`}
      aria-label={`${config.name} certification exam — difficulty: ${difficulty.label}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-zinc-700 dark:bg-zinc-900 sm:rounded-2xl"
    >
      <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-5 sm:p-6">
        {/* Top row: icon + name + difficulty + status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-lg dark:border-zinc-700/60 dark:bg-zinc-800 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl">
            {getLangIcon(slug)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:text-base">{config.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:px-2 sm:text-[11px] ${difficulty.color}`}>
                {difficulty.label}
              </span>
              {isPassed && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 sm:px-2 sm:text-[11px]">
                  ✓ Certified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        {/* Exam info + stats */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-3">
          <div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Questions</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-lg">{examConfig.examSize}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Time limit</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-lg">
              {examConfig.examDurationMinutes}<span className="ml-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400 sm:text-sm">min</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Attempts</p>
            <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100 sm:text-lg">
              {totalAttempts > 0 ? totalAttempts.toLocaleString() : "0"}
            </p>
          </div>
          {isLoggedIn && tryAgain && stats?.bestScore != null ? (
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Your best</p>
              <p className="mt-0.5 text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400 sm:text-lg">
                {stats.bestScore}%
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 sm:text-xs">Pass rate</p>
              <p className={`mt-0.5 text-sm font-bold tabular-nums sm:text-lg ${
                !hasData ? "text-zinc-500 dark:text-zinc-400" : passRate >= 60 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
              }`}>
                {hasData ? `${passRate}%` : "—"}
              </p>
            </div>
          )}
        </div>

        {/* CTA button */}
        <span className="mt-auto flex w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white shadow-sm shadow-indigo-500/20 transition-all group-hover:-translate-y-0.5 group-hover:bg-indigo-500 sm:px-5 sm:py-3 sm:text-sm sm:shadow-md">
          {ctaLabel}
        </span>
      </div>
    </Link>
  );
}
