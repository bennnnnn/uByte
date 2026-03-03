"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type { AdminRevenueStats } from "@/lib/db";

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
  plan: string;
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

function formatCents(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

type Tab = "users" | "analytics" | "revenue" | "audit";
type RevenuePeriod = "7days" | "month" | "year";

const TAB_LABELS: Record<Tab, string> = {
  users: "Users",
  analytics: "Analytics",
  revenue: "Revenue",
  audit: "Audit log",
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  interface AuditEntry {
    id: number;
    action: string;
    admin_name: string | null;
    target_name: string | null;
    created_at: string;
  }
  interface StepStat { step_index: number; pass_count: number; fail_count: number; }
  interface SubscriptionEventRow {
    id: number;
    user_id: number | null;
    user_name: string | null;
    user_email: string | null;
    plan: string;
    amount_cents: number;
    event_type: string;
    created_at: string;
  }
  interface PracticeStat { problem_slug: string; solved_count: number; attempt_count: number; }

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<TutorialAnalytics[]>([]);
  const [practiceStats, setPracticeStats] = useState<PracticeStat[]>([]);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("7days");
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number }[]>([]);
  const [subscriptionEvents, setSubscriptionEvents] = useState<SubscriptionEventRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [stepStats, setStepStats] = useState<StepStat[]>([]);
  const [heatmapSlug, setHeatmapSlug] = useState("");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<{ id: number; action: string } | null>(null);
  const [userActionsOpen, setUserActionsOpen] = useState<number | null>(null);
  const [actionAnchorRect, setActionAnchorRect] = useState<DOMRect | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }

    Promise.all([
      fetch("/api/admin/users", { credentials: "same-origin" }).then(async (r) => {
        if (r.status === 403) { router.push("/"); return null; }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "HTTP " + r.status);
        return data;
      }),
      fetch("/api/admin/users?view=analytics", { credentials: "same-origin" }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) return { analytics: [] };
        return data;
      }),
      fetch("/api/admin/users?view=practice-stats", { credentials: "same-origin" }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) return { stats: [] };
        return data;
      }),
      fetch("/api/admin/stats?period=7days", { credentials: "same-origin" }).then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      }),
      fetch("/api/admin/audit-log", { credentials: "same-origin" }).then(async (r) => {
        if (!r.ok) return { log: [] };
        return r.json();
      }),
      fetch("/api/admin/stats?view=subscription-events", { credentials: "same-origin" }).then(async (r) => {
        if (!r.ok) return { events: [] };
        return r.json();
      }),
    ])
      .then(([userData, analyticsData, practiceData, revenueData, auditData, eventsData]) => {
        if (userData) setUsers(userData.users ?? []);
        setAnalytics(analyticsData.analytics ?? []);
        setPracticeStats(practiceData?.stats ?? []);
        if (revenueData) {
          setRevenue(revenueData);
          setRevenueSeries(revenueData.revenueByPeriod ?? revenueData.revenueByDay ?? []);
        }
        setAuditLog(auditData.log ?? []);
        setSubscriptionEvents(eventsData?.events ?? []);
      })
      .catch((err) => setError(String(err.message ?? err)))
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  useEffect(() => {
    if (tab !== "revenue" || !revenue) return;
    let cancelled = false;
    fetch("/api/admin/stats?period=" + revenuePeriod, { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!cancelled && data?.revenueByPeriod) setRevenueSeries(data.revenueByPeriod);
      });
    return () => { cancelled = true; };
  }, [tab, revenuePeriod, revenue]);

  async function doAction(userId: number, action: string, confirmMsg?: string, extra?: { plan?: string }) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setUserActionsOpen(null);
    setPending({ id: userId, action });
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
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
      } else if (action === "set_plan" && extra?.plan) {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan: extra.plan! } : u));
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
  const mrr = revenue
    ? (revenue.monthlySubscribers * 999 + revenue.yearlySubscribers * 4999) / 12
    : 0;

  function exportRevenueCSV() {
    const header = "Period,Revenue (USD)";
    const rows = revenueSeries.map((d) => d.date + "," + (d.revenue / 100).toFixed(2));
    const total = revenueSeries.reduce((s, d) => s + d.revenue, 0);
    const csv = [header, ...rows, "Total," + (total / 100).toFixed(2)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-" + revenuePeriod + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function printRevenuePDF() {
    if (!printRef.current || !revenue) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = revenueSeries.map((d) => "<tr><td>" + d.date + "</td><td class=\"num\">" + formatCents(d.revenue) + "</td></tr>").join("");
    const totalCents = revenueSeries.reduce((s, d) => s + d.revenue, 0);
    const html =
      "<!DOCTYPE html><html><head><title>Revenue Report</title>" +
      "<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#1f2937}h1{font-size:1.5rem;margin-bottom:.5rem}.meta{color:#6b7280;font-size:.875rem;margin-bottom:1.5rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:.5rem .75rem;text-align:left}th{background:#f9fafb}.num{text-align:right}.total{font-weight:700}</style></head><body>" +
      "<h1>Revenue Report</h1><p class=\"meta\">Generated " + new Date().toLocaleString() + " · Period: " + revenuePeriod + "</p>" +
      "<table><thead><tr><th>Period</th><th class=\"num\">Revenue (USD)</th></tr></thead><tbody>" + rows +
      "<tr class=\"total\"><td>Total</td><td class=\"num\">" + formatCents(totalCents) + "</td></tr></tbody></table>" +
      "<p class=\"meta\" style=\"margin-top:1.5rem\">Summary: Today " + formatCents(revenue.revenueToday) + " · Week " + formatCents(revenue.revenueThisWeek ?? 0) + " · Month " + formatCents(revenue.revenueThisMonth) + " · Pro subs " + revenue.proSubscribers + "</p></body></html>";
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  }

  if (loading || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div className="rounded-xl border border-red-200 bg-white p-6 dark:border-red-900 dark:bg-zinc-900">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button type="button" onClick={() => router.push("/")} className="mt-4 text-sm text-zinc-500 underline">Back to home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Admin</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {(["users", "analytics", "revenue", "audit"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={"flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors " +
              (tab === t ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100")}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
          <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{user?.email}</p>
          <a href="/" className="mt-1 block text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-400">Exit admin</a>
        </div>
      </aside>

      {/* Main content — scrollable */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{TAB_LABELS[tab]}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {tab === "users" && users.length + " users"}
              {tab === "analytics" && "Tutorials & practice"}
              {tab === "revenue" && "Income & subscribers"}
              {tab === "audit" && "Admin actions"}
            </p>
          </div>
          {tab === "users" && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" className="w-56 rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
              </div>
              <button type="button" onClick={async () => { const r = await fetch("/api/admin/users?export=csv", { credentials: "same-origin" }); if (!r.ok) return; const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click(); URL.revokeObjectURL(url); }} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Export CSV</button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary cards — show on all tabs */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Users", value: users.length },
              { label: "Total XP", value: users.reduce((s, u) => s + u.xp, 0).toLocaleString() },
              { label: "Completions", value: totalCompletions },
              { label: "Pro subs", value: revenue?.proSubscribers ?? "—" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* ── Users tab ── */}
          {tab === "users" && (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="max-h-[calc(100vh-18rem)] overflow-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">User</th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">XP</th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Done</th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Streak</th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Joined</th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Last active</th>
                      <th className="w-32 px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filtered.map((u) => {
                      const isMe = u.id === user?.id;
                      const busy = (action: string) => pending?.id === u.id && pending.action === action;
                      const anyBusy = pending?.id === u.id;
                      const open = userActionsOpen === u.id;
                      return (
                        <tr key={u.id} className={"bg-white hover:bg-zinc-50/80 dark:bg-zinc-950 dark:hover:bg-zinc-800/50 " + (u.banned ? "opacity-70" : "")}>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                              {u.name}
                              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">{u.plan ?? "free"}</span>
                              {u.is_admin === 1 && <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">admin</span>}
                              {u.banned && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/50 dark:text-red-300">banned</span>}
                              {isMe && <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">you</span>}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300">{u.xp}</td>
                          <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.completed_count}</td>
                          <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.streak_days}d</td>
                          <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">{formatDate(u.created_at)}</td>
                          <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">{formatDate(u.last_active_at)}</td>
                          <td className="relative px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                if (open) {
                                  setUserActionsOpen(null);
                                  setActionAnchorRect(null);
                                } else {
                                  setActionAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect());
                                  setUserActionsOpen(u.id);
                                }
                              }}
                              disabled={anyBusy}
                              className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                              {anyBusy ? "…" : "Actions ▼"}
                            </button>
                            {open && typeof document !== "undefined" && actionAnchorRect && createPortal(
                              <>
                                <div
                                  className="fixed z-50 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                                  role="menu"
                                  style={{
                                    left: Math.max(8, Math.min(actionAnchorRect.right - 192, (typeof window !== "undefined" ? window.innerWidth : 800) - 200)),
                                    top: actionAnchorRect.bottom + 4,
                                    maxHeight: "16rem",
                                    overflowY: "auto",
                                  }}
                                >
                                  {!isMe && (u.banned ? (
                                    <button type="button" onClick={() => doAction(u.id, "unban_user")} className="block w-full px-3 py-1.5 text-left text-xs text-green-700 hover:bg-zinc-100 dark:text-green-400 dark:hover:bg-zinc-800">Unban</button>
                                  ) : (
                                    <button type="button" onClick={() => doAction(u.id, "ban_user", "Ban " + u.name + "?")} className="block w-full px-3 py-1.5 text-left text-xs text-orange-600 hover:bg-zinc-100 dark:text-orange-400 dark:hover:bg-zinc-800">Ban</button>
                                  ))}
                                  {!isMe && (u.is_admin === 1 ? (
                                    <button type="button" onClick={() => doAction(u.id, "remove_admin", "Remove admin from " + u.name + "?")} className="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">Remove admin</button>
                                  ) : (
                                    <button type="button" onClick={() => doAction(u.id, "set_admin", "Make " + u.name + " admin?")} className="block w-full px-3 py-1.5 text-left text-xs text-indigo-600 hover:bg-zinc-100 dark:text-indigo-400 dark:hover:bg-zinc-800">Make admin</button>
                                  ))}
                                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                  {(["free", "pro", "yearly"] as const).map((p) => (
                                    <button key={p} type="button" onClick={() => doAction(u.id, "set_plan", "Set " + u.name + " to " + p + "?", { plan: p })} disabled={(u.plan ?? "free") === p} className="block w-full px-3 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800">Set plan: {p}</button>
                                  ))}
                                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                  <button type="button" onClick={() => doAction(u.id, "reset_progress", "Reset all progress for " + u.name + "?")} className="block w-full px-3 py-1.5 text-left text-xs text-amber-600 hover:bg-zinc-100 dark:text-amber-400 dark:hover:bg-zinc-800">Reset progress</button>
                                  {!isMe && <button type="button" onClick={() => doAction(u.id, "delete_user", "Permanently delete " + u.name + "?")} className="block w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-800">Delete user</button>}
                                </div>
                                <div className="fixed inset-0 z-40" aria-hidden onClick={() => { setUserActionsOpen(null); setActionAnchorRect(null); }} />
                              </>,
                              document.body
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Analytics tab ── */}
          {tab === "analytics" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">Tutorial completion & ratings</h2>
                <div className="max-h-80 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
                      <tr><th className="px-4 py-2 text-left font-medium text-zinc-500">Tutorial</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Completions</th><th className="px-4 py-2 text-right font-medium text-zinc-500">👍</th><th className="px-4 py-2 text-right font-medium text-zinc-500">👎</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Score</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {analytics.map((t) => {
                        const total = t.thumbs_up + t.thumbs_down;
                        const score = total > 0 ? Math.round((t.thumbs_up / total) * 100) : null;
                        return (
                          <tr key={t.slug} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                            <td className="px-4 py-2"><div className="font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(t.slug)}</div><div className="text-xs text-zinc-400">{t.slug}</div></td>
                            <td className="px-4 py-2 text-right font-mono">{t.completed_count}</td>
                            <td className="px-4 py-2 text-right text-emerald-600 dark:text-emerald-400">{t.thumbs_up}</td>
                            <td className="px-4 py-2 text-right text-red-500 dark:text-red-400">{t.thumbs_down}</td>
                            <td className="px-4 py-2 text-right">{score !== null ? <span className={score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600"}>{score}%</span> : "—"}</td>
                          </tr>
                        );
                      })}
                      {analytics.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">No data.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">Practice problems</h2>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-4 py-2 text-left font-medium text-zinc-500">Problem</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Solved</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Attempted</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Rate</th></tr></thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {practiceStats.map((p) => (
                        <tr key={p.problem_slug} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(p.problem_slug)}</td>
                          <td className="px-4 py-2 text-right font-mono">{p.solved_count}</td>
                          <td className="px-4 py-2 text-right font-mono">{p.attempt_count}</td>
                          <td className="px-4 py-2 text-right">{p.attempt_count > 0 ? Math.round((p.solved_count / p.attempt_count) * 100) + "%" : "—"}</td>
                        </tr>
                      ))}
                      {practiceStats.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-400">No data.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Step difficulty heatmap</h2>
                <select value={heatmapSlug} onChange={async (e) => { const slug = e.target.value; setHeatmapSlug(slug); if (!slug) { setStepStats([]); return; } const r = await fetch("/api/admin/users?view=step-stats&slug=" + encodeURIComponent(slug), { credentials: "same-origin" }); const d = await r.json(); setStepStats(d.stats ?? []); }} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <option value="">Select tutorial…</option>
                  {analytics.map((t) => <option key={t.slug} value={t.slug}>{slugToTitle(t.slug)}</option>)}
                </select>
                {stepStats.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {stepStats.map((s) => { const total = s.pass_count + s.fail_count; const pct = total > 0 ? Math.round((s.pass_count / total) * 100) : 0; return (
                      <div key={s.step_index} className="flex items-center gap-3">
                        <span className="w-14 text-xs text-zinc-500">Step {s.step_index + 1}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={"h-3 rounded-full " + (pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: Math.max(pct, 2) + "%" }} /></div>
                        <span className="w-20 text-right text-xs text-zinc-400">{pct}% ({total})</span>
                      </div>
                    ); })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Revenue tab ── */}
          {tab === "revenue" && revenue && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Income by</label>
                  <select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value as RevenuePeriod)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    <option value="7days">1 week (7 days)</option>
                    <option value="month">1 month</option>
                    <option value="year">1 year</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Export</span>
                  <button type="button" onClick={exportRevenueCSV} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">CSV</button>
                  <button type="button" onClick={printRevenuePDF} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Print / PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Today", value: formatCents(revenue.revenueToday) },
                  { label: "This week", value: formatCents(revenue.revenueThisWeek ?? 0) },
                  { label: "This month", value: formatCents(revenue.revenueThisMonth) },
                  { label: "This year", value: formatCents(revenue.revenueThisYear ?? 0) },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Revenue chart</h2>
                {revenueSeries.length > 0 ? (
                  <div className="flex h-44 items-end gap-0.5">
                    {revenueSeries.map((d) => {
                      const maxR = Math.max(...revenueSeries.map((x) => x.revenue), 1);
                      const h = (d.revenue / maxR) * 100;
                      return (
                        <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" title={d.date + ": " + formatCents(d.revenue)}>
                          <div className="w-full rounded-t bg-indigo-500 transition-all group-hover:bg-indigo-400 dark:bg-indigo-600" style={{ height: Math.max(h, d.revenue > 0 ? 4 : 1) + "%" }} />
                          <div className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-white group-hover:block">{"$" + (d.revenue / 100).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">No revenue data for this period.</p>
                )}
                <p className="mt-2 text-xs text-zinc-400">Est. MRR: {formatCents(Math.round(mrr))} · Pro: {revenue.proSubscribers} · Monthly: {revenue.monthlySubscribers} · Yearly: {revenue.yearlySubscribers}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">Recent subscription events</h2>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
                      <tr><th className="px-4 py-2 text-left font-medium text-zinc-500">When</th><th className="px-4 py-2 text-left font-medium text-zinc-500">User</th><th className="px-4 py-2 text-left font-medium text-zinc-500">Plan</th><th className="px-4 py-2 text-right font-medium text-zinc-500">Amount</th><th className="px-4 py-2 text-left font-medium text-zinc-500">Event</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {subscriptionEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                          <td className="px-4 py-2 text-zinc-500">{formatDate(e.created_at)}</td>
                          <td className="px-4 py-2">{e.user_name ?? "—"} {e.user_email && <span className="text-xs text-zinc-400">{e.user_email}</span>}</td>
                          <td className="px-4 py-2 font-medium">{e.plan}</td>
                          <td className="px-4 py-2 text-right font-mono">{formatCents(e.amount_cents)}</td>
                          <td className="px-4 py-2 font-mono text-xs">{e.event_type}</td>
                        </tr>
                      ))}
                      {subscriptionEvents.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">No events yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Audit tab ── */}
          {tab === "audit" && (
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="max-h-[calc(100vh-18rem)] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900">
                    <tr><th className="px-4 py-3 text-left font-medium text-zinc-500">Action</th><th className="px-4 py-3 text-left font-medium text-zinc-500">Admin</th><th className="px-4 py-3 text-left font-medium text-zinc-500">Target</th><th className="px-4 py-3 text-right font-medium text-zinc-500">When</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {auditLog.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-700 dark:text-zinc-300">{entry.action}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{entry.admin_name ?? "—"}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{entry.target_name ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-zinc-500 dark:text-zinc-400">{formatDate(entry.created_at)}</td>
                      </tr>
                    ))}
                    {auditLog.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-zinc-400">No admin actions yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <div ref={printRef} className="hidden" aria-hidden />
    </div>
  );
}
