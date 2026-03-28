import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { tutorialLangUrl } from "@/lib/urls";
import { getTotalLessonCount } from "@/lib/tutorial-steps";
import type { PopularLanguage } from "@/lib/db/home-popular";
import type { SupportedLanguage } from "@/lib/languages/types";
import SectionHeading from "./SectionHeading";

interface Props {
  languages: PopularLanguage[];
}

export default function PopularTutorialsSection({ languages }: Props) {
  if (languages.length === 0) return null;

  return (
    <section aria-labelledby="popular-langs-heading">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeading
          id="popular-langs-heading"
          title="Popular among learners"
          subtitle="Languages developers are studying right now."
          className="mb-0 text-left"
        />
        <Link
          href="/tutorial/go"
          aria-label="Browse all tutorials"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {languages.map((lang) => {
          const lessonCount = getTotalLessonCount(lang.slug as SupportedLanguage);
          return (
            <Link
              key={lang.slug}
              href={tutorialLangUrl(lang.slug)}
              className="group flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F8FF] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80"
            >
              {/* Icon + name inline */}
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl dark:bg-zinc-700">
                  {getLangIcon(lang.slug)}
                </span>
                <div>
                  <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {lang.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {lessonCount} lessons
                  </p>
                </div>
              </div>

              {/* Learner count */}
              {lang.learnerCount >= 50 && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {lang.learnerCount.toLocaleString()} learners
                </p>
              )}

              {/* CTA — lower left, pill button */}
              <div className="mt-auto pt-1">
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:group-hover:bg-indigo-900/60">
                  Start learning →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
