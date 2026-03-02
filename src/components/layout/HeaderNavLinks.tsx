import Link from "next/link";

/**
 * Reusable nav links for the header (Pricing, Search).
 * Keeps navbar consistent and easy to extend.
 */
export default function HeaderNavLinks() {
  return (
    <nav className="flex items-center gap-1" aria-label="Main">
      <Link
        href="/pricing"
        className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        Pricing
      </Link>
      <Link
        href="/search"
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="Search tutorials and lessons"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </Link>
    </nav>
  );
}
