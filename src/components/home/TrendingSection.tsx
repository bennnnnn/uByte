import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import { tutorialLangUrl } from "@/lib/urls";
import { getAllTutorials } from "@/lib/tutorials";
import type { PopularLanguage } from "@/lib/db/home-popular";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Props {
  languages: PopularLanguage[];
  /** compact=true shows 3 cards — used on the logged-in homepage */
  compact?: boolean;
}

export default function TrendingSection({ languages, compact = false }: Props) {
  if (languages.length === 0) return null;

  const featuredOrder: SupportedLanguage[] = ["python", "go", "javascript", "typescript", "sql", "java", "rust", "csharp", "cpp"];
  const STARTER_LABELS: Partial<Record<SupportedLanguage, string>> = {
    python: "Best for beginners",
    go: "Best for backend basics",
    javascript: "Best for web",
    typescript: "Best for JavaScript developers",
    sql: "Best for data fundamentals",
    java: "Best for structured OOP",
    rust: "Best for systems thinking",
    csharp: "Best for .NET and Unity",
    cpp: "Best for performance-focused learning",
  };

  const sorted = [...languages].sort((a, b) => {
    const aRank = featuredOrder.indexOf(a.slug as SupportedLanguage);
    const bRank = featuredOrder.indexOf(b.slug as SupportedLanguage);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
  const featured = sorted.slice(0, 3);
  const allLangs = sorted.slice(0, compact ? 3 : 9);

  return (
    <section aria-labelledby="tutorials-heading">

      {!compact && (
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Start here
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Recommended first tracks
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map(lang => {
              const supportedLang = lang.slug as SupportedLanguage;
              const lessons = getTotalLessonCount(supportedLang);
              const tutorials = getAllTutorials(supportedLang);
              const topicCount = tutorials.length;
              const totalMinutes = tutorials.reduce((sum, tutorial) => sum + tutorial.estimatedMinutes, 0);
              return (
                <Link
                  key={lang.slug}
                  href={tutorialLangUrl(lang.slug)}
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
                >
                  {/* Icon + name */}
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-2xl dark:bg-zinc-700">
                      {getLangIcon(lang.slug)}
                    </span>
                    <p className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {lang.name}
                    </p>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                    {STARTER_LABELS[supportedLang] ?? "Structured track"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-700/70">{topicCount} topics</span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-700/70">{lessons} lessons</span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-700/70">~{Math.max(1, Math.round(totalMinutes / 60))}h</span>
                  </div>

                  {/* CTA */}
                  <p className="mt-auto pt-5 text-right text-sm font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
                    Start track →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── All tutorials grid ───────────────────────────────────────── */}
      <div>
        <div className="mb-5">
          {!compact && (
            <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Full catalog
            </p>
          )}
          <h2 id="tutorials-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {compact ? "Other tracks to explore" : "Browse all languages"}
          </h2>
        </div>

        <div className={`grid gap-4 ${compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
          {allLangs.map(lang => {
            const supportedLang = lang.slug as SupportedLanguage;
            const lessons = getTotalLessonCount(supportedLang);
            const tutorials = getAllTutorials(supportedLang);
            const totalMinutes = tutorials.reduce((sum, tutorial) => sum + tutorial.estimatedMinutes, 0);
            return (
              <Link
                key={lang.slug}
                href={tutorialLangUrl(lang.slug)}
                className="group flex min-h-[120px] flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
              >
                {/* Icon + name + lesson count inline */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-lg dark:bg-zinc-700">
                    {getLangIcon(lang.slug)}
                  </span>
                  <p className="text-sm font-bold leading-tight text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {lang.name}
                    <span className="ml-2 font-normal text-zinc-400 dark:text-zinc-500">{lessons} lessons</span>
                  </p>
                </div>

                {/* Learner count + CTA row */}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {tutorials.length} topics · ~{Math.max(1, Math.round(totalMinutes / 60))}h
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
                    Start →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!compact && (
          <div className="mt-6 text-center">
            <Link
              href="/tutorial"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Browse all tutorials →
            </Link>
          </div>
        )}
      </div>

    </section>
  );
}
