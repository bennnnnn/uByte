import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — uByte",
  description: "The page you are looking for does not exist.",
  // Tell search engines not to index or follow links on 404 pages.
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Large 404 number — no emoji, looks professional and instantly recognisable */}
      <p className="mb-2 text-8xl font-black tracking-tight text-zinc-100 dark:text-zinc-800 select-none">
        404
      </p>

      <h1 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Page not found
      </h1>
      <p className="mb-8 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Try one of the links below, or head back home.
      </p>

      {/* Primary CTA */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
        </svg>
        Back to home
      </Link>

      {/* Secondary links — give users somewhere useful to go */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/tutorial/go"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
          Tutorials
        </Link>
        <Link href="/practice"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
          Interview prep
        </Link>
        <Link href="/certifications"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
          Certifications
        </Link>
        <Link href="/blog"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400">
          Blog
        </Link>
      </div>
    </div>
  );
}
