import { Suspense } from "react";
import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import HeaderNavLinks from "@/components/layout/HeaderNavLinks";
import NavSearch from "@/components/layout/NavSearch";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center border-b border-zinc-100 bg-white/95 backdrop-blur-md md:flex dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="flex h-full w-full items-center gap-4 px-5">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-zinc-900 dark:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white shadow-sm">
            U
          </span>
          <span className="text-base font-bold tracking-tight">uByte</span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />

        {/* Nav links */}
        <HeaderNavLinks side="left" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <NavSearch />

        {/* Auth */}
        <Suspense fallback={<div className="h-8 w-44 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />}>
          <AuthButtons />
        </Suspense>

      </div>
    </header>
  );
}
