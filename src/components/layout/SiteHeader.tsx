import { Suspense } from "react";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import HeaderNavLinks from "@/components/layout/HeaderNavLinks";
import NavSearch from "@/components/layout/NavSearch";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden shrink-0 items-center justify-between border-b border-zinc-100 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md md:flex dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 text-zinc-900 dark:text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">U</span>
          <span className="text-lg font-bold">uByte</span>
        </Link>
        <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />
        <HeaderNavLinks side="left" />
      </div>

      {/* Right: Search + Auth */}
      <div className="flex items-center gap-4">
        {/* Live search — wider, more breathing room */}
        <NavSearch />

        <Suspense fallback={<div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />}>
          <AuthButtons />
        </Suspense>
      </div>
    </header>
  );
}
