/**
 * UsersTab — paginated, server-searched user management table.
 *
 * - Search by name or email (debounced 400 ms, server-side)
 * - Filter by plan (all / free / pro / trial / canceling)
 * - 25 rows per page with full pagination controls
 * - Inline confirmation modal instead of browser alert/confirm
 * - Portal-rendered actions dropdown for correct z-index stacking
 */

"use client";

import { createPortal } from "react-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { Spinner } from "../components";
import { formatDate } from "../utils";
import type { AdminUser } from "../types";
import type { AdminData } from "../hooks";

const PAGE_SIZE = 25;

interface Props {
  data: AdminData;
}

/* ── Plan filter options ──────────────────────────────────────────────────── */
const PLAN_FILTERS = [
  { value: "",           label: "All plans" },
  { value: "free",       label: "Free" },
  { value: "pro",        label: "Pro" },
  { value: "monthly",    label: "Monthly" },
  { value: "yearly",     label: "Yearly" },
  { value: "trial",      label: "Trial" },
  { value: "canceling",  label: "Canceling" },
] as const;

/* ── Main component ───────────────────────────────────────────────────────── */
export default function UsersTab({ data }: Props) {
  const { user: adminUser, revenue, totalCompletions, exportUsersCSV } = data;

  /* ── Local state ─────────────────────────────────────────────────────── */
  const [users,       setUsers]       = useState<AdminUser[]>([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState("");
  const [debouncedQ,  setDebouncedQ]  = useState("");
  const [planFilter,  setPlanFilter]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  /* ── Action state ────────────────────────────────────────────────────── */
  const [pending,          setPending]          = useState<{ id: number; action: string } | null>(null);
  const [actionsOpen,      setActionsOpen]      = useState<number | null>(null);
  const [anchorRect,       setAnchorRect]       = useState<DOMRect | null>(null);
  const [confirmState,     setConfirmState]     = useState<{
    userId: number;
    action: string;
    label: string;
    extra?: { plan?: string };
    danger?: boolean;
  } | null>(null);
  const [actionToast,      setActionToast]      = useState<{ msg: string; ok: boolean } | null>(null);

  /* ── Debounce search ──────────────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch users ──────────────────────────────────────────────────────── */
  const fetchUsers = useCallback(async (q: string, pg: number, plan: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(PAGE_SIZE) });
      if (q.trim())   params.set("search", q.trim());
      if (plan)       params.set("plan", plan);
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "same-origin" });
      if (res.status === 403) { setUsers([]); setTotal(0); setTotalPages(1); return; }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json() as { users: AdminUser[]; total: number; totalPages: number };
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(debouncedQ, page, planFilter);
  }, [debouncedQ, page, planFilter, fetchUsers]);

  /* ── Action handler ───────────────────────────────────────────────────── */
  const doAction = useCallback(async (
    userId: number,
    action: string,
    extra?: { plan?: string },
  ) => {
    setActionsOpen(null);
    setAnchorRect(null);
    setConfirmState(null);
    setPending({ id: userId, action });
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) {
        setActionToast({ msg: json.error ?? "Action failed", ok: false });
        setTimeout(() => setActionToast(null), 4000);
        return;
      }
      // Optimistic local update
      if (action === "delete_user") {
        setUsers((p) => p.filter((u) => u.id !== userId));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        setUsers((p) => p.map((u) => {
          if (u.id !== userId) return u;
          if (action === "reset_progress") return { ...u, completed_count: 0, xp: 0, streak_days: 0 };
          if (action === "ban_user")       return { ...u, banned: true };
          if (action === "unban_user")     return { ...u, banned: false };
          if (action === "set_admin")      return { ...u, is_admin: 1, admin_role: "limited" };
          if (action === "remove_admin")   return { ...u, is_admin: 0, admin_role: null };
          if (action === "set_plan" && extra?.plan) return { ...u, plan: extra.plan };
          return u;
        }));
      }
      setActionToast({ msg: "Done", ok: true });
      setTimeout(() => setActionToast(null), 2500);
    } catch {
      setActionToast({ msg: "Action failed", ok: false });
      setTimeout(() => setActionToast(null), 4000);
    } finally {
      setPending(null);
    }
  }, []);

  /* ── Summary stats ────────────────────────────────────────────────────── */
  const proCount = revenue?.proSubscribers ?? "—";

  return (
    <div className="space-y-5">

      {/* ── Summary stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users"     value={total.toLocaleString()} loading={loading} />
        <StatCard label="Pro subscribers" value={String(proCount)} />
        <StatCard label="Completions"     value={totalCompletions.toLocaleString()} />
        <StatCard label="Showing"         value={loading ? "…" : `${users.length} / ${total}`} />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="admin-users-search"
            name="search"
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-800 placeholder-zinc-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Plan filter pills */}
          <div className="flex gap-1 flex-wrap">
            {PLAN_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setPlanFilter(f.value); setPage(1); }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  planFilter === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={exportUsersCSV}
            className="ml-1 inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M4 8h16" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">User</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">XP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Done</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Streak</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Active</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className={`h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800 ${j === 0 ? "w-48" : "ml-auto w-12"}`} />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((u) => {
                    const isMe   = u.id === adminUser?.id;
                    const busy   = pending?.id === u.id;
                    const open   = actionsOpen === u.id;

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${u.banned ? "opacity-50" : ""}`}
                      >
                        {/* User cell */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                            <PlanBadge plan={u.plan} />
                            {u.is_admin === 1 && (
                              <Badge color={u.admin_role === "super" ? "violet" : "indigo"}>
                                {u.admin_role === "super" ? "super admin" : "limited admin"}
                              </Badge>
                            )}
                            {u.banned  && <Badge color="red">banned</Badge>}
                            {isMe      && <Badge color="zinc">you</Badge>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500" title={u.email}>
                            {u.email}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-zinc-700 dark:text-zinc-300">{u.xp.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">{u.completed_count}</td>
                        <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400">{u.streak_days}d</td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.last_active_at)}</td>

                        {/* Actions */}
                        <td className="relative px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={(e) => {
                              if (open) { setActionsOpen(null); setAnchorRect(null); }
                              else { setAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setActionsOpen(u.id); }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                          >
                            {busy
                              ? <Spinner className="h-3 w-3" />
                              : <>Actions <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></>
                            }
                          </button>

                          {open && typeof document !== "undefined" && anchorRect && createPortal(
                            <>
                              <ActionsMenu
                                userId={u.id}
                                isMe={isMe}
                                banned={u.banned}
                                isAdmin={u.is_admin === 1}
                                plan={u.plan ?? "free"}
                                name={u.name}
                                anchorRect={anchorRect}
                                onAction={(action, label, extra, danger) => {
                                  setActionsOpen(null);
                                  setAnchorRect(null);
                                  setConfirmState({ userId: u.id, action, label, extra, danger });
                                }}
                              />
                              <div
                                className="fixed inset-0 z-40"
                                aria-hidden
                                onClick={() => { setActionsOpen(null); setAnchorRect(null); }}
                              />
                            </>,
                            document.body,
                          )}
                        </td>
                      </tr>
                    );
                  })
              }

              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                    {search ? `No users match "${search}"` : "No users found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs text-zinc-400">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} users
            </p>
            <div className="flex items-center gap-1">
              <PaginationBtn onClick={() => setPage(1)} disabled={page === 1} title="First page">
                «
              </PaginationBtn>
              <PaginationBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="Previous page">
                ‹
              </PaginationBtn>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const pg = start + i;
                return (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setPage(pg)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      pg === page
                        ? "bg-indigo-600 text-white"
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}

              <PaginationBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Next page">
                ›
              </PaginationBtn>
              <PaginationBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last page">
                »
              </PaginationBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Inline confirm dialog ──────────────────────────────────────── */}
      {confirmState && (
        <ConfirmModal
          label={confirmState.label}
          danger={confirmState.danger}
          onConfirm={() => doAction(confirmState.userId, confirmState.action, confirmState.extra)}
          onCancel={() => setConfirmState(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {actionToast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all ${
          actionToast.ok ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {actionToast.ok
            ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {actionToast.msg}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────────────────────── */

function StatCard({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
      {loading
        ? <div className="mt-1.5 h-7 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        : <p className="mt-1 text-2xl font-black tabular-nums text-zinc-900 dark:text-zinc-100">{value}</p>
      }
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const cls =
    plan === "yearly"    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
    plan === "pro"       ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" :
    plan === "monthly"   ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400" :
    plan === "trial" || plan === "trial_yearly"
                         ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400" :
    plan === "canceling" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" :
                           "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{plan ?? "free"}</span>;
}

function Badge({ color, children }: { color: "violet" | "indigo" | "red" | "zinc"; children: React.ReactNode }) {
  const map = {
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    red:    "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    zinc:   "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[color]}`}>{children}</span>;
}

function PaginationBtn({ onClick, disabled, title, children }: {
  onClick: () => void; disabled: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="min-w-[2rem] rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}

function ConfirmModal({ label, danger, onConfirm, onCancel }: {
  label: string; danger?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mb-1 flex h-10 w-10 items-center justify-center rounded-full ${danger ? "bg-red-100 dark:bg-red-950/40" : "bg-amber-100 dark:bg-amber-950/40"}`}>
          <svg className={`h-5 w-5 ${danger ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 className="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100">Are you sure?</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 ${danger ? "bg-red-600" : "bg-amber-500"}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/** Actions dropdown rendered via portal to escape table overflow clipping. */
function ActionsMenu({
  userId, isMe, banned, isAdmin, plan, name, anchorRect, onAction,
}: {
  userId: number; isMe: boolean; banned: boolean; isAdmin: boolean; plan: string; name: string;
  anchorRect: DOMRect;
  onAction: (action: string, label: string, extra?: { plan?: string }, danger?: boolean) => void;
}) {
  const btn = "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60";
  const divider = <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />;

  const left  = Math.max(8, Math.min(anchorRect.right - 180, (typeof window !== "undefined" ? window.innerWidth : 800) - 188));
  const top   = anchorRect.bottom + 6;

  return (
    <div
      role="menu"
      className="fixed z-50 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      style={{ left, top }}
    >
      {/* Status section */}
      <div className="px-3 pb-1 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Status</p>
      </div>
      {!isMe && (banned
        ? <button type="button" onClick={() => onAction("unban_user", `Unban ${name}?`)} className={`${btn} text-emerald-600 dark:text-emerald-400`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Unban user
          </button>
        : <button type="button" onClick={() => onAction("ban_user", `Ban ${name}? They won't be able to log in.`, undefined, false)} className={`${btn} text-orange-600 dark:text-orange-400`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            Ban user
          </button>
      )}
      {!isMe && (isAdmin
        ? <button type="button" onClick={() => onAction("remove_admin", `Remove admin from ${name}?`)} className={`${btn} text-zinc-600 dark:text-zinc-400`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
            Remove admin
          </button>
        : <button type="button" onClick={() => onAction("set_admin", `Make ${name} a limited admin?`)} className={`${btn} text-indigo-600 dark:text-indigo-400`}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Make limited admin
          </button>
      )}

      {divider}

      {/* Plan section */}
      <div className="px-3 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Set plan</p>
      </div>
      {(["free", "pro", "monthly", "yearly"] as const).map((p) => (
        <button
          key={p}
          type="button"
          disabled={plan === p}
          onClick={() => onAction("set_plan", `Set ${name} to ${p} plan?`, { plan: p })}
          className={`${btn} text-zinc-600 disabled:cursor-default disabled:opacity-40 dark:text-zinc-400`}
        >
          <PlanDot plan={p} />
          {p.charAt(0).toUpperCase() + p.slice(1)}
          {plan === p && <span className="ml-auto text-[10px] text-zinc-400">current</span>}
        </button>
      ))}

      {divider}

      {/* Danger zone */}
      <div className="px-3 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Danger</p>
      </div>
      <button type="button" onClick={() => onAction("reset_progress", `Reset all progress for ${name}? This cannot be undone.`, undefined, true)} className={`${btn} text-amber-600 dark:text-amber-400`}>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Reset progress
      </button>
      {!isMe && (
        <button type="button" onClick={() => onAction("delete_user", `Permanently delete ${name} and all their data? This cannot be undone.`, undefined, true)} className={`${btn} text-red-600 dark:text-red-400`}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete user
        </button>
      )}
      <div className="h-1" />
    </div>
  );
}

function PlanDot({ plan }: { plan: string }) {
  const color =
    plan === "yearly"  ? "bg-amber-400" :
    plan === "pro"     ? "bg-indigo-500" :
    plan === "monthly" ? "bg-violet-500" :
                         "bg-zinc-300 dark:bg-zinc-600";
  return <span className={`h-2 w-2 rounded-full ${color}`} />;
}
