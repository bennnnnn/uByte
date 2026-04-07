/**
 * AdminsTab — manage who has admin access and which capabilities they have.
 *
 * Super admins can:
 *   • Promote any user to admin by email, selecting exact permissions
 *   • Edit an existing admin's permission set inline
 *   • Revoke admin access
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { Spinner } from "../components";
import { formatDate } from "../utils";
import type { AdminData } from "../hooks";
import {
  ALL_PERMISSIONS,
  PERMISSION_LABELS,
  PERMISSION_PRESETS,
  DEFAULT_LIMITED_PERMISSIONS,
  type AdminPermission,
} from "../permission-constants";

interface Props { data: AdminData }

/* ── Personal admin URL manager ─────────────────────────────────────────────── */
function MyAdminUrl({ adminSlug }: { adminSlug: string | null }) {
  const [slug,     setSlug]     = useState(adminSlug ?? "");
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState<{ text: string; ok: boolean } | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiFetch("/api/admin/my-slug", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug.trim() || null }),
      });
      const d = await res.json();
      if (res.ok) {
        setSlug(d.slug ?? "");
        setMsg({ text: d.slug ? `Your URL: ${origin}/a/${d.slug}` : "Slug cleared.", ok: true });
      } else {
        setMsg({ text: d.error ?? "Failed to save", ok: false });
      }
    } catch {
      setMsg({ text: "Request failed", ok: false });
    } finally {
      setSaving(false);
    }
  };

  const currentUrl = slug.trim() ? `${origin}/a/${slug.trim()}` : null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your private admin URL</h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Set a personal slug so you can access the admin panel via <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/a/your-slug</code> instead of the default <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">/admin</code> path.
        </p>
      </div>
      <div className="p-5">
        <div className="flex max-w-sm items-center gap-2">
          <div className="flex flex-1 items-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            <span className="shrink-0 border-r border-zinc-200 px-3 py-2 text-xs text-zinc-400 dark:border-zinc-700">/a/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="your-slug"
              maxLength={40}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Spinner className="h-3 w-3" />}
            Save
          </button>
        </div>

        {currentUrl && !msg && (
          <p className="mt-2 text-xs text-zinc-500">
            Current:{" "}
            <a href={currentUrl} className="font-mono text-indigo-600 hover:underline dark:text-indigo-400">
              {currentUrl}
            </a>
          </p>
        )}
        {msg && (
          <p className={`mt-2 text-xs font-medium ${msg.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {msg.ok ? "✓ " : "✗ "}{msg.text}
          </p>
        )}
        <p className="mt-2 text-[11px] text-zinc-400">
          Slug: 3–40 chars, lowercase letters, digits and hyphens only. Leave blank to disable.
        </p>
      </div>
    </div>
  );
}

interface AdminEntry {
  id: number;
  name: string;
  email: string;
  admin_role: string | null;
  admin_permissions: string | null;
  created_at: string;
  last_active_at: string | null;
}

function parsePermissions(entry: AdminEntry): AdminPermission[] {
  const isSuperByRole = entry.admin_role === "super" || entry.admin_role === null;
  if (isSuperByRole) return [...ALL_PERMISSIONS];
  if (entry.admin_permissions) {
    try {
      const p = JSON.parse(entry.admin_permissions) as string[];
      return p.filter((x): x is AdminPermission => ALL_PERMISSIONS.includes(x as AdminPermission));
    } catch { /* fall through */ }
  }
  return [...DEFAULT_LIMITED_PERMISSIONS];
}

/* ── Permission checkbox group ───────────────────────────────────────────── */
function PermissionPicker({
  selected,
  onChange,
  disabled = false,
}: {
  selected: Set<AdminPermission>;
  onChange: (p: Set<AdminPermission>) => void;
  disabled?: boolean;
}) {
  const toggle = (p: AdminPermission) => {
    const next = new Set(selected);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    onChange(next);
  };

  const applyPreset = (perms: AdminPermission[]) => {
    onChange(new Set(perms));
  };

  return (
    <div className="space-y-4">
      {/* Preset buttons */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PERMISSION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => applyPreset(preset.permissions)}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Individual checkboxes */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Individual permissions</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {ALL_PERMISSIONS.map((perm) => (
            <label
              key={perm}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition-colors ${
                selected.has(perm)
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.has(perm)}
                onChange={() => !disabled && toggle(perm)}
                disabled={disabled}
                className="h-3.5 w-3.5 rounded border-zinc-300 accent-indigo-600"
              />
              {PERMISSION_LABELS[perm]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Inline permission editor for existing admin rows ────────────────────── */
function AdminRow({
  entry,
  isMe,
  onSave,
  onRevoke,
}: {
  entry: AdminEntry;
  isMe: boolean;
  onSave: (userId: number, permissions: AdminPermission[]) => Promise<void>;
  onRevoke: (userId: number) => Promise<void>;
}) {
  const isSuperByRole = entry.admin_role === "super" || entry.admin_role === null;
  const currentPerms = parsePermissions(entry);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<AdminPermission>>(new Set(currentPerms));
  const [saving, setSaving] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(entry.id, [...selected]);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Avatar initial */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {entry.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {entry.name}
              {isMe && (
                <span className="ml-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  you
                </span>
              )}
            </p>
            {isSuperByRole ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                ⭐ Super admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                🔒 Sub-admin · {currentPerms.length}/{ALL_PERMISSIONS.length} permissions
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">{entry.email} · Last active {formatDate(entry.last_active_at)}</p>

          {/* Permission pills (collapsed view) */}
          {!isSuperByRole && !editing && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {currentPerms.map((p) => (
                <span key={p} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isMe && (
          <div className="flex shrink-0 items-center gap-2">
            {!isSuperByRole && !editing && (
              <button
                type="button"
                onClick={() => { setSelected(new Set(currentPerms)); setEditing(true); }}
                className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Edit permissions
              </button>
            )}
            {revokeConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500">Revoke access?</span>
                <button
                  type="button"
                  onClick={async () => { await onRevoke(entry.id); setRevokeConfirm(false); }}
                  className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setRevokeConfirm(false)}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevokeConfirm(true)}
                className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Revoke
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline permission editor */}
      {editing && (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-800/20">
          <PermissionPicker selected={selected} onChange={setSelected} disabled={saving} />
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || selected.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving && <Spinner className="h-3 w-3" />}
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main tab ────────────────────────────────────────────────────────────── */
export default function AdminsTab({ data }: Props) {
  const { user, adminMe } = data;
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Promote form state
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promotePerms, setPromotePerms] = useState<Set<AdminPermission>>(new Set(DEFAULT_LIMITED_PERMISSIONS));
  const [promoting, setPromoting] = useState(false);
  const [promoteError, setPromoteError] = useState("");
  const [promoteSuccess, setPromoteSuccess] = useState("");

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

  useEffect(() => { void load(); }, [load]);

  const handleRevoke = useCallback(async (userId: number) => {
    try {
      const res = await apiFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "demote", userId }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Revoke failed"); return; }
      await load();
    } catch { setError("Revoke failed."); }
  }, [load]);

  const handleSavePermissions = useCallback(async (userId: number, permissions: AdminPermission[]) => {
    // If user gets all permissions, promote to super
    const isEffectivelySuper = ALL_PERMISSIONS.every((p) => permissions.includes(p));
    const action = isEffectivelySuper ? "set_role" : "set_permissions";
    const body = isEffectivelySuper
      ? { action, userId, role: "super" }
      : { action, userId, permissions };
    const res = await apiFetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error ?? "Save failed");
    await load();
  }, [load]);

  const handlePromote = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPromoteError("");
    setPromoteSuccess("");
    if (!promoteEmail.trim()) { setPromoteError("Email is required"); return; }
    if (promotePerms.size === 0) { setPromoteError("Select at least one permission"); return; }
    setPromoting(true);
    try {
      const searchRes = await fetch(
        `/api/admin/users?search=${encodeURIComponent(promoteEmail.trim())}&page=1&limit=5`,
        { credentials: "same-origin" },
      );
      const searchData = await searchRes.json();
      const matchingUsers: Array<{ id: number; name: string; email: string; is_admin: number }> = searchData.users ?? [];
      const target = matchingUsers.find(
        (u) => u.email.toLowerCase() === promoteEmail.trim().toLowerCase(),
      );
      if (!target) { setPromoteError("No user found with that email address."); return; }
      if (target.is_admin === 1) { setPromoteError("This user is already an admin. Edit their permissions in the list below."); return; }

      const isEffectivelySuper = ALL_PERMISSIONS.every((p) => promotePerms.has(p));
      const res = await apiFetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote",
          userId: target.id,
          role: isEffectivelySuper ? "super" : "limited",
          permissions: isEffectivelySuper ? undefined : [...promotePerms],
        }),
      });
      const d = await res.json();
      if (!res.ok) { setPromoteError(d.error ?? "Failed to promote"); return; }
      setPromoteSuccess(`${target.name} has been added as admin with ${promotePerms.size} permission${promotePerms.size !== 1 ? "s" : ""}.`);
      setPromoteEmail("");
      setPromotePerms(new Set(DEFAULT_LIMITED_PERMISSIONS));
      await load();
    } catch (e) {
      setPromoteError(String((e as Error).message ?? e));
    } finally {
      setPromoting(false);
    }
  }, [promoteEmail, promotePerms, load]);

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
    <div className="space-y-6">

      {/* ── Personal admin URL ────────────────────────────────────────────── */}
      <MyAdminUrl adminSlug={adminMe?.adminSlug ?? null} />

      {/* ── Promote form ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add a new admin</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Enter the user&apos;s email then select exactly what they can do.</p>
        </div>
        <form onSubmit={handlePromote} className="space-y-5 p-5">
          {/* Email */}
          <div>
            <label htmlFor="promote-email" className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              User email
            </label>
            <input
              id="promote-email"
              name="email"
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full max-w-sm rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm placeholder-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30"
            />
          </div>

          {/* Permissions */}
          <div>
            <p className="mb-3 text-xs font-medium text-zinc-700 dark:text-zinc-300">Permissions</p>
            <PermissionPicker selected={promotePerms} onChange={setPromotePerms} disabled={promoting} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={promoting || promotePerms.size === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {promoting && <Spinner className="h-3.5 w-3.5" />}
              Add admin
            </button>
            {promoteError && <p className="text-xs text-red-600 dark:text-red-400">{promoteError}</p>}
            {promoteSuccess && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ {promoteSuccess}</p>}
          </div>
        </form>
      </div>

      {/* ── Current admins ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Current admins
            <span className="ml-1.5 text-zinc-400">({admins.length})</span>
          </h2>
        </div>
        <div>
          {admins.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-400">No admins found.</p>
          ) : (
            admins.map((a) => (
              <AdminRow
                key={a.id}
                entry={a}
                isMe={a.id === user?.id}
                onSave={handleSavePermissions}
                onRevoke={handleRevoke}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
}
