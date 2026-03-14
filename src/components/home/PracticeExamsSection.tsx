import Link from "next/link";
import { getAllLanguageSlugs } from "@/lib/languages/registry";
import { DEFAULT_EXAM_CONFIG } from "@/lib/db";
import ExamCard from "@/app/certifications/ExamCard";
import type { ExamCardStats, ExamCardPublicStats } from "@/app/certifications/ExamCard";
import SectionHeading from "./SectionHeading";

interface Props {
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
  publicStatsByLang?: Record<string, ExamCardPublicStats>;
  statsByLang?: Record<string, ExamCardStats>;
  isLoggedIn?: boolean;
}

export default function PracticeExamsSection({
  examConfigByLang,
  publicStatsByLang = {},
  statsByLang = {},
  isLoggedIn = false,
}: Props) {
  const slugs = getAllLanguageSlugs();

  return (
    <section aria-labelledby="certifications-heading">
      <SectionHeading
        id="certifications-heading"
        eyebrow="Certifications"
        title="You've done the work. Now prove it."
        subtitle="Take a timed exam and earn a certificate that shows you actually know your stuff — not just that you watched a video."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug) => (
          <ExamCard
            key={slug}
            slug={slug}
            examConfig={examConfigByLang[slug] ?? DEFAULT_EXAM_CONFIG}
            publicStats={publicStatsByLang[slug]}
            stats={statsByLang[slug]}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/certifications"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
        >
          View all certifications
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
