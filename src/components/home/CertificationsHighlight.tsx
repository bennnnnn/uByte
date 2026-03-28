import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { LANGUAGES, ALL_LANGUAGE_KEYS } from "@/lib/languages/registry";

interface LangStats {
  attemptsSubmitted: number;
  usersPassed: number;
}

interface ExamConfig {
  examSize: number;
  examDurationMinutes: number;
  passPercent: number;
}

interface Props {
  totalCertificates: number;
  totalAttempts: number;
  statsByLang?: Record<string, LangStats>;
  examConfigByLang?: Record<string, ExamConfig>;
}

/** Only show learner count once it reaches this threshold — avoids showing "2 learners" */
const MIN_LEARNERS_TO_SHOW = 10;

export default function CertificationsHighlight({
  totalCertificates,
  totalAttempts,
  statsByLang = {},
  examConfigByLang = {},
}: Props) {
  return (
    <section aria-labelledby="certs-highlight-heading">

      {/* Big feature card */}
      <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 px-6 py-8 sm:px-8 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-violet-950/20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Left — copy */}
          <div className="max-w-md">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              🎓 Free certifications
            </p>
            <h2 id="certs-highlight-heading" className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
              A certificate that actually means something.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Our exams are timed, hard, and randomized — just like real technical screenings.
              Pass one and earn a shareable certificate with a public verification URL.{" "}
              <strong className="font-semibold text-zinc-800 dark:text-zinc-200">100% free. No subscription required.</strong>
            </p>

            {/* Stats */}
            {totalCertificates > 0 && (
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-xl font-black text-indigo-600">{totalCertificates.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">certificates issued</p>
                </div>
                {totalAttempts > 0 && (
                  <div>
                    <p className="text-xl font-black text-indigo-600">{totalAttempts.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">exams taken</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — visual */}
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-indigo-800/40 dark:bg-zinc-800/60">
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Certificate of completion</p>
              <p className="mt-1 text-lg font-black text-zinc-900 dark:text-zinc-100">Go Programming</p>
              <p className="text-sm text-zinc-500">Issued by uByte · Verified</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-900/40">✓</span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Passed with 84% · 45 min exam</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Certification cards — one per configured language, derived from registry */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_LANGUAGE_KEYS.filter(slug => examConfigByLang[slug]).map(slug => {
          const config   = examConfigByLang[slug];
          const stats    = statsByLang[slug];
          const langName = LANGUAGES[slug as keyof typeof LANGUAGES]?.name ?? slug;
          const attempts = stats?.attemptsSubmitted ?? 0;
          const passed   = stats?.usersPassed ?? 0;
          const passRate = attempts > 0 ? Math.round((passed / attempts) * 100) : null;
          const showAttempts = attempts >= MIN_LEARNERS_TO_SHOW;

          return (
            <Link
              key={slug}
              href={`/certifications/${slug}`}
              className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-indigo-700"
            >
              {/* Header: icon + name */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-xl ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
                  {getLangIcon(slug)}
                </span>
                <p className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {langName}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Questions</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {config ? config.examSize : "—"}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Time limit</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {config ? `${config.examDurationMinutes} min` : "—"}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">Pass score</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {config ? `${config.passPercent}%` : "—"}
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                    {passRate !== null ? "Pass rate" : "Attempts"}
                  </p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    {passRate !== null
                      ? `${passRate}%`
                      : showAttempts
                        ? attempts.toLocaleString()
                        : "—"}
                  </p>
                </div>
              </div>

              {/* Attempts footer */}
              {showAttempts && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {attempts.toLocaleString()} attempts · {passed.toLocaleString()} passed
                </p>
              )}

              {/* CTA */}
              <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-xs font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
                  View certification →
                </span>
              </div>
            </Link>
          );
        })}

      </div>

      <div className="mt-6 text-center">
        <Link
          href="/certifications"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Browse all certifications →
        </Link>
      </div>

    </section>
  );
}
