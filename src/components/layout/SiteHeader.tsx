import Link from "next/link";
import AuthButtons from "@/components/AuthButtons";
import HeaderNavLinks from "@/components/layout/HeaderNavLinks";
import NavSearch from "@/components/layout/NavSearch";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden h-12 shrink-0 items-center border-b border-zinc-100 bg-white/95 backdrop-blur-md md:flex dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="flex h-full w-full items-center gap-3 px-4">

        {/* Logo + tagline */}
        <Link
          href="/"
          aria-label="uByte — home"
          className="flex shrink-0 items-center gap-2 text-zinc-900 dark:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white shadow-sm">
            U
          </span>
          <span className="text-sm font-bold tracking-tight">uByte</span>
          <span className="hidden text-[11px] font-medium text-zinc-400 lg:inline-block">
            Interactive Tutorials
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />

        {/* Nav links */}
        <HeaderNavLinks side="left" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <NavSearch />

        {/* Right-side account shortcut */}
        <HeaderNavLinks side="right" />

        {/* Auth */}
        <AuthButtons />

      </div>
    </header>
  );
}
