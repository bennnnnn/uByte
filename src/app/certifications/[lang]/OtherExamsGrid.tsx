import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { DEFAULT_EXAM_CONFIG } from "@/lib/db";
import type { ExamLangPublicStats } from "@/lib/db/exam-attempts";
import ExamCard from "../ExamCard";
import type { ExamCardStats } from "../ExamCard";

interface Props {
  currentLang: string;
  langSlugs: string[];
  examConfigByLang: Record<string, { examSize: number; examDurationMinutes: number; passPercent: number }>;
  publicStatsByLang: Record<string, ExamLangPublicStats>;
  statsByLang?: Record<string, ExamCardStats>;
  isLoggedIn?: boolean;
}

export default function OtherExamsGrid({
  currentLang,
  langSlugs,
  examConfigByLang,
  publicStatsByLang,
  statsByLang = {},
  isLoggedIn = false,
}: Props) {
  const others = langSlugs.filter((slug) => slug !== currentLang);
  if (others.length === 0) return null;

  return (
    <section aria-labelledby="other-exams-heading" className="mt-16">
      <div className="mb-6 flex items-end justify-between">
        <Eyebrow id="other-exams-heading">
          Other certifications
        </Eyebrow>
        <Link
          href="/certifications"
          className="text-sm font-medium text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {others.map((slug) => (
          <ExamCard
            key={slug}
            slug={slug}
            examConfig={examConfigByLang[slug] ?? DEFAULT_EXAM_CONFIG}
            stats={statsByLang[slug]}
            publicStats={publicStatsByLang[slug]}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </section>
  );
}
