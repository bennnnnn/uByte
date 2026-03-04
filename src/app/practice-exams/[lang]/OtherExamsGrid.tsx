import Link from "next/link";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { EXAM_SIZE, EXAM_DURATION_MINUTES } from "@/lib/exams/content";

const LANG_ICONS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
};

interface Props {
  currentLang: string;
  langSlugs: string[];
}

export default function OtherExamsGrid({ currentLang, langSlugs }: Props) {
  const others = langSlugs.filter((slug) => slug !== currentLang);

  if (others.length === 0) return null;

  return (
    <section aria-labelledby="other-exams-heading" className="mt-16">
      <h2
        id="other-exams-heading"
        className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100"
      >
        Other practice exams
      </h2>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Explore exams in other languages. Same format — 40 questions, 45 minutes, 70% to pass.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((slug) => {
          const config = LANGUAGES[slug as SupportedLanguage];
          if (!config) return null;
          return (
            <Link
              key={slug}
              href={`/practice-exams/${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-indigo-600"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl dark:bg-indigo-950/50">
                {LANG_ICONS[slug] ?? "📋"}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {config.name} Practice Exam
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {EXAM_SIZE} questions · {EXAM_DURATION_MINUTES} min
                </p>
              </div>
              <span className="shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
