import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import LangCard from "./LangCard";

interface Props {
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
}

const FEATURES = [
  "Timed, proctored assessment",
  "Instant PDF certificate",
  "One-click LinkedIn sharing",
  "Verifiable by employers",
];

export default function PracticeExamsSection({ examConfigByLang }: Props) {
  return (
    <section aria-labelledby="certifications-heading" className="space-y-6">
      {/* Hero card — gradient border + dark interior */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-px shadow-lg shadow-amber-500/20">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-zinc-900 px-6 py-8 sm:px-10 sm:py-10 dark:bg-zinc-950">
          {/* Glow */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-[80px]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-500/10 blur-[80px]" />

          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: copy */}
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Verifiable Certifications · Pro
              </div>

              <h2 id="certifications-heading" className="text-xl font-black text-white sm:text-2xl">
                Prove what you know.
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-zinc-400">
                Pass a timed exam and earn a certificate you can share on LinkedIn, attach to job applications, or link from your portfolio. Recruiters notice.
              </p>

              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: CTA */}
            <div className="shrink-0">
              <Link
                href="/certifications"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-500/45"
              >
                View certifications
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Per-language exam cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getAllLanguageSlugs().map((slug) => {
          const config = LANGUAGES[slug as keyof typeof LANGUAGES];
          if (!config) return null;
          const ec = examConfigByLang[slug] ?? { examSize: 40, examDurationMinutes: 45, passPercent: 70 };
          return (
            <LangCard
              key={slug}
              href={`/certifications/${slug}`}
              icon={getLangIcon(slug)}
              name={config.name}
              badge={`${ec.examSize} questions`}
              description={`${ec.examDurationMinutes} min · ${ec.passPercent}% to pass · Certificate included`}
              cta="Take exam"
              color="amber"
            />
          );
        })}
      </div>
    </section>
  );
}
