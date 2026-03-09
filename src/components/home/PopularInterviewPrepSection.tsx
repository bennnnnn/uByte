import Link from "next/link";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { DIFFICULTY_BADGE } from "@/lib/practice/types";
import type { PopularPracticeProblem } from "@/lib/db/home-popular";
import SectionHeading from "./SectionHeading";

interface Props {
  problems: PopularPracticeProblem[];
}

export default function PopularInterviewPrepSection({ problems }: Props) {
  if (problems.length === 0) return null;

  return (
    <section aria-labelledby="popular-prep-heading">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeading
          id="popular-prep-heading"
          title="Popular interview prep"
          subtitle="Problems most attempted by other developers."
          className="mb-0 text-left"
        />
        <Link
          href="/practice"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p) => {
          const meta = getPracticeProblemBySlug(p.slug);
          const difficulty = meta?.difficulty ?? "easy";
          const badgeCls = DIFFICULTY_BADGE[difficulty];

          return (
            <Link
              key={p.slug}
              href={`/practice/go/${p.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-surface-card p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-700 dark:hover:border-indigo-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-lg dark:bg-zinc-800">
                🎯
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-800 group-hover:text-indigo-600 dark:text-zinc-200 dark:group-hover:text-indigo-400">
                  {p.title}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${badgeCls}`}>
                    {difficulty}
                  </span>
                  {p.viewCount > 0 && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {p.viewCount.toLocaleString()} views
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
