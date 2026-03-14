/**
 * UsersTab — user management table with search, actions, and stat cards.
 *
 * Renders a filterable user table with per-row action dropdowns (ban, promote,
 * delete, change plan, reset progress) plus top-level summary metrics.
 */

import { createPortal } from "react-dom";
import { Spinner, StatCard, EmptyRow } from "../components";
import { formatDate } from "../utils";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

export default function UsersTab({ data }: Props) {
  const {
    user, users, filtered, revenue,
    totalCompletions,
    pending, userActionsOpen, setUserActionsOpen,
    actionAnchorRect, setActionAnchorRect, doAction,
  } = data;

  return (
    <div className="space-y-5">

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total users" value={users.length} />
        <StatCard label="Total XP" value={users.reduce((s, u) => s + u.xp, 0).toLocaleString()} />
        <StatCard label="Completions" value={totalCompletions} />
        <StatCard label="Pro subscribers" value={revenue?.proSubscribers ?? "—"} />
      </div>

      {/* ── User table ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">User</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">XP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Done</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Streak</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Active</th>
                <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400" />
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((u) => {
                const isMe = u.id === user?.id;
                const anyBusy = pending?.id === u.id;
                const open = userActionsOpen === u.id;

                return (
                  <tr key={u.id} className={`transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${u.banned ? "opacity-60" : ""}`}>
                    {/* Name + badges */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                        <PlanBadge plan={u.plan} />
                        {u.is_admin === 1 && (
                          <Badge color={u.admin_role === "limited" ? "indigo" : "violet"}>
                            {u.admin_role === "limited" ? "limited admin" : "super admin"}
                          </Badge>
                        )}
                        {u.banned && <Badge color="red">banned</Badge>}
                        {isMe && <Badge color="zinc">you</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500" title={u.email}>{u.email}</p>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">{u.xp}</td>
                    <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.completed_count}</td>
                    <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.streak_days}d</td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.last_active_at)}</td>

                    {/* Actions dropdown */}
                    <td className="relative px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          if (open) { setUserActionsOpen(null); setActionAnchorRect(null); }
                          else { setActionAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setUserActionsOpen(u.id); }
                        }}
                        disabled={anyBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        {anyBusy ? <Spinner className="h-3 w-3" /> : <>Actions <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></>}
                      </button>

                      {/* Portal-rendered dropdown for correct stacking context */}
                      {open && typeof document !== "undefined" && actionAnchorRect && createPortal(
                        <>
                          <ActionsMenu
                            userId={u.id}
                            isMe={isMe}
                            banned={u.banned}
                            isAdmin={u.is_admin === 1}
                            plan={u.plan ?? "free"}
                            name={u.name}
                            anchorRect={actionAnchorRect}
                            doAction={doAction}
                          />
                          <div className="fixed inset-0 z-40" aria-hidden onClick={() => { setUserActionsOpen(null); setActionAnchorRect(null); }} />
                        </>,
                        document.body,
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <EmptyRow cols={7} text="No users found." />}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Tiny helpers (private to this file) ─────────────────────────────────── */

/** Color-coded pill for user plan. */
function PlanBadge({ plan }: { plan: string }) {
  const cls =
    plan === "yearly"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
      : plan === "pro"
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500";

  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{plan ?? "free"}</span>;
}

/** Generic tiny badge. */
function Badge({ color, children }: { color: "violet" | "indigo" | "red" | "zinc"; children: React.ReactNode }) {
  const map = {
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    zinc: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[color]}`}>{children}</span>;
}

/** Action dropdown rendered via portal so it escapes table overflow. */
function ActionsMenu({
  userId, isMe, banned, isAdmin, plan, name, anchorRect, doAction,
}: {
  userId: number; isMe: boolean; banned: boolean; isAdmin: boolean; plan: string; name: string;
  anchorRect: DOMRect;
  doAction: (userId: number, action: string, confirmMsg?: string, extra?: { plan?: string }) => void;
}) {
  const btnCls = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800";
  const divider = <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />;

  return (
    <div
      className="fixed z-50 w-44 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      role="menu"
      style={{
        left: Math.max(8, Math.min(anchorRect.right - 176, (typeof window !== "undefined" ? window.innerWidth : 800) - 184)),
        top: anchorRect.bottom + 6,
        maxHeight: "16rem",
        overflowY: "auto",
      }}
    >
      {/* Ban / unban */}
      {!isMe && (banned
        ? <button type="button" onClick={() => doAction(userId, "unban_user")} className={`${btnCls} text-emerald-600 dark:text-emerald-400`}>Unban</button>
        : <button type="button" onClick={() => doAction(userId, "ban_user", "Ban " + name + "?")} className={`${btnCls} text-orange-600 dark:text-orange-400`}>Ban user</button>
      )}

      {/* Admin toggle */}
      {!isMe && (isAdmin
        ? <button type="button" onClick={() => doAction(userId, "remove_admin", "Remove admin from " + name + "?")} className={`${btnCls} text-zinc-600 dark:text-zinc-400`}>Remove admin</button>
        : <button type="button" onClick={() => doAction(userId, "set_admin", "Make " + name + " a limited admin?")} className={`${btnCls} text-indigo-600 dark:text-indigo-400`}>Make limited admin</button>
      )}

      {divider}

      {/* Plan switcher */}
      {(["free", "pro", "monthly", "yearly"] as const).map((p) => (
        <button key={p} type="button" onClick={() => doAction(userId, "set_plan", "Set " + name + " to " + p + "?", { plan: p })} disabled={plan === p} className={`${btnCls} text-zinc-600 disabled:opacity-40 dark:text-zinc-400`}>
          Set plan: <span className="font-semibold">{p}</span>
        </button>
      ))}

      {divider}

      {/* Destructive actions */}
      <button type="button" onClick={() => doAction(userId, "reset_progress", "Reset all progress for " + name + "?")} className={`${btnCls} text-amber-600 dark:text-amber-400`}>Reset progress</button>
      {!isMe && <button type="button" onClick={() => doAction(userId, "delete_user", "Permanently delete " + name + "?")} className={`${btnCls} text-red-600 dark:text-red-400`}>Delete user</button>}
    </div>
  );
}
