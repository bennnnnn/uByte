import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interview Practice",
  description: "Practice coding problems to ace your interview. Solve in Go, Python, or C++.",
};

export default function PracticePage() {
  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-14">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Interview practice
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          Coding problems like Two Sum, Three Sum, and more. Solve in Go, Python, or C++ and run your code in the browser. We&apos;re building this section — check back soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
