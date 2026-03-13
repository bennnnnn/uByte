"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import type { Notification } from "./types";

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
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface Props {
  notifications: Notification[];
  onMarkRead: () => void;
}

export default function NotificationsTab({ notifications: initial, onMarkRead }: Props) {
  const [items, setItems] = useState<Notification[]>(initial);
  const unreadCount = items.filter((n) => !n.read).length;

  async function handleDelete(id: number) {
    setItems((prev) => prev.filter((n) => n.id !== id));
    await apiFetch(`/api/notifications/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkRead}
            className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-3xl">🔔</p>
          <p className="mt-3 text-sm font-medium text-zinc-500">No notifications yet</p>
          <p className="mt-1 text-xs text-zinc-400">We&apos;ll let you know when something happens.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xl">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
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
                className={`group relative rounded-xl border px-4 py-3.5 ${
                  !n.read
                    ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30"
                    : "border-zinc-200 bg-surface-card dark:border-zinc-800"
                }`}
              >
                {n.link ? (
                  <Link href={n.link} className="block hover:opacity-80 transition-opacity">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}

                {/* Delete button — appears on hover */}
                <button
                  onClick={() => handleDelete(n.id)}
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
  );
}
