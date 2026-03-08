import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <span className="text-6xl">🐹</span>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Page Not Found
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-800"
        >
          Home
        </Link>
        <Link
          href="/tutorial/go"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Tutorials
        </Link>
        <Link
          href="/practice"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Interview Prep
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
