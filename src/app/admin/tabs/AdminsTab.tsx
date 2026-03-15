/**
 * AdminsTab — manage who has admin access and at what permission level.
 *
 * Super admins can:
 *   • See all current admins and their roles
 *   • Promote any user to admin (limited or super)
 *   • Change an existing admin's role
 *   • Revoke admin access
 */

"use client";

import { useState, useEffect, useCallback, Fragment } from "react";
import { apiFetch } from "@/lib/api-client";
import { Spinner, EmptyRow } from "../components";
import { formatDate } from "../utils";
import type { AdminData } from "../hooks";

interface Props {
  data: AdminData;
}

interface AdminEntry {
  id: number;
  name: string;
  email: string;
  admin_role: string | null;
  created_at: string;
  last_active_at: string | null;
  is_admin: number;
  plan: string;
}

type AdminRole = "super" | "limited";

export default function AdminsTab({ data }: Props) {
  const { user } = data;
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Promote form state
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteRole, setPromoteRole] = useState<AdminRole>("limited");
  const [promoting, setPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState("");
  const [promoteSuccess, setPromoteSuccess] = useState("");

  // Per-row action state
  const [pending, setPending] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/admins", { credentials: "same-origin" });
      if (r.status === 403) { setError("You need super admin access to manage admins."); return; }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to load");
      setAdmins(d.admins ?? []);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const doAction = useCallback(async (
    userId: number,
    action: "demote" | "set_role",
    extra?: { role?: AdminRole },
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setPending(userId);
    try {
      const res = await apiFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Action failed"); return; }
      await load();
    } catch { alert("Action failed."); }
    finally { setPending(null); }
  }, [load]);

  const handlePromote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoteError("");
    setPromoteSuccess("");
    if (!promoteEmail.trim()) { setPromoteError("Email is required"); return; }
    setPromoting(true);
    try {
      // First find user by email from /api/admin/users, then promote
      const searchRes = await fetch("/api/admin/users", { credentials: "same-origin" });
      const searchData = await searchRes.json();
      const allUsers: AdminEntry[] = searchData.users ?? [];
      const target = allUsers.find((u) => u.email.toLowerCase() === promoteEmail.trim().toLowerCase());
      if (!target) { setPromoteError("No user found with that email address."); return; }
      if (target.is_admin === 1) { setPromoteError("This user is already an admin. Change their role below."); return; }

      const res = await apiFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "promote", userId: target.id, role: promoteRole }),
      });
      const d = await res.json();
      if (!res.ok) { setPromoteError(d.error ?? "Failed to promote"); return; }
      setPromoteSuccess(`${target.name} has been promoted to ${promoteRole} admin.`);
      setPromoteEmail("");
      await load();
    } catch (e) {
      setPromoteError(String((e as Error).message ?? e));
    } finally {
      setPromoting(false);
    }
  }, [promoteEmail, promoteRole, load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Role legend ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <RoleCard
          role="super"
          description="Full access to all admin features including user management, revenue, audit log, and admin promotion."
          color="violet"
        />
        <RoleCard
          role="limited"
          description="Can manage content: analytics, site banner, blog posts, interview submissions, contact messages, and certifications."
          color="indigo"
        />
      </div>

      {/* ── Promote form ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Promote a user to admin</h2>
        <form onSubmit={handlePromote} className="flex flex-wrap gap-3">
          <input
            id="promote-email"
            name="email"
            type="email"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="user@example.com"
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30"
          />
          <select
            id="promote-role"
            name="role"
            value={promoteRole}
            onChange={(e) => setPromoteRole(e.target.value as AdminRole)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="limited">Limited admin</option>
            <option value="super">Super admin</option>
          </select>
          <button
            type="submit"
            disabled={promoting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {promoting ? <Spinner className="h-3.5 w-3.5" /> : null}
            Promote
          </button>
        </form>
        {promoteError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{promoteError}</p>}
        {promoteSuccess && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{promoteSuccess}</p>}
      </div>

      {/* ── Current admins table ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Current admins <span className="ml-1 text-zinc-400">({admins.length})</span>
          </h2>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Since</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Last active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {admins.map((a) => {
                const isMe = a.id === user?.id;
                const role = (a.admin_role ?? "super") as AdminRole;
                const busy = pending === a.id;

                return (
                  <Fragment key={a.id}>
                    <tr className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.name} {isMe && <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">you</span>}</p>
                        <p className="text-xs text-zinc-400" title={a.email}>{a.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={role} />
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(a.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{formatDate(a.last_active_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {!isMe && (
                          <div className="flex items-center justify-end gap-2">
                            {busy ? (
                              <Spinner className="h-4 w-4" />
                            ) : (
                              <>
                                {/* Toggle role */}
                                <button
                                  type="button"
                                  onClick={() => doAction(a.id, "set_role", { role: role === "super" ? "limited" : "super" }, `Change ${a.name} to ${role === "super" ? "limited" : "super"} admin?`)}
                                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                >
                                  Make {role === "super" ? "limited" : "super"}
                                </button>
                                {/* Revoke */}
                                <button
                                  type="button"
                                  onClick={() => doAction(a.id, "demote", {}, `Revoke admin access from ${a.name}?`)}
                                  className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                  Revoke
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
              {admins.length === 0 && <EmptyRow cols={5} text="No admins found." />}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Permission matrix ─────────────────────────────────────────────── */}
      <PermissionMatrix />
    </div>
  );
}

/* ── Small sub-components ────────────────────────────────────────────────── */

function RoleBadge({ role }: { role: AdminRole }) {
  return role === "super" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
      <span aria-hidden>⭐</span> Super
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
      <span aria-hidden>🔒</span> Limited
    </span>
  );
}

function RoleCard({ role, description, color }: { role: string; description: string; color: "violet" | "indigo" }) {
  const cls = {
    violet: { border: "border-violet-200 dark:border-violet-900/50", bg: "bg-violet-50 dark:bg-violet-950/20", title: "text-violet-700 dark:text-violet-400" },
    indigo: { border: "border-indigo-200 dark:border-indigo-900/50", bg: "bg-indigo-50 dark:bg-indigo-950/20", title: "text-indigo-700 dark:text-indigo-400" },
  }[color];
  return (
    <div className={`rounded-xl border ${cls.border} ${cls.bg} p-4`}>
      <p className={`mb-1 text-sm font-semibold capitalize ${cls.title}`}>{role} admin</p>
      <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

function PermissionMatrix() {
  const rows = [
    { feature: "Users — view",              super: true,  limited: false },
    { feature: "Users — ban / delete / plan", super: true, limited: false },
    { feature: "Revenue & billing",          super: true,  limited: false },
    { feature: "Growth metrics",             super: true,  limited: false },
    { feature: "Audit log",                  super: true,  limited: false },
    { feature: "Admin management",           super: true,  limited: false },
    { feature: "Site settings",              super: true,  limited: false },
    { feature: "Analytics",                  super: true,  limited: true  },
    { feature: "Certifications / exams",     super: true,  limited: true  },
    { feature: "Site banner",                super: true,  limited: true  },
    { feature: "Blog editor",                super: true,  limited: true  },
    { feature: "Interview submissions",      super: true,  limited: true  },
    { feature: "Contact messages",           super: true,  limited: true  },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Permission matrix</h2>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Feature</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-violet-500">Super</th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-indigo-500">Limited</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((r) => (
              <tr key={r.feature} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                <td className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400">{r.feature}</td>
                <td className="px-4 py-2 text-center text-sm">{r.super ? "✅" : "❌"}</td>
                <td className="px-4 py-2 text-center text-sm">{r.limited ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
