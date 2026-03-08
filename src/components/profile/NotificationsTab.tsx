"use client";

import { Card } from "@/components/ui";
import type { Notification } from "./types";

const TYPE_ICONS: Record<string, string> = {
  plan: "⭐",
  badge: "🏆",
  streak: "🔥",
  welcome: "👋",
  chat: "💬",
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

export default function NotificationsTab({ notifications, onMarkRead }: Props) {
  const unreadCount = notifications.filter((n) => !n.read).length;

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

      {notifications.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-3xl">🔔</p>
          <p className="mt-3 text-sm font-medium text-zinc-500">No notifications yet</p>
          <p className="mt-1 text-xs text-zinc-400">We&apos;ll let you know when something happens.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex gap-3 rounded-xl border px-4 py-3.5 ${
                !n.read
                  ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30"
                  : "border-zinc-200 bg-surface-card dark:border-zinc-800"
              }`}
            >
              <span className="mt-0.5 shrink-0 text-xl">{TYPE_ICONS[n.type] ?? "🔔"}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{n.title}</p>
                {n.message && (
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{n.message}</p>
                )}
              </div>
              <span className="shrink-0 text-xs text-zinc-400">{timeAgo(n.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
