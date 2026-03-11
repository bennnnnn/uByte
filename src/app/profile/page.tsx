"use client";

import { Suspense, useState, useEffect, useCallback, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { trackConversion } from "@/lib/analytics";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StatsRow from "@/components/profile/StatsRow";
import OverviewTab from "@/components/profile/OverviewTab";
import ProgressTab from "@/components/profile/ProgressTab";
import PlanTab from "@/components/profile/PlanTab";
import AchievementsTab from "@/components/profile/AchievementsTab";
import NotificationsTab from "@/components/profile/NotificationsTab";
import BookmarksTab from "@/components/profile/BookmarksTab";
import CertificationsTab from "@/components/profile/CertificationsTab";
import SettingsTab from "@/components/profile/SettingsTab";
import ReferralSection from "@/components/profile/ReferralSection";
import type { Profile, Stats, Badge, Achievement, Bookmark, Notification } from "@/components/profile/types";

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfilePage />
    </Suspense>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 py-12">
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

const VALID_TABS = ["overview", "progress", "certifications", "plan", "referral", "achievements", "notifications", "bookmarks", "settings"] as const;
type Tab = (typeof VALID_TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  progress: "Progress",
  certifications: "Certifications",
  plan: "Plan",
  referral: "Refer & Earn",
  achievements: "Achievements",
  notifications: "Notifications",
  bookmarks: "Bookmarks",
  settings: "Settings",
};

const TAB_ICONS: Record<Tab, string> = {
  overview:       "◈",
  progress:       "📈",
  certifications: "🏅",
  plan:           "💳",
  referral:       "🎁",
  achievements:   "🏆",
  notifications:  "🔔",
  bookmarks:      "🔖",
  settings:       "⚙️",
};

// Sidebar groups — keeps the nav organised on desktop
const SIDEBAR_GROUPS: { label: string; tabs: Tab[] }[] = [
  { label: "Learning",  tabs: ["overview", "progress", "certifications", "achievements"] },
  { label: "Account",   tabs: ["plan", "referral"] },
  { label: "Activity",  tabs: ["notifications", "bookmarks"] },
  { label: "Settings",  tabs: ["settings"] },
];

function ProfilePage() {
  const { user, loading, logout, logoutAll } = useAuth();
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const paramTab = searchParams.get("tab") as Tab | null;
  const planSuccess = searchParams.get("plan") === "success";
  const tabFromUrl: Tab | null = planSuccess ? "plan" : (paramTab && VALID_TABS.includes(paramTab) ? paramTab : null);
  const tab: Tab = tabFromUrl ?? activeTab ?? "overview";

  useEffect(() => {
    if (planSuccess) trackConversion("checkout_completed");
  }, [planSuccess]);

  const setTab = (t: Tab) => {
    setActiveTab(t);
    router.push(`/profile?tab=${t}`, { scroll: false });
  };

  const fetchProfile = useCallback(async () => {
    try {
      const [profRes, statsRes, bmRes, notifRes] = await Promise.all([
        fetch("/api/profile", { credentials: "same-origin" }),
        fetch("/api/profile/stats", { credentials: "same-origin" }),
        fetch("/api/bookmarks", { credentials: "same-origin" }),
        fetch("/api/notifications", { credentials: "same-origin" }),
      ]);

      if (profRes.status === 401 || statsRes.status === 401) {
        router.push("/");
        return;
      }
      if (!profRes.ok || !statsRes.ok) {
        setError(`Failed to load profile (${profRes.status}, ${statsRes.status})`);
        return;
      }

      const [profData, statsData, bmData, notifData] = await Promise.all([
        profRes.json().catch(() => ({})),
        statsRes.json().catch(() => ({})),
        bmRes.ok ? bmRes.json().catch(() => ({ bookmarks: [], hasMore: false, total: 0 })) : { bookmarks: [], hasMore: false, total: 0 },
        notifRes.ok ? notifRes.json().catch(() => ({ notifications: [], unreadCount: 0 })) : { notifications: [], unreadCount: 0 },
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
      if (notifData.notifications) {
        setNotifications(notifData.notifications);
        setUnreadCount(notifData.unreadCount ?? 0);
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

  const saveProfile = async (data: { name: string; bio: string; avatar: string; theme: string }): Promise<boolean> => {
    const res = await apiFetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const json = await res.json();
      setProfile(json.profile);
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
    const data = await res.json();
    return data.error || "Failed to change password";
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

  const markNotificationsRead = async () => {
    await apiFetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
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
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
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

      {/* Mobile: native select dropdown */}
      <div className="mb-6 sm:hidden">
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value as Tab)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          aria-label="Profile section"
        >
          {VALID_TABS.map((t) => (
            <option key={t} value={t}>
              {TAB_LABELS[t]}
              {t === "notifications" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </option>
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
                        {t === "notifications" && unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
          {tab === "plan" && (
            <>
              {planSuccess && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-200">Payment successful. Welcome to Pro!</p>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Your plan is active. Check your email for the receipt.</p>
                </div>
              )}
              <PlanTab plan={profile.plan} expiresAtProp={profile.subscription_expires_at} />
            </>
          )}
          {tab === "certifications" && <CertificationsTab />}
          {tab === "achievements" && <AchievementsTab badges={badges} achievements={achievements} />}
          {tab === "notifications" && (
            <NotificationsTab notifications={notifications} onMarkRead={markNotificationsRead} />
          )}
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
          {tab === "settings" && (
            <SettingsTab
              profile={profile}
              plan={profile.plan}
              onSave={saveProfile}
              onChangePassword={changePassword}
              onDeleteAccount={deleteAccount}
              onResetProgress={resetProgress}
              onLogoutAll={async () => { await logoutAll(); router.push("/"); }}
            />
          )}
          {tab === "referral" && (
            <div className="max-w-lg">
              <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Refer &amp; Earn</h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Invite friends to uByte. For each person who signs up with your link and upgrades to Pro,
                you earn <span className="font-semibold text-indigo-600 dark:text-indigo-400">30 free days of Pro</span>.
              </p>
              <ReferralSection />
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
