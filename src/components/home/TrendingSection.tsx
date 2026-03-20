import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { tutorialLangUrl } from "@/lib/urls";
import type { PopularLanguage } from "@/lib/db/home-popular";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Props {
  languages: PopularLanguage[];
  /** compact=true shows 3 cards — used on the logged-in homepage */
  compact?: boolean;
}

export default function TrendingSection({ languages, compact = false }: Props) {
  if (languages.length === 0) return null;

  // Languages with real learner data, sorted highest first
  const withLearners = languages
    .filter(l => l.completionCount > 0)
    .sort((a, b) => b.completionCount - a.completionCount)
    .slice(0, 3);

  const showPopular = !compact && withLearners.length > 0;
  const allLangs = languages.slice(0, compact ? 3 : 9);

  return (
    <section aria-labelledby="tutorials-heading">

      {/* ── Popular tutorials — top 3 by learner count ──────────────── */}
      {showPopular && (
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Most popular
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Popular tutorials
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {withLearners.map(lang => {
              const lessons = getTotalLessonCount(lang.slug as SupportedLanguage);
              return (
                <Link
                  key={lang.slug}
                  href={tutorialLangUrl(lang.slug)}
                  className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl dark:bg-zinc-700">
                    {getLangIcon(lang.slug)}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {lang.name}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
                      {lessons} lessons
                    </p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {lang.completionCount.toLocaleString()} learners
                    </span>
                    <span className="text-xs font-semibold text-indigo-600 transition-[gap] group-hover:gap-2 dark:text-indigo-400">
                      Start learning →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── All tutorials grid ───────────────────────────────────────── */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div>
            {!compact && (
              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                All languages
              </p>
            )}
            <h2 id="tutorials-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {compact ? "Trending this week" : "Browse tutorials"}
            </h2>
          </div>
          <Link
            href="/tutorial"
            className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Browse all →
          </Link>
        </div>

        <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}`}>
          {allLangs.map(lang => {
            const lessons = getTotalLessonCount(lang.slug as SupportedLanguage);
            return (
              <Link
                key={lang.slug}
                href={tutorialLangUrl(lang.slug)}
                className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 text-xl dark:bg-zinc-700">
                  {getLangIcon(lang.slug)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {lang.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                    {lessons} lessons
                  </p>
                </div>
                {lang.completionCount > 0 && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {lang.completionCount.toLocaleString()} learners
                  </p>
                )}
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Start learning →
                </p>
              </Link>
            );
          })}
        </div>
      </div>

    </section>
  );
}
