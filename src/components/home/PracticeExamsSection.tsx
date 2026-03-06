import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";

/* Amber accent so Practice exams are visually distinct from Interview practice (indigo). */
const CARD_STYLE =
  "border-amber-200 bg-gradient-to-br from-white to-amber-50/60 hover:border-amber-400 hover:shadow-amber-100 dark:border-amber-900/40 dark:from-zinc-900 dark:to-amber-950/20 dark:hover:border-amber-700";
const BADGE_STYLE = "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
const ARROW_STYLE = "text-amber-600 dark:text-amber-400";

/** Questions per exam and duration come from admin settings (site_settings), not from the question bank size. */
interface Props {
  examSize: number;
  examDurationMinutes: number;
}

export default function PracticeExamsSection({ examSize, examDurationMinutes }: Props) {
  const langSlugs = getAllLanguageSlugs();

  return (
    <section aria-labelledby="practice-exams-heading" className="space-y-5">
      {/* ── Main practice exams CTA card (amber accent) ────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-amber-50/40 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-950/20">
        <div className="p-6 sm:p-8">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 id="practice-exams-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Practice exams
            </h2>
            <span className="rounded-full border border-amber-300 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-zinc-900/80 dark:text-amber-400">
              Pro
            </span>
          </div>
          <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            Timed multiple-choice exams by language. {examSize} questions per exam, {examDurationMinutes} minutes. Score at least 70% to pass and earn a certificate.
          </p>

          <Link
            href="/practice-exams"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:bg-amber-500 hover:shadow-amber-500/35 hover:-translate-y-0.5"
          >
            <span>View practice exams</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Per-language exam cards ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langSlugs.map((slug) => {
          const config = LANGUAGES[slug as keyof typeof LANGUAGES];
          if (!config) return null;
          return (
            <Link
              key={slug}
              href={`/practice-exams/${slug}`}
              className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${CARD_STYLE}`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl shadow-sm dark:bg-amber-950/50">
                    {getLangIcon(slug)}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {config.name}
                  </h3>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE_STYLE}`} title="Questions per exam (set in Admin → Exams)">
                  {examSize} per exam
                </span>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {examDurationMinutes} min · 70% to pass · Certificate
              </p>

              <div className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-[gap] group-hover:gap-2 ${ARROW_STYLE}`}>
                <span>Start exam</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
