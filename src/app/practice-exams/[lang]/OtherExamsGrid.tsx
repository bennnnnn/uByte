import Link from "next/link";
import { LANGUAGES } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";

interface Props {
  currentLang: string;
  langSlugs: string[];
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
}

export default function OtherExamsGrid({ currentLang, langSlugs, examConfigByLang }: Props) {
  const others = langSlugs.filter((slug) => slug !== currentLang);
  if (others.length === 0) return null;

  return (
    <section aria-labelledby="other-exams-heading" className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2
            id="other-exams-heading"
            className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
          >
            Other exams
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Each exam is independently timed and scored.
          </p>
        </div>
        <Link
          href="/practice-exams"
          className="text-sm font-medium text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((slug) => {
          const config = LANGUAGES[slug as SupportedLanguage];
          if (!config) return null;
          const examConfig = examConfigByLang[slug] ?? { examSize: 40, examDurationMinutes: 45, passPercent: 70 };
          return (
            <Link
              key={slug}
              href={`/practice-exams/${slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-2xl dark:border-zinc-700/60 dark:bg-zinc-800">
                {getLangIcon(slug)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {config.name}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {examConfig.examSize} questions · {examConfig.examDurationMinutes} min · {examConfig.passPercent}% to pass
                </p>
              </div>
              <span className="shrink-0 text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-zinc-600 dark:group-hover:text-indigo-400">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
