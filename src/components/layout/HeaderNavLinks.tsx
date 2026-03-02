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
    </nav>
  );
}
