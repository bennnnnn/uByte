import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { tutorialLangUrl } from "@/lib/urls";
import type { PopularLanguage } from "@/lib/db/home-popular";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Props {
  languages: PopularLanguage[];
  /** compact=true shows 3 cards in a row — used on the logged-in homepage */
  compact?: boolean;
}

export default function TrendingSection({ languages, compact = false }: Props) {
  if (languages.length === 0) return null;

  const limit = compact ? 3 : 9;
  const gridCols = compact
    ? "grid-cols-1 gap-3 sm:grid-cols-3"
    : "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <section aria-labelledby="trending-heading">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Most popular
          </p>
          <h2 id="trending-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {compact ? "Trending this week" : "Where other developers are starting"}
          </h2>
        </div>
        <Link
          href="/tutorial"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          All languages →
        </Link>
      </div>

      <div className={`grid ${gridCols}`}>
        {languages.slice(0, limit).map((lang, idx) => {
          const lessonCount = getTotalLessonCount(lang.slug as SupportedLanguage);
          const rank = idx + 1;
          return (
            <Link
              key={lang.slug}
              href={tutorialLangUrl(lang.slug)}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
            >
              {/* Rank badge */}
              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-black text-zinc-400 dark:bg-zinc-700">
                #{rank}
              </span>

              {/* Icon */}
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-2xl shadow-sm dark:bg-zinc-700">
                {getLangIcon(lang.slug)}
              </span>

              {/* Info */}
              <div>
                <p className="font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {lang.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {lessonCount} lessons
                </p>
              </div>

              {/* Learner count */}
              {lang.completionCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {lang.completionCount.toLocaleString()} learners
                  </span>
                </div>
              )}

              <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-[gap] group-hover:gap-2 dark:text-indigo-400">
                <span>Start learning</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
