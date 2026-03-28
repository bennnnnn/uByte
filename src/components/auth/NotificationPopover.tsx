"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

interface Notification {
  id: number;
  type: string;
  title: string;
  message?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  plan:    "⭐",
  badge:   "🏆",
  streak:  "🔥",
  welcome: "👋",
  chat:    "💬",
  reply:   "💬",
  mention: "🔔",
  info:    "ℹ️",
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

interface Props {
  initialUnreadCount?: number;
  onCountChange?: (count: number) => void;
}

export default function NotificationPopover({ initialUnreadCount = 0, onCountChange }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const ref = useRef<HTMLDivElement>(null);

  // Sync external count prop
  useEffect(() => { setUnreadCount(initialUnreadCount); }, [initialUnreadCount]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await res.json() as { notifications?: Notification[]; unreadCount?: number };
      setItems(data.notifications ?? []);
      const count = data.unreadCount ?? (data.notifications?.filter((n) => !n.read).length ?? 0);
      setUnreadCount(count);
      onCountChange?.(count);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!fetched) void fetchNotifications();
  };

  const markAllRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    onCountChange?.(0);
  };

  const deleteItem = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setItems((prev) => {
      const next = prev.filter((n) => n.id !== id);
      const newCount = next.filter((n) => !n.read).length;
      setUnreadCount(newCount);
      onCountChange?.(newCount);
      return next;
    });
    await apiFetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
  };

  // Show max 6 in the popover; "View all" goes to the full page
  const visible = items.slice(0, 6);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-x-3 top-14 z-[200] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[360px]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notifications</p>
              {unreadCount > 0 && (
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => void markAllRead()}
                className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading && !fetched ? (
              /* Skeleton */
              <div className="space-y-px p-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex animate-pulse items-start gap-3 rounded-xl px-3 py-3">
                    <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
                      <div className="h-2.5 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                    <div className="h-2.5 w-8 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-2xl">🔔</p>
                <p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">No notifications yet</p>
                <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">We&apos;ll let you know when something happens.</p>
              </div>
            ) : (
              <ul className="p-2">
                {visible.map((n) => {
                  const content = (
                    <>
                      <span className="mt-0.5 shrink-0 text-lg leading-none">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium leading-snug ${
                          n.read ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-zinc-100"
                        }`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{n.message}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-zinc-400">{timeAgo(n.created_at)}</p>
                      </div>
                    </>
                  );

                  return (
                    <li
                      key={n.id}
                      className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        !n.read
                          ? "bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => setOpen(false)}
                          className="flex w-full items-start gap-3"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex w-full items-start gap-3">{content}</div>
                      )}
                      {/* Delete on hover */}
                      <button
                        onClick={(e) => void deleteItem(n.id, e)}
                        aria-label="Dismiss"
                        className="absolute right-2 top-2.5 hidden h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 group-hover:flex dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
            >
              View all notifications
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
