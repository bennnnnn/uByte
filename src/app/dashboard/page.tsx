"use client";

import { Suspense, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import StatsRow from "@/components/profile/StatsRow";
import OverviewTab from "@/components/profile/OverviewTab";
import ProgressTab from "@/components/profile/ProgressTab";
import AchievementsTab from "@/components/profile/AchievementsTab";
import BookmarksTab from "@/components/profile/BookmarksTab";
import CertificationsTab from "@/components/profile/CertificationsTab";
import { hasPaidAccess } from "@/lib/plans";
import type { Profile, Stats, Badge, Achievement, Bookmark } from "@/components/profile/types";

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
          {[...Array(6)].map((_, i) => (
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

/* ── Tabs ──────────────────────────────────────────────────────────────── */
const VALID_TABS = ["overview", "progress", "certifications", "achievements", "bookmarks"] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview:       "Overview",
  progress:       "Progress",
  certifications: "Certifications",
  achievements:   "Achievements",
  bookmarks:      "Bookmarks",
};

const TAB_ICONS: Record<Tab, string> = {
  overview:       "◈",
  progress:       "📈",
  certifications: "🏅",
  achievements:   "🏆",
  bookmarks:      "🔖",
};

/* ── Sidebar link helper ───────────────────────────────────────────────── */
function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </Link>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bmHasMore, setBmHasMore] = useState(false);
  const [bmLoading, setBmLoading] = useState(false);
  const [bmTotal, setBmTotal] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const paramTab = searchParams.get("tab") as Tab | null;
  const tabFromUrl: Tab | null = paramTab && VALID_TABS.includes(paramTab) ? paramTab : null;
  const tab: Tab = tabFromUrl ?? activeTab ?? "overview";

  const setTab = (t: Tab) => {
    setActiveTab(t);
    router.push(`/dashboard?tab=${t}`, { scroll: false });
  };

  const fetchData = useCallback(async () => {
    try {
      const [profRes, statsRes, bmRes] = await Promise.all([
        fetch("/api/profile", { credentials: "same-origin" }),
        fetch("/api/profile/stats", { credentials: "same-origin" }),
        fetch("/api/bookmarks", { credentials: "same-origin" }),
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

  const loadMoreBookmarks = async () => {
    setBmLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?offset=${bookmarks.length}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
        setBmHasMore(data.hasMore ?? false);
      }
    } finally {
      setBmLoading(false);
    }
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

        {/* ── Dashboard hero ─────────────────────────────────────────── */}
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
              {profile.bio && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* View public profile CTA */}
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

        {/* ── Stats row ──────────────────────────────────────────────── */}
        <StatsRow stats={stats} />

        {/* ── Mobile tab selector + quick links ──────────────────────── */}
        <div className="mb-6 sm:hidden">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            className="mb-3 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {VALID_TABS.map((t) => <option key={t} value={t}>{TAB_LABELS[t]}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <Link href="/notifications" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">🔔 Notifications</Link>
            <Link href="/billing" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">💳 Billing</Link>
            <Link href="/settings" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">⚙️ Settings</Link>
          </div>
        </div>

        {/* ── Desktop: sidebar + content ─────────────────────────────── */}
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden w-44 shrink-0 sm:block">
            <nav className="sticky top-6 space-y-5">

              {/* Learning */}
              <div>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Learning</p>
                <ul className="space-y-0.5">
                  {VALID_TABS.map((t) => (
                    <li key={t}>
                      <button
                        onClick={() => setTab(t)}
                        aria-current={tab === t ? "page" : undefined}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          tab === t
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                        }`}
                      >
                        <span className="text-base leading-none">{TAB_ICONS[t]}</span>
                        {TAB_LABELS[t]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account */}
              <div>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Account</p>
                <ul className="space-y-0.5">
                  <li><SidebarLink href="/notifications" icon="🔔" label="Notifications" /></li>
                  <li><SidebarLink href="/billing" icon="💳" label="Billing" /></li>
                  <li><SidebarLink href="/settings" icon="⚙️" label="Settings" /></li>
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

          {/* Content */}
          <div className="min-w-0 flex-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}

