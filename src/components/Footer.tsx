"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span>© {new Date().getFullYear()} uByte</span>
        <Link href="/privacy" className="transition-colors hover:text-indigo-600">Privacy</Link>
        <Link href="/terms" className="transition-colors hover:text-indigo-600">Terms</Link>
        <Link href="/leaderboard" className="transition-colors hover:text-indigo-600">Leaderboard</Link>
        <a href="https://go.dev" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-indigo-600">go.dev</a>
      </div>
    </footer>
  );
}
