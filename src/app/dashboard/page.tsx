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
import { hasPaidAccess } from "@/lib/plans";
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

const TAB_ICONS: Record<Tab, string> = {
  overview:       "◈",
  progress:       "📈",
  certifications: "🏅",
  achievements:   "🏆",
  bookmarks:      "🔖",
  notifications:  "🔔",
  billing:        "💳",
  referral:       "🎁",
  settings:       "⚙️",
};

/* ── Sidebar button (shared style) ────────────────────────────────────── */
function SidebarBtn({ icon, label, active, onClick }: {
  icon: string; label: string; active: boolean; onClick: () => void;
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
      <span className="text-base leading-none">{icon}</span>
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

        {/* ── Mobile: grouped select ─────────────────────────────────── */}
        <div className="mb-6 sm:hidden">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <optgroup label="Learning">
              {LEARNING_TABS.map((t) => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
            </optgroup>
            <optgroup label="Account">
              {ACCOUNT_TABS.map((t) => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
            </optgroup>
          </select>
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
                </ul>
              </div>

              {/* Account group */}
              <div>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Account
                </p>
                <ul className="space-y-0.5">
                  {ACCOUNT_TABS.map((t) => (
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
                      <span className="text-base leading-none">👤</span>
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
