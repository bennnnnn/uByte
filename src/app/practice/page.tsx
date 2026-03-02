import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import ProblemCard from "@/components/practice/ProblemCard";

export const metadata: Metadata = {
  title: "Interview Practice",
  description: "Practice coding problems to ace your interview. Solve in Go, Python, or C++.",
};

export default function PracticePage() {
  const problems = getAllPracticeProblems();

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Interview practice
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Solve problems in Go, Python, or C++. Run your code in the browser.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            ← Home
          </Link>
        </div>

        <section aria-labelledby="problems-heading">
          <h2 id="problems-heading" className="sr-only">
            Problems
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <li key={problem.slug}>
                <ProblemCard problem={problem} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
