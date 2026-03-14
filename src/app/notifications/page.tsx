"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type { Notification } from "@/components/profile/types";

/* ── Type icons (mirrors NotificationsTab) ─────────────────────────────── */
const TYPE_ICONS: Record<string, string> = {
  plan: "⭐",
  badge: "🏆",
  streak: "🔥",
  welcome: "👋",
  chat: "💬",
  reply: "💬",
  mention: "🔔",
  info: "ℹ️",
};

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ── Skeleton ──────────────────────────────────────────────────────────── */
function NotificationsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mb-6 h-8 w-44 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-[68px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}

/* ── Page wrapper (needs Suspense for useSearchParams inside children) ─── */
export default function NotificationsPageWrapper() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsPage />
    </Suspense>
  );
}

/* ── Actual page ────────────────────────────────────────────────────────── */
function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "same-origin" });
      if (res.status === 401) { router.push("/"); return; }
      if (res.ok) {
        const data = await res.json() as { notifications?: Notification[] };
        setItems(data.notifications ?? []);
      }
    } finally {
      setFetching(false);
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) void fetchNotifications();
  }, [user, loading, router, fetchNotifications]);

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteItem = async (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await apiFetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
  };

  if (loading || fetching) return <NotificationsSkeleton />;

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllRead()}
              className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500 hover:underline dark:text-indigo-400"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-3xl">🔔</p>
            <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">No notifications yet</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">We&apos;ll let you know when something happens.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => {
              const inner = (
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-xl leading-none">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${n.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-zinc-100"}`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{n.message}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{timeAgo(n.created_at)}</span>
                </div>
              );

              return (
                <li
                  key={n.id}
                  className={`group relative rounded-xl border px-4 py-3.5 transition-colors ${
                    !n.read
                      ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/30"
                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40"
                  }`}
                >
                  {n.link ? (
                    <Link href={n.link} className="block transition-opacity hover:opacity-80">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}

                  {/* Delete button — appears on hover */}
                  <button
                    onClick={() => void deleteItem(n.id)}
                    aria-label="Delete notification"
                    className="absolute right-3 top-3 hidden h-6 w-6 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700 group-hover:flex dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
