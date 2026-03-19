import Link from "next/link";
import { getPracticeProblemBySlug } from "@/lib/practice/problems";
import { DIFFICULTY_BADGE } from "@/lib/practice/types";
import type { PopularPracticeProblem } from "@/lib/db/home-popular";
import SectionHeading from "./SectionHeading";

interface Props {
  problems: PopularPracticeProblem[];
}

const CATEGORY_LABEL: Record<string, string> = {
  "array":               "Array",
  "string":              "String",
  "dynamic-programming": "Dynamic Programming",
  "stack":               "Stack",
  "two-pointers":        "Two Pointers",
  "sliding-window":      "Sliding Window",
  "sorting":             "Sorting",
  "hash-map":            "Hash Map",
  "binary-search":       "Binary Search",
  "greedy":              "Greedy",
  "math":                "Math",
  "graph":               "Graph",
  "heap":                "Heap",
  "tree":                "Tree",
  "backtracking":        "Backtracking",
  "design":              "Design",
};

function DifficultyDot({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy:   "bg-emerald-500",
    medium: "bg-amber-500",
    hard:   "bg-red-500",
  };
  return <span className={`h-2 w-2 rounded-full ${colors[difficulty] ?? "bg-zinc-400"}`} />;
}

export default function PopularInterviewPrepSection({ problems }: Props) {
  if (problems.length === 0) return null;

  return (
    <section aria-labelledby="popular-prep-heading">
      <div className="mb-6 flex items-center justify-between">
        <SectionHeading
          id="popular-prep-heading"
          eyebrow="Interview Prep"
          title="The problems companies actually ask"
          subtitle="114+ real interview problems. Solve in any language, run against hidden test cases, get AI code review — free."
          className="mb-0 text-left"
        />
        <Link
          href="/practice"
          aria-label="Browse all practice problems"
          className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse all →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((p) => {
          const meta = getPracticeProblemBySlug(p.slug);
          const difficulty = meta?.difficulty ?? "easy";
          const badgeCls = DIFFICULTY_BADGE[difficulty];
          const category = meta?.category ? (CATEGORY_LABEL[meta.category] ?? meta.category) : null;

          return (
            <Link
              key={p.slug}
              href={`/practice/go/${p.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#F7F8FF] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80"
            >
              {/* Top: difficulty dot + badge + category */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold capitalize text-zinc-600 dark:text-zinc-400">
                  <DifficultyDot difficulty={difficulty} />
                  {difficulty}
                </span>
                {category && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                    {category}
                  </span>
                )}
                {p.viewCount > 0 && (
                  <span className="ml-auto text-[10px] text-zinc-500 dark:text-zinc-400">
                    {p.viewCount.toLocaleString()} attempts
                  </span>
                )}
              </div>

              {/* Title */}
              <p className="text-sm font-bold text-zinc-800 group-hover:text-indigo-600 dark:text-zinc-200 dark:group-hover:text-indigo-400">
                {p.title}
              </p>

              {/* Spacer keeps card height consistent */}
              <div className="flex-1" />

              {/* Footer: language support + CTA */}
              <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  Go · Python · JS · Java · C++ · Rust · C#
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-[gap] group-hover:gap-1.5 dark:text-indigo-400">
                  Solve
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
