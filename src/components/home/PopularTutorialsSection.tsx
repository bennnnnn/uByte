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
              className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-gray-100 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80"
            >
              {/* Top row: icon + learner count */}
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl dark:bg-zinc-700">
                  {getLangIcon(lang.slug)}
                </span>
                {lang.completionCount > 0 && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    {lang.completionCount.toLocaleString()} learners
                  </span>
                )}
              </div>

              {/* Name + lesson count */}
              <div>
                <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {lang.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                  {lessonCount} lessons
                </p>
              </div>

              {/* CTA */}
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
