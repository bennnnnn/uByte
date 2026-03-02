import Link from "next/link";
import type { PracticeProblem, Difficulty } from "@/lib/practice/types";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export interface ProblemCardProps {
  problem: PracticeProblem;
  lang?: string;
}

export default function ProblemCard({ problem, lang = "go" }: ProblemCardProps) {
  return (
    <Link
      href={`/practice/${lang}/${problem.slug}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <div className="mb-2 flex items-center gap-3">
        <h3 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {problem.title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}
        >
          {problem.difficulty}
        </span>
      </div>
      <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {problem.description}
      </p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Solve →
      </span>
    </Link>
  );
}
