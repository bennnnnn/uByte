/**
 * SiteSettingsTab — edit global site-wide settings.
 *
 * Currently manages:
 *   • Default exam pass percentage (global fallback — per-language overrides take precedence)
 *
 * Only accessible to super admins.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { Spinner } from "../components";

export default function SiteSettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Local editable copies
  const [passPercent, setPassPercent] = useState("70");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/site-settings", { credentials: "same-origin" });
      if (r.status === 403) { setError("You need super admin access to edit site settings."); return; }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to load");
      setSettings(d);
      setPassPercent(d.exam_pass_percent ?? "70");
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const pct = parseInt(passPercent, 10);
    if (isNaN(pct) || pct < 1 || pct > 100) {
      setError("Pass percentage must be between 1 and 100.");
      setSaving(false);
      return;
    }
    try {
      const res = await apiFetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_pass_percent: String(pct) }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Save failed"); return; }
      setSettings(d);
      setPassPercent(d.exam_pass_percent ?? "70");
      setMessage("Settings saved.");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setSaving(false);
    }
  }, [passPercent]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error && Object.keys(settings).length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* ── Certifications ────────────────────────────────────────────────── */}
      <Section
        title="Certifications"
        description="Global defaults for certification exams. Per-language settings in the Certifications tab override these values."
      >
        <FormRow
          label="Default pass percentage"
          hint="Minimum score (%) required to earn a certificate when no per-language override is set."
        >
          <div className="flex items-center gap-3">
            <input
              id="default-pass-percent"
              name="pass_percent"
              type="number"
              min={1}
              max={100}
              value={passPercent}
              onChange={(e) => setPassPercent(e.target.value)}
              className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30"
            />
            <span className="text-sm text-zinc-500">%</span>
          </div>
        </FormRow>

        {/* Current values reference */}
        <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
          <p className="mb-1 font-medium text-zinc-600 dark:text-zinc-300">Stored values</p>
          {Object.entries(settings).length === 0 ? (
            <p className="italic">Using defaults</p>
          ) : (
            <ul className="space-y-0.5">
              {Object.entries(settings).map(([k, v]) => (
                <li key={k}><span className="font-mono">{k}</span> = <span className="font-mono font-semibold">{v}</span></li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* ── Save bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving && <Spinner className="h-3.5 w-3.5" />}
          Save settings
        </button>
        {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
        {error && Object.keys(settings).length > 0 && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/* ── Layout helpers ──────────────────────────────────────────────────────── */

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </div>
  );
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-4">
      <div className="sm:w-52 sm:shrink-0">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
