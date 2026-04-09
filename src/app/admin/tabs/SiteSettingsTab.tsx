/**
 * SiteSettingsTab — control all site-wide feature flags and limits.
 *
 * Super admins can toggle features on/off and adjust numeric limits.
 * Settings are grouped into logical sections and saved independently.
 * Limited admins can read settings but not change them.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { Spinner } from "../components";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface Settings {
  max_ai_calls_per_day: string;
  // Feature flags ("1" = on, "0" = off)
  registration_open: string;
  maintenance_mode: string;
  ai_enabled: string;
  referral_enabled: string;
  pro_features_enabled: string;
}

const DEFAULTS: Settings = {
  max_ai_calls_per_day: "200",
  registration_open: "1",
  maintenance_mode: "0",
  ai_enabled: "1",
  referral_enabled: "1",
  pro_features_enabled: "1",
};

function pickSettings(input: Record<string, unknown>): Settings {
  return {
    max_ai_calls_per_day: String(input.max_ai_calls_per_day ?? DEFAULTS.max_ai_calls_per_day),
    registration_open: String(input.registration_open ?? DEFAULTS.registration_open),
    maintenance_mode: String(input.maintenance_mode ?? DEFAULTS.maintenance_mode),
    ai_enabled: String(input.ai_enabled ?? DEFAULTS.ai_enabled),
    referral_enabled: String(input.referral_enabled ?? DEFAULTS.referral_enabled),
    pro_features_enabled: String(input.pro_features_enabled ?? DEFAULTS.pro_features_enabled),
  };
}

/* ── Primitive components ────────────────────────────────────────────────── */

