"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import UserMenuDropdown from "./auth/UserMenuDropdown";
import { useIsMobile } from "@/hooks/useIsMobile";
import { buildAuthPageHref } from "@/lib/auth-redirect";
import { hasPaidAccess } from "@/lib/plans";

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export default function AuthButtons() {
  const { user, profile, loading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentParams = new URLSearchParams(searchParams.toString());
  currentParams.delete("signup");
  const currentPath = `${pathname}${currentParams.toString() ? `?${currentParams.toString()}` : ""}`;
  const loginHref = buildAuthPageHref("login", currentPath);
  const signupHref = buildAuthPageHref("signup", currentPath);
  const isPro = hasPaidAccess(profile?.plan);

  useEffect(() => {
    if (loading || user) return;
    if (searchParams.get("signup") !== "1") return;
    router.replace(signupHref);
  }, [loading, router, searchParams, signupHref, user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/notifications", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.unreadCount === "number") setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (loading) {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        {!isPro && (
          <Link href="/pricing" className={`${linkBase} hidden md:inline-flex`}>
            Pricing
          </Link>
        )}
        <NotificationBell unreadCount={unreadCount} />
        <UserMenuDropdown />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Account"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-2">
              <Link
                href={loginHref}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log in
              </Link>
              <Link
                href={signupHref}
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/pricing" className={linkBase}>
        Pricing
      </Link>
      <Link
        href={loginHref}
        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        Log in
      </Link>
      <Link
        href={signupHref}
        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
      >
        Sign up
      </Link>
    </div>
  );
}

function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/profile?tab=notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
