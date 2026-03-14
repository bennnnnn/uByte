"use client";

import { Suspense, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import OverviewTab from "@/components/profile/OverviewTab";
import ProgressTab from "@/components/profile/ProgressTab";
import AchievementsTab from "@/components/profile/AchievementsTab";
import BookmarksTab from "@/components/profile/BookmarksTab";
import CertificationsTab from "@/components/profile/CertificationsTab";
import type { Profile, Stats, Badge, Achievement, Bookmark } from "@/components/profile/types";

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-start gap-5">
        <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="mb-2 h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      <div className="mb-6 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </div>
    </div>
  );
}

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

// Sidebar groups
const SIDEBAR_GROUPS: { label: string; tabs: Tab[] }[] = [
  { label: "Learning", tabs: ["overview", "progress", "certifications", "achievements", "bookmarks"] },
];

function ProfilePage() {
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
    router.push(`/profile?tab=${t}`, { scroll: false });
  };

  const fetchProfile = useCallback(async () => {
    try {
      const [profRes, statsRes, bmRes] = await Promise.all([
        fetch("/api/profile", { credentials: "same-origin" }),
        fetch("/api/profile/stats", { credentials: "same-origin" }),
        fetch("/api/bookmarks", { credentials: "same-origin" }),
      ]);

      if (profRes.status === 401 || statsRes.status === 401) {
        router.push("/");
        return;
      }
      if (!profRes.ok || !statsRes.ok) {
        setError(`Failed to load profile (${profRes.status}, ${statsRes.status})`);
        return;
      }

      const [profData, statsData, bmData] = await Promise.all([
        profRes.json().catch(() => ({})),
        statsRes.json().catch(() => ({})),
        bmRes.ok ? bmRes.json().catch(() => ({ bookmarks: [], hasMore: false, total: 0 })) : { bookmarks: [], hasMore: false, total: 0 },
      ]);

      setError("");
      if (profData.profile) setProfile(profData.profile);
      if (statsData.stats) {
        setStats(statsData.stats);
        setBadges(statsData.all_badges);
        setAchievements(statsData.achievements);
      }
      if (bmData.bookmarks != null) {
        setBookmarks(bmData.bookmarks);
        setBmHasMore(bmData.hasMore ?? false);
        setBmTotal(bmData.total ?? 0);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile data.");
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) startTransition(() => { void fetchProfile(); });
  }, [user, loading, router, fetchProfile]);

  useEffect(() => {
    if (tabFromUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync tab from URL
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  const loadMoreBookmarks = async () => {
    setBmLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?offset=${bookmarks.length}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setBookmarks((prev) => [...prev, ...data.bookmarks]);
        setBmHasMore(data.hasMore ?? false);
      }
    } catch (err) {
      console.error("Load more bookmarks error:", err);
    }
    setBmLoading(false);
  };

  if (loading || (!profile && !error)) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button onClick={fetchProfile} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800">
          Retry
        </button>
      </div>
    );
  }

  if (!profile || !stats) return <ProfileSkeleton />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
      <ProfileHeader
        name={profile.name}
        email={profile.email}
        bio={profile.bio}
        avatar={profile.avatar}
        createdAt={profile.created_at}
        emailVerified={!!profile.email_verified}
        isGoogleAccount={profile.is_google}
      />

      {/* Public profile link */}
      <div className="mb-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Your public profile</p>
          <p className="truncate text-sm font-medium text-zinc-700 dark:text-zinc-300">
            ubyte.dev/u/{profile.id}
          </p>
        </div>
        <Link
          href={`/u/${profile.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          View →
        </Link>
      </div>

      <StatsRow stats={stats} />

      {/* Quick-links to other sections */}
      <div className="mb-6 flex flex-wrap gap-2 sm:hidden">
        <Link href="/notifications" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          🔔 Notifications
        </Link>
        <Link href="/settings" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          ⚙️ Settings
        </Link>
      </div>

      {/* Mobile: native select dropdown */}
      <div className="mb-6 sm:hidden">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label="Profile section"
        >
          {VALID_TABS.map((t) => (
            <option key={t} value={t}>{TAB_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Desktop: sidebar nav + content */}
      <div className="flex gap-8">

        {/* Sidebar — hidden on mobile */}
        <aside className="hidden w-44 shrink-0 sm:block">
          <nav className="sticky top-6 space-y-5">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.tabs.map((t) => (
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
            ))}
            {/* Links to dedicated pages */}
            <div>
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Account</p>
              <ul className="space-y-0.5">
                <li>
                  <Link href="/notifications" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                    <span className="text-base leading-none">🔔</span>Notifications
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
                    <span className="text-base leading-none">⚙️</span>Settings
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Tab content */}
        <div className="min-w-0 flex-1">
          {tab === "overview" && (
            <OverviewTab stats={stats} badges={badges} achievements={achievements} userId={profile.id} />
          )}
          {tab === "progress" && (
            <ProgressTab stats={stats} userId={profile.id} />
          )}
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

