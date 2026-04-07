"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./AuthProvider";
import UserMenuDropdown from "./auth/UserMenuDropdown";
import NotificationPopover from "./auth/NotificationPopover";
import { useIsMobile } from "@/hooks/useIsMobile";
import { buildAuthPageHref } from "@/lib/auth-redirect";

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export default function AuthButtons() {
  const { user, loading } = useAuth();
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

  useEffect(() => {
    if (loading || user) return;
    if (searchParams.get("signup") !== "1") return;
    router.replace(signupHref);
  }, [loading, router, searchParams, signupHref, user]);

  useEffect(() => {
    if (!user) return;

    const fetchCount = () => {
      fetch("/api/notifications", { credentials: "same-origin" })
        .then((r) => r.json())
        .then((data: unknown) => {
          if (data && typeof data === "object" && "unreadCount" in data && typeof (data as { unreadCount: unknown }).unreadCount === "number") {
            setUnreadCount((data as { unreadCount: number }).unreadCount);
          }
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
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
    // w-9 matches the mobile icon; md:w-56 approximates "Pricing · Log in · Sign up"
    // on desktop to prevent a layout shift when auth state resolves.
    return <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 md:w-56" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        <NotificationPopover
          initialUnreadCount={unreadCount}
          onCountChange={setUnreadCount}
        />
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
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        Sign up
      </Link>
    </div>
  );
}