function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        checked ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[19px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function SettingRow({
  label,
  hint,
  danger,
  children,
}: {
  label: string;
  hint: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3.5 ${danger ? "rounded-lg border border-red-100 bg-red-50/50 px-3 dark:border-red-900/30 dark:bg-red-950/10" : ""}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

function NumericInput({
  id,
  value,
  onChange,
  min,
  max,
  unit,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  unit?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        name={id}
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />
      {unit && <span className="text-xs text-zinc-400">{unit}</span>}
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
  onSave,
  saving,
  saved,
  disabled,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
      </div>
      <div className="divide-y divide-zinc-100 px-5 dark:divide-zinc-800">{children}</div>
      {!disabled && (
        <div className="flex items-center gap-3 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving && <Spinner className="h-3 w-3" />}
            Save
          </button>
          {saved && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Saved</span>}
        </div>
      )}
      {disabled && (
        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">Read-only — super admin access required to change settings.</p>
        </div>
      )}
    </div>
  );
}

/* ── Main tab ────────────────────────────────────────────────────────────── */

export default function SiteSettingsTab() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [draft, setDraft] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [error, setError] = useState("");

  // Per-section save state
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/admin/site-settings", { credentials: "same-origin" });
      if (r.status === 403) { setReadOnly(true); setLoading(false); return; }
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to load");
      const merged = pickSettings(d as Record<string, unknown>);
      setSettings(merged);
      setDraft(merged);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const set = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const saveSection = useCallback(async (section: string, keys: (keyof Settings)[]) => {
    setSavingSection(section);
    setSavedSection(null);
    const body: Record<string, unknown> = {};
    for (const k of keys) {
      const rule = ["max_ai_calls_per_day"].includes(k)
        ? "number"
        : "bool";
      body[k] = rule === "bool" ? draft[k] === "1" : draft[k];
    }
    try {
      const res = await apiFetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Save failed"); return; }
      const merged = pickSettings(d as Record<string, unknown>);
      setSettings(merged);
      setDraft(merged);
      setSavedSection(section);
      setTimeout(() => setSavedSection(null), 3000);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    } finally {
      setSavingSection(null);
    }
  }, [draft]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400">
        {error}
        <button type="button" onClick={load} className="ml-3 underline hover:no-underline">Retry</button>
      </div>
    );
  }

  const bool = (key: keyof Settings) => draft[key] === "1";
  const setBool = (key: keyof Settings, v: boolean) => set(key, v ? "1" : "0");

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* ── Platform ──────────────────────────────────────────────────────── */}
      <Section
        title="Platform"
        description="Core platform availability settings."
        onSave={() => saveSection("platform", ["registration_open", "maintenance_mode"])}
        saving={savingSection === "platform"}
        saved={savedSection === "platform"}
        disabled={readOnly}
      >
        <SettingRow
          label="New user registration"
          hint="When off, the sign-up form is disabled and new accounts cannot be created."
        >
          <Toggle
            id="registration_open"
            checked={bool("registration_open")}
            onChange={(v) => setBool("registration_open", v)}
            disabled={readOnly}
          />
        </SettingRow>
        <SettingRow
          label="Maintenance mode"
          hint="When on, all non-admin visitors are redirected to the maintenance page immediately. Admin panel stays accessible. Changes apply instantly — no caching."
          danger={bool("maintenance_mode")}
        >
          <Toggle
            id="maintenance_mode"
            checked={bool("maintenance_mode")}
            onChange={(v) => setBool("maintenance_mode", v)}
            disabled={readOnly}
          />
        </SettingRow>
      </Section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <Section
        title="Features"
        description="Toggle individual product features on or off site-wide."
        onSave={() => saveSection("features", ["ai_enabled", "referral_enabled", "pro_features_enabled"])}
        saving={savingSection === "features"}
        saved={savedSection === "features"}
        disabled={readOnly}
      >
        <SettingRow
          label="AI features"
          hint="Master switch for AI-powered lesson help such as detailed hints and extra in-context guidance."
        >
          <Toggle id="ai_enabled" checked={bool("ai_enabled")} onChange={(v) => setBool("ai_enabled", v)} disabled={readOnly} />
        </SettingRow>
        <SettingRow
          label="Referral program"
          hint="Users can share invite links to earn 30 free Pro days per successful referral."
        >
          <Toggle id="referral_enabled" checked={bool("referral_enabled")} onChange={(v) => setBool("referral_enabled", v)} disabled={readOnly} />
        </SettingRow>
        <SettingRow
          label="Pro features"
          hint="When off, all Pro-gated features become accessible to everyone (free access override). Useful during testing."
          danger={!bool("pro_features_enabled")}
        >
          <Toggle id="pro_features_enabled" checked={bool("pro_features_enabled")} onChange={(v) => setBool("pro_features_enabled", v)} disabled={readOnly} />
        </SettingRow>
      </Section>

      {/* ── Limits ────────────────────────────────────────────────────────── */}
      <Section
        title="Limits"
        description="Numeric thresholds and defaults."
        onSave={() => saveSection("limits", ["max_ai_calls_per_day"])}
        saving={savingSection === "limits"}
        saved={savedSection === "limits"}
        disabled={readOnly}
      >
        <SettingRow
          label="Max AI calls per day (Pro users)"
          hint="How many AI hint/help requests a Pro user can make per calendar day."
        >
          <NumericInput
            id="max_ai_calls_per_day"
            value={draft.max_ai_calls_per_day}
            onChange={(v) => set("max_ai_calls_per_day", v)}
            min={1}
            max={10000}
            unit="/ day"
            disabled={readOnly}
          />
        </SettingRow>
      </Section>

      {/* ── Current stored values (debug reference) ───────────────────────── */}
      <details className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer px-5 py-3.5 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          Stored values (debug)
        </summary>
        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {Object.entries(settings).map(([k, v]) => (
                <tr key={k}>
                  <td className="py-1 font-mono text-zinc-500 dark:text-zinc-400">{k}</td>
                  <td className="py-1 font-mono font-semibold text-zinc-800 dark:text-zinc-200">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

    </div>
  );
}
