import Link from "next/link";
import { getLangIcon } from "@/lib/languages/icons";
import { LANGUAGES } from "@/lib/languages/registry";

const CERT_SLUGS = ["go", "python", "javascript", "java", "rust", "cpp", "csharp"];

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

      {/* Certification list — data comes from admin settings, not hardcoded */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CERT_SLUGS.map(slug => {
          const config   = examConfigByLang[slug];
          const stats    = statsByLang[slug];
          const langName = LANGUAGES[slug as keyof typeof LANGUAGES]?.name ?? slug;
          const learners = stats?.attemptsSubmitted ?? 0;
          const showLearners = learners >= MIN_LEARNERS_TO_SHOW;

          return (
            <Link
              key={slug}
              href={`/certifications/${slug}`}
              className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm dark:border-zinc-700/60 dark:bg-zinc-800/80 dark:hover:border-indigo-700"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-lg ring-1 ring-zinc-100 dark:bg-zinc-700 dark:ring-zinc-600">
                {getLangIcon(slug)}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-800 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {langName}
                </p>
                <p className="text-xs text-zinc-400">
                  {showLearners && `${learners.toLocaleString()} learners · `}
                  {config ? `${config.examSize} questions · ${config.examDurationMinutes} min` : "Loading…"}
                </p>
              </div>
            </Link>
          );
        })}

        {/* Browse all card */}
        <Link
          href="/certifications"
          className="group flex items-center gap-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/20 dark:hover:border-indigo-700"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg dark:bg-indigo-900/40">
            🎓
          </span>
          <div>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              Browse all
            </p>
            <p className="text-xs text-indigo-400 dark:text-indigo-500">View all exams →</p>
          </div>
        </Link>
      </div>

    </section>
  );
}
