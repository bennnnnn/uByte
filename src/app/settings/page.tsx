"use client";

import { Suspense, useEffect, useState, useCallback, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api-client";
import SettingsTab from "@/components/profile/SettingsTab";
import DangerZoneSection from "@/components/profile/settings/DangerZoneSection";
import type { Profile } from "@/components/profile/types";

/* ── Skeleton ──────────────────────────────────────────────────────────── */
function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12 sm:px-6">
      <div className="mb-8 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-10 h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-8">
          <div className="mb-3 h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
        </div>
      ))}
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}

/* ── Section divider ───────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-6 mt-10 flex items-center gap-4 first:mt-0">
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
function SettingsPage() {
  const { user, loading, logout, logoutAll } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) { setError("Failed to load settings."); return; }
      const data = await res.json() as { profile?: Profile };
      if (data.profile) setProfile(data.profile);
    } catch {
      setError("Failed to load settings.");
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) startTransition(() => { void fetchProfile(); });
  }, [user, loading, router, fetchProfile]);

  const saveProfile = async (data: { name: string; bio: string; avatar: string; theme: string }): Promise<boolean> => {
    const res = await apiFetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json() as { profile?: Profile };
      if (json.profile) setProfile(json.profile);
      applyTheme(data.theme);
      return true;
    }
    return false;
  };

  const changePassword = async (currentPw: string, newPw: string): Promise<string | null> => {
    const res = await apiFetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    if (res.ok) return null;
    const data = await res.json() as { error?: string };
    return data.error ?? "Failed to change password";
  };

  const deleteAccount = async () => {
    await apiFetch("/api/profile", { method: "DELETE" });
    logout();
    router.push("/");
  };

  const resetProgress = async () => {
    const res = await apiFetch("/api/progress/reset", { method: "DELETE" });
    if (!res.ok) throw new Error("Reset failed");
    await fetchProfile();
  };

  if (loading || (!profile && !error)) return <SettingsSkeleton />;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => void fetchProfile()}
          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return <SettingsSkeleton />;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Page title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your profile, appearance, and email preferences.
            </p>
          </div>
          {/* Link to Billing */}
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            <span>💳</span>
            Billing
          </Link>
        </div>

        {/* ── Profile / Appearance / Password / Email ───────────────────── */}
        <SettingsTab
          profile={profile}
          plan={profile.plan}
          onSave={saveProfile}
          onChangePassword={changePassword}
          onDeleteAccount={deleteAccount}
          onResetProgress={resetProgress}
          onLogoutAll={async () => { await logoutAll(); router.push("/"); }}
          renderDangerZone={false}
        />

        {/* ── Danger Zone ──────────────────────────────────────────────── */}
        <SectionDivider label="Danger Zone" />
        <DangerZoneSection
          onDeleteAccount={deleteAccount}
          onResetProgress={resetProgress}
          onLogoutAll={async () => { await logoutAll(); router.push("/"); }}
          onToast={toast}
        />

        <div className="h-12" />
      </div>
    </div>
  );
}

function applyTheme(theme: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("theme", theme);
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  if (theme === "dark") html.classList.add("dark");
  else if (theme === "light") html.classList.add("light");
}
