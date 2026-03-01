"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak_days: number;
  created_at: string;
  last_active_at: string | null;
  is_admin: number;
  banned: boolean;
  completed_count: number;
  bookmark_count: number;
}

interface TutorialAnalytics {
  slug: string;
  completed_count: number;
  thumbs_up: number;
  thumbs_down: number;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function slugToTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type Tab = "users" | "analytics";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<TutorialAnalytics[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<{ id: number; action: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }

    Promise.all([
      fetch("/api/admin/users", { credentials: "same-origin" }).then(async (r) => {
        if (r.status === 403) { router.push("/"); return null; }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        return data;
      }),
      fetch("/api/admin/users?view=analytics", { credentials: "same-origin" }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) return { analytics: [] };
        return data;
      }),
    ])
      .then(([userData, analyticsData]) => {
        if (userData) setUsers(userData.users ?? []);
        setAnalytics(analyticsData.analytics ?? []);
      })
      .catch((err) => setError(String(err.message ?? err)))
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  async function doAction(userId: number, action: string, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setPending({ id: userId, action });
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Action failed");
        return;
      }

      if (action === "delete_user") {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else if (action === "reset_progress") {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, completed_count: 0, xp: 0, streak_days: 0 } : u));
      } else if (action === "ban_user") {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, banned: true } : u));
      } else if (action === "unban_user") {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, banned: false } : u));
      } else if (action === "set_admin") {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_admin: 1 } : u));
      } else if (action === "remove_admin") {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_admin: 0 } : u));
      }
    } catch {
      alert("Action failed.");
    } finally {
      setPending(null);
    }
  }

  const filtered = query.trim()
    ? users.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  const totalCompletions = analytics.reduce((s, t) => s + t.completed_count, 0);

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-6 py-12">
        <div className="mb-6 h-8 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Admin</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{users.length} total users</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Users",     value: users.length },
          { label: "Total XP",        value: users.reduce((s, u) => s + u.xp, 0).toLocaleString() },
          { label: "Completions",     value: totalCompletions },
          { label: "Tutorials Rated", value: analytics.filter((t) => t.thumbs_up + t.thumbs_down > 0).length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
        {(["users", "analytics"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {t === "users" ? "Users" : "Tutorial Analytics"}
          </button>
        ))}
      </div>

      {/* ── Users tab ── */}
      {tab === "users" && (
        <>
          <div className="relative mb-4">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name or email…"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
          </div>

          <div className="overflow-x-auto overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">User</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">XP</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Done</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Streak</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Last Active</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((u) => {
                  const isMe = u.id === user?.id;
                  const busy = (action: string) => pending?.id === u.id && pending.action === action;
                  const anyBusy = pending?.id === u.id;
                  return (
                    <tr key={u.id} className={`bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 ${u.banned ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 flex-wrap">
                          {u.name}
                          {u.is_admin === 1 && (
                            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">admin</span>
                          )}
                          {u.banned && (
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">banned</span>
                          )}
                          {isMe && (
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">you</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300">{u.xp}</td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.completed_count}</td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.streak_days}d</td>
                      <td className="px-4 py-3 text-right text-zinc-500">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3 text-right text-zinc-500">{formatDate(u.last_active_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Ban / Unban */}
                          {!isMe && (
                            u.banned ? (
                              <button
                                onClick={() => doAction(u.id, "unban_user")}
                                disabled={anyBusy}
                                className="rounded-md border border-green-300 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                              >
                                {busy("unban_user") ? "…" : "Unban"}
                              </button>
                            ) : (
                              <button
                                onClick={() => doAction(u.id, "ban_user", `Ban ${u.name}? They won't be able to log in.`)}
                                disabled={anyBusy}
                                className="rounded-md border border-orange-300 px-2.5 py-1 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
                              >
                                {busy("ban_user") ? "…" : "Ban"}
                              </button>
                            )
                          )}
                          {/* Admin toggle */}
                          {!isMe && (
                            u.is_admin === 1 ? (
                              <button
                                onClick={() => doAction(u.id, "remove_admin", `Remove admin from ${u.name}?`)}
                                disabled={anyBusy}
                                className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                              >
                                {busy("remove_admin") ? "…" : "Remove Admin"}
                              </button>
                            ) : (
                              <button
                                onClick={() => doAction(u.id, "set_admin", `Make ${u.name} an admin?`)}
                                disabled={anyBusy}
                                className="rounded-md border border-indigo-300 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
                              >
                                {busy("set_admin") ? "…" : "Make Admin"}
                              </button>
                            )
                          )}
                          {/* Reset progress */}
                          <button
                            onClick={() => doAction(u.id, "reset_progress", `Reset all progress for ${u.name}? This cannot be undone.`)}
                            disabled={anyBusy}
                            className="rounded-md border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950"
                          >
                            {busy("reset_progress") ? "…" : "Reset"}
                          </button>
                          {/* Delete */}
                          {!isMe && (
                            <button
                              onClick={() => doAction(u.id, "delete_user", `Permanently delete ${u.name}? All their data will be lost.`)}
                              disabled={anyBusy}
                              className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              {busy("delete_user") ? "…" : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-600">
            Admin access can also be set directly in the database: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">is_admin = 1</code>
          </p>
        </>
      )}

      {/* ── Analytics tab ── */}
      {tab === "analytics" && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Tutorial</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Completions</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">👍</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">👎</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {analytics.map((t) => {
                const total = t.thumbs_up + t.thumbs_down;
                const score = total > 0 ? Math.round((t.thumbs_up / total) * 100) : null;
                return (
                  <tr key={t.slug} className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(t.slug)}</div>
                      <div className="text-xs text-zinc-400">{t.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300">{t.completed_count}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">{t.thumbs_up}</td>
                    <td className="px-4 py-3 text-right text-red-500 dark:text-red-400">{t.thumbs_down}</td>
                    <td className="px-4 py-3 text-right">
                      {score !== null ? (
                        <span className={`font-medium ${score >= 75 ? "text-emerald-600 dark:text-emerald-400" : score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                          {score}%
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {analytics.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-400">No tutorial data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
