import Link from "next/link";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";

const LANG_ICONS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
};

interface ExamCardsSectionProps {
  currentLang: string;
  langSlugs: string[];
  examSize: number;
  examDurationMinutes: number;
}

export default function ExamCardsSection({
  currentLang,
  langSlugs,
  examSize,
  examDurationMinutes,
}: ExamCardsSectionProps) {
  return (
    <section aria-label="Practice exams by language" className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langSlugs.map((slug) => {
          const config = LANGUAGES[slug as SupportedLanguage];
          if (!config) return null;
          const isCurrent = slug === currentLang;
          return (
            <Link
              key={slug}
              href={`/practice-exams/${slug}`}
              className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                isCurrent
                  ? "border-indigo-300 bg-indigo-50/50 ring-2 ring-indigo-200 dark:border-indigo-700 dark:bg-indigo-950/30 dark:ring-indigo-800"
                  : "border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-800"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                      isCurrent ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {LANG_ICONS[slug] ?? "📋"}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {config.name} Practice Exam
                    </h2>
                    {isCurrent && (
                      <span className="mt-0.5 inline-block text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        Viewing this exam
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isCurrent
                      ? "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {examSize} questions
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>{examDurationMinutes} minutes</li>
                <li>70% to pass</li>
                <li>Certificate on pass</li>
              </ul>
              {!isCurrent && (
                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition-gap group-hover:gap-2">
                  <span>View exam</span>
                  <span>→</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
