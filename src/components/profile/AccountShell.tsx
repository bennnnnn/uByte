"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── SVG icon components ─────────────────────────────────────────────── */
function BellIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
function CogIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

/* ── Nav items ───────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: "/notifications", label: "Notifications", Icon: BellIcon },
  { href: "/settings",      label: "Settings",      Icon: CogIcon },
] as const;

/* ── Shared nav link component ───────────────────────────────────────── */
function NavLink({ href, label, Icon, active }: { href: string; label: string; Icon: () => React.JSX.Element; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      <span className={active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}>
        <Icon />
      </span>
      {label}
    </Link>
  );
}

interface Props {
  children: React.ReactNode;
}

export default function AccountShell({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">

      {/* ── Mobile: horizontal scrollable pill nav ──────────────────── */}
      <div className="mb-6 sm:hidden">
        <div
          className="flex gap-1.5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <ChevronLeftIcon />
            Dashboard
          </Link>
          <span className="mx-1 self-center border-l border-zinc-200 py-2 dark:border-zinc-700" />
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                pathname === href
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Desktop: sidebar + content ──────────────────────────────── */}
      <div className="flex gap-8">

        {/* Sidebar */}
        <aside className="hidden w-48 shrink-0 sm:block">
          <nav className="sticky top-6">

            {/* Back to dashboard */}
            <Link
              href="/dashboard"
              className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <span className="text-zinc-400 dark:text-zinc-500"><ChevronLeftIcon /></span>
              Dashboard
            </Link>

            <div className="mb-1.5 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Account links */}
            <p className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Account
            </p>
            <ul className="space-y-0.5">
              {NAV_ITEMS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <NavLink href={href} label={label} Icon={Icon} active={pathname === href} />
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Page content */}
        <div className="min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
