"use client";

import { Suspense, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/Toast";
import { apiFetch } from "@/lib/api-client";
import Avatar from "@/components/Avatar";
import StatsRow from "@/components/profile/StatsRow";
import OverviewTab from "@/components/profile/OverviewTab";
import ProgressTab from "@/components/profile/ProgressTab";
import AchievementsTab from "@/components/profile/AchievementsTab";
import BookmarksTab from "@/components/profile/BookmarksTab";
import CertificationsTab from "@/components/profile/CertificationsTab";
import NotificationsTab from "@/components/profile/NotificationsTab";
import PlanTab from "@/components/profile/PlanTab";
import ReferralSection from "@/components/profile/ReferralSection";
import SettingsTab from "@/components/profile/SettingsTab";
import DangerZoneSection from "@/components/profile/settings/DangerZoneSection";
import { hasPaidAccess, isActiveSubscriber } from "@/lib/plans";
import type { Profile, Stats, Badge, Achievement, Bookmark, Notification } from "@/components/profile/types";

/* ── Skeleton ──────────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
        ))}
      </div>
      <div className="flex gap-8">
        <div className="hidden w-44 shrink-0 space-y-2 sm:block">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageWrapper() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}

/* ── Tab definitions ───────────────────────────────────────────────────── */
const LEARNING_TABS = ["overview", "progress", "certifications", "achievements", "bookmarks"] as const;
const ACCOUNT_TABS  = ["notifications", "billing", "referral", "settings"] as const;
const VALID_TABS    = [...LEARNING_TABS, ...ACCOUNT_TABS] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview:       "Overview",
  progress:       "Progress",
  certifications: "Certifications",
  achievements:   "Achievements",
  bookmarks:      "Bookmarks",
  notifications:  "Notifications",
  billing:        "Plan & Billing",
  referral:       "Refer & Earn",
  settings:       "Settings",
};

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const TAB_ICONS: Record<Tab, () => JSX.Element> = {
  overview: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  progress: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  certifications: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  achievements: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  bookmarks: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  notifications: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  billing: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  referral: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
  settings: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

/* ── Sidebar button (shared style) ────────────────────────────────────── */
function SidebarBtn({ icon: Icon, label, active, onClick }: {
  icon: () => JSX.Element; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      <span className={active ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500"}>
        <Icon />
      </span>
      {label}
    </button>
  );
}

/* ── Section divider (used inside Settings tab) ────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-6 mt-10 flex items-center gap-4">
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
function DashboardPage() {
  const { user, loading, logout, logoutAll } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Core data ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [badges,  setBadges]  = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bookmarks,    setBookmarks]    = useState<Bookmark[]>([]);
  const [bmHasMore,    setBmHasMore]    = useState(false);
  const [bmLoading,    setBmLoading]    = useState(false);
  const [bmTotal,      setBmTotal]      = useState(0);
  const [error, setError] = useState("");

  // ── Notifications data (lazy-loaded when tab opens) ────────────────────
  const [notifications,    setNotifications]    = useState<Notification[]>([]);
  const [notifFetched,     setNotifFetched]     = useState(false);

  // ── Active tab ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const paramTab    = searchParams.get("tab") as Tab | null;
  const tabFromUrl: Tab | null = paramTab && (VALID_TABS as readonly string[]).includes(paramTab) ? paramTab : null;
  const tab: Tab = tabFromUrl ?? activeTab ?? "overview";

  const setTab = (t: Tab) => {
    setActiveTab(t);
    router.push(`/dashboard?tab=${t}`, { scroll: false });
  };

  // ── Fetch core profile/stats/bookmarks ────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [profRes, statsRes, bmRes] = await Promise.all([
        fetch("/api/profile",       { credentials: "same-origin" }),
        fetch("/api/profile/stats", { credentials: "same-origin" }),
        fetch("/api/bookmarks",     { credentials: "same-origin" }),
      ]);
      if (profRes.status === 401 || statsRes.status === 401) { router.push("/"); return; }
      if (!profRes.ok || !statsRes.ok) { setError("Failed to load dashboard."); return; }
      const [profData, statsData, bmData] = await Promise.all([
        profRes.json().catch(() => ({})),
        statsRes.json().catch(() => ({})),
        bmRes.ok ? bmRes.json().catch(() => ({ bookmarks: [], hasMore: false, total: 0 })) : { bookmarks: [], hasMore: false, total: 0 },
      ]);
      setError("");
      if (profData.profile) setProfile(profData.profile);
      if (statsData.stats) {
        setStats(statsData.stats);
        setBadges(statsData.all_badges ?? []);
        setAchievements(statsData.achievements ?? []);
      }
      if (bmData.bookmarks != null) {
        setBookmarks(bmData.bookmarks);
        setBmHasMore(bmData.hasMore ?? false);
        setBmTotal(bmData.total ?? 0);
      }
    } catch {
      setError("Failed to load dashboard.");
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) startTransition(() => { void fetchData(); });
  }, [user, loading, router, fetchData]);

  useEffect(() => {
    if (tabFromUrl) setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  // ── Lazy-load notifications when that tab is first opened ─────────────
  useEffect(() => {
    if (tab !== "notifications" || notifFetched) return;
    setNotifFetched(true);
    fetch("/api/notifications", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.notifications)) setNotifications(d.notifications); })
      .catch(() => {});
  }, [tab, notifFetched]);

  // ── Bookmark helpers ─────────────────────────────────────────────────
  const loadMoreBookmarks = async () => {
    setBmLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?offset=${bookmarks.length}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
        setBmHasMore(data.hasMore ?? false);
      }
    } finally { setBmLoading(false); }
  };

  const deleteBookmark = async (id: number) => {
    await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id }),
    });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setBmTotal((prev) => Math.max(0, prev - 1));
  };

  // ── Notifications helpers ────────────────────────────────────────────
  const markAllNotifsRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // ── Settings helpers ─────────────────────────────────────────────────
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
    await fetchData();
  };

  // ── Render guards ────────────────────────────────────────────────────
  if (loading || (!profile && !error)) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={() => void fetchData()} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800">
          Retry
        </button>
      </div>
    );
  }

  if (!profile || !stats) return <DashboardSkeleton />;

  const isPro = hasPaidAccess(profile.plan);
  const planLabel = profile.plan === "yearly" ? "Yearly" : isPro ? "Pro" : "Free";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar avatarKey={profile.avatar} size="xl" />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</h1>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isPro
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                }`}>
                  {planLabel}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</p>
              {profile.bio && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{profile.bio}</p>}
            </div>
          </div>
          <Link
            href={`/u/${profile.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            View public profile
          </Link>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <StatsRow stats={stats} />

        {/* ── Mobile: scrollable pill tabs ────────────────────────────── */}
        <div className="-mx-4 mb-6 sm:hidden">
          <div
            className="flex gap-1.5 overflow-x-auto px-4 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Learning group */}
            {LEARNING_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  tab === t
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
            {/* Divider */}
            <span className="mx-0.5 shrink-0 self-center border-l border-zinc-200 py-2.5 dark:border-zinc-700" />
            {/* Account group */}
            {ACCOUNT_TABS
              .filter((t) => !(t === "referral" && isActiveSubscriber(profile.plan)))
              .map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t
                      ? "bg-indigo-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            {/* Leaderboard external link */}
            <button
              type="button"
              onClick={() => router.push("/leaderboard")}
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              Leaderboard ↗
            </button>
          </div>
        </div>

        {/* ── Desktop: sidebar + content ─────────────────────────────── */}
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden w-48 shrink-0 sm:block">
            <nav className="sticky top-6 space-y-5">

              {/* Learning group */}
              <div>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Learning
                </p>
                <ul className="space-y-0.5">
                  {LEARNING_TABS.map((t) => (
                    <li key={t}>
                      <SidebarBtn
                        icon={TAB_ICONS[t]}
                        label={TAB_LABELS[t]}
                        active={tab === t}
                        onClick={() => setTab(t)}
                      />
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/leaderboard"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <span className="text-zinc-400 dark:text-zinc-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                      Leaderboard
                      <svg className="ml-auto h-3 w-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account group */}
              <div>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Account
                </p>
                <ul className="space-y-0.5">
                  {ACCOUNT_TABS.filter((t) => !(t === "referral" && isActiveSubscriber(profile.plan))).map((t) => (
                    <li key={t}>
                      <SidebarBtn
                        icon={TAB_ICONS[t]}
                        label={TAB_LABELS[t]}
                        active={tab === t}
                        onClick={() => setTab(t)}
                      />
                    </li>
                  ))}
                  {/* Public profile — opens externally, stays as link */}
                  <li>
                    <Link
                      href={`/u/${profile.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <span className="text-zinc-400 dark:text-zinc-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      Public profile
                      <svg className="ml-auto h-3 w-3 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Content area */}
          <div className="min-w-0 flex-1">

            {/* Learning tabs */}
            {tab === "overview" && (
              <OverviewTab stats={stats} badges={badges} achievements={achievements} userId={profile.id} />
            )}
            {tab === "progress" && <ProgressTab stats={stats} userId={profile.id} />}
            {tab === "certifications" && <CertificationsTab />}
            {tab === "achievements" && <AchievementsTab badges={badges} achievements={achievements} />}
            {tab === "bookmarks" && (
              <BookmarksTab
                bookmarks={bookmarks}
                hasMore={bmHasMore}
                total={bmTotal}
                onDelete={deleteBookmark}
                onLoadMore={loadMoreBookmarks}
                loadingMore={bmLoading}
              />
            )}

            {/* Account tabs — all inline, no navigation */}
            {tab === "notifications" && (
              <NotificationsTab
                notifications={notifications}
                onMarkRead={markAllNotifsRead}
              />
            )}
            {tab === "billing" && (
              <PlanTab plan={profile.plan} expiresAtProp={profile.subscription_expires_at} />
            )}
            {tab === "referral" && <ReferralSection />}
            {tab === "settings" && (
              <div>
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
                <SectionDivider label="Danger Zone" />
                <DangerZoneSection
                  onDeleteAccount={deleteAccount}
                  onResetProgress={resetProgress}
                  onLogoutAll={async () => { await logoutAll(); router.push("/"); }}
                  onToast={toast}
                />
              </div>
            )}
          </div>
        </div>
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
