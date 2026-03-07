import Link from "next/link";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { getLangIcon } from "@/lib/languages/icons";
import LangCard from "./LangCard";

interface Props {
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
}

export default function PracticeExamsSection({ examConfigByLang }: Props) {
  return (
    <section aria-labelledby="practice-exams-heading" className="space-y-5">
      {/* Main CTA card */}
      <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-amber-50/40 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-amber-950/20">
        <div className="p-6 sm:p-8">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 id="practice-exams-heading" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Programming Certification Practice Exams</h2>
            <span className="rounded-full border border-amber-300 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-700 dark:bg-zinc-900/80 dark:text-amber-400">
              Pro
            </span>
          </div>
          <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
            Timed multiple-choice exams by language. Questions, duration, and pass threshold set per language. Pass to earn a certificate.
          </p>
          <Link href="/practice-exams" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition-all hover:bg-amber-500 hover:shadow-amber-500/35 hover:-translate-y-0.5">
            Explore certification exams
          </Link>
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
              href={`/practice-exams/${slug}`}
              icon={getLangIcon(slug)}
              name={config.name}
              badge={`${ec.examSize} per exam`}
              description={`${ec.examDurationMinutes} min · ${ec.passPercent}% to pass · Certificate`}
              cta="Take exam"
              color="amber"
            />
          );
        })}
      </div>
    </section>
  );
}
