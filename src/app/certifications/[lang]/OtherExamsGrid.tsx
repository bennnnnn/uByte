import Link from "next/link";
import { LANGUAGES } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import type { SupportedLanguage } from "@/lib/languages/types";
import { DEFAULT_EXAM_CONFIG } from "@/lib/db";
import type { ExamLangPublicStats } from "@/lib/db/exam-attempts";

function getDifficultyLabel(passRate: number, hasData: boolean): { label: string; color: string } {
  if (!hasData) return { label: "New", color: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" };
  if (passRate >= 70) return { label: "Beginner", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
  if (passRate >= 40) return { label: "Intermediate", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" };
  return { label: "Advanced", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" };
}

interface Props {
  currentLang: string;
  langSlugs: string[];
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
  publicStatsByLang: Record<string, ExamLangPublicStats>;
}

export default function OtherExamsGrid({ currentLang, langSlugs, examConfigByLang, publicStatsByLang }: Props) {
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
            Other certifications
          </h2>
        </div>
        <Link
          href="/certifications"
          className="text-sm font-medium text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((slug) => {
          const config = LANGUAGES[slug as SupportedLanguage];
          if (!config) return null;
          const examCfg = examConfigByLang[slug] ?? DEFAULT_EXAM_CONFIG;
          const ps = publicStatsByLang[slug];
          const hasData = ps && ps.attemptsSubmitted > 0;
          const passRate = ps?.passRatePercent ?? 0;
          const difficulty = getDifficultyLabel(passRate, !!hasData);
          return (
            <Link
              key={slug}
              href={`/certifications/${slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-surface-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-indigo-700"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-white text-2xl dark:border-zinc-700/60 dark:bg-zinc-800">
                {getLangIcon(slug)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                    {config.name}
                  </p>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {examCfg.examSize} questions · {examCfg.examDurationMinutes} min{hasData ? ` · ${passRate}% pass rate` : ""}
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
