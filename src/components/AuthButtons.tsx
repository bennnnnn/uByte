"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import UserMenuDropdown from "./auth/UserMenuDropdown";
import NotificationPopover from "./auth/NotificationPopover";
import { buildAuthPageHref } from "@/lib/auth-redirect";

const linkBase =
  "rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export default function AuthButtons() {
  const { user, loading, notificationUnreadCount, setNotificationUnreadCount } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const loginHref = buildAuthPageHref("login", pathname);
  const signupHref = buildAuthPageHref("signup", pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (loading || user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("signup") !== "1") return;
    params.delete("signup");
    const nextPath = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(buildAuthPageHref("signup", nextPath));
  }, [loading, pathname, router, user]);

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
          initialUnreadCount={notificationUnreadCount}
          onCountChange={setNotificationUnreadCount}
        />
        <UserMenuDropdown />
      </div>
    );
  }

  return (
    <>
      <div className="relative md:hidden" ref={menuRef}>
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

      <div className="hidden items-center gap-2 md:flex">
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
    </>
  );
}
