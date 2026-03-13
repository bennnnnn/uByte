"use client";

/**
 * MessagesTab — view and manage contact form submissions.
 *
 * Fetches messages from /api/admin/messages on mount.
 * Supports marking individual / all messages as read and deleting.
 */

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { SectionCard, EmptyRow } from "../components";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

function formatDate(s: string): string {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetch("/api/admin/messages");
      const data = await res.json() as { messages: ContactMessage[] };
      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const patch = async (body: object) => {
    setBusy(true);
    try {
      await apiFetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-4">
      <SectionCard
        title={`Contact messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        description="Messages submitted through the /contact page."
      >
        {/* Actions */}
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            disabled={busy || unreadCount === 0}
            onClick={() => void patch({ action: "mark_all_read" })}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Mark all read
          </button>
        </div>

        {loading ? (
          <p className="py-6 text-center text-sm text-zinc-400">Loading…</p>
        ) : (
          <div className="overflow-auto -mx-5 -mb-5">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="sticky top-0 bg-surface-card">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">From</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Subject</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Date</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {messages.map((msg) => (
                  <>
                    <tr
                      key={msg.id}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${!msg.read ? "font-semibold" : ""}`}
                      onClick={() => {
                        setExpanded((e) => (e === msg.id ? null : msg.id));
                        if (!msg.read) void patch({ action: "mark_read", id: msg.id });
                      }}
                    >
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-2">
                          {!msg.read && <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-500" aria-label="Unread" />}
                          <div className="min-w-0">
                            <p className="truncate text-zinc-900 dark:text-zinc-100">{msg.name}</p>
                            <p className="truncate text-xs font-normal text-zinc-500">{msg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{msg.subject}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatDate(msg.created_at)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void patch({ action: "delete", id: msg.id }); }}
                          disabled={busy}
                          className="rounded px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40 dark:hover:bg-red-950/40"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>

                    {/* Expanded message body */}
                    {expanded === msg.id && (
                      <tr key={`${msg.id}-body`}>
                        <td colSpan={4} className="bg-zinc-50 px-5 pb-4 pt-2 dark:bg-zinc-800/40">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{msg.message}</p>
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Reply via email →
                          </a>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {messages.length === 0 && <EmptyRow cols={4} text="No messages yet." />}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
