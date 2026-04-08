"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { applyTheme, enforceThemeForRoute } from "@/lib/theme";
import { trackConversion } from "@/lib/analytics";

// ─── Types ───────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ProfileData {
  avatar: string;
  bio: string;
  theme: string;
  xp: number;
  streak_days: number;
  plan: string;
  subscription_expires_at?: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  onboarding_goal?: string | null;
  onboarding_lang?: string | null;
}

// ─── Auth Context (user, login, signup, logout) ──────

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: (credential: string) => Promise<{ error: string | null; isNewUser: boolean }>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => null,
  loginWithGoogle: async () => ({ error: null, isNewUser: false }),
  signup: async () => null,
  logout: async () => {},
  logoutAll: async () => {},
});

// ─── App Data Context (progress, profile, views) ────

/**
 * PROGRESS MODEL — two separate concepts, do NOT mix:
 *
 *  progressByLang   — completed CHAPTER slugs per language (from `progress` table).
 *                     A chapter is only here when ALL its steps are done.
 *                     Use for: ✓ checkmarks on tutorial cards, "Tutorial complete" modal.
 *
 *  stepCountByLang  — count of individually passed steps per language (from `step_progress`).
 *                     Counts every step the moment it's passed, even in a partial chapter.
 *                     Use for: ALL "X / 101 lessons" progress bars & profile stats.
 *
 * Adding to stepCountByLang:
 *   • On login  → loaded from DB via GET /api/progress/all (stepCounts field).
 *   • Each step → incrementStepCount(lang) called in useStepProgress.handleCheck.
 */
interface AppDataContextType {
  /** Chapter slugs fully completed per language. For checkmarks only — NOT for progress bars. */
  progressByLang: Record<string, string[]>;
  /** Convenience alias — Go slugs. Kept for backward compat. */
  progress: string[];
  /** Individual steps passed per language. Source of truth for all progress bars. */
  stepCountByLang: Record<string, number>;
  profile: ProfileData | null;
  notificationUnreadCount: number;
  viewCount: number;
  limited: boolean;
  recordView: (slug: string) => Promise<void>;
  toggleProgress: (slug: string, lang?: string) => Promise<void>;
  /** Call when a step is passed (not skipped) to update the progress bar instantly. */
  incrementStepCount: (lang: string) => void;
  setNotificationUnreadCount: (count: number) => void;
  refreshProfile: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType>({
  progressByLang: {},
  progress: [],
  stepCountByLang: {},
  profile: null,
  notificationUnreadCount: 0,
  viewCount: 0,
  limited: false,
  recordView: async () => {},
  toggleProgress: async (slug: string, lang?: string) => { void slug; void lang; },
  incrementStepCount: () => {},
  setNotificationUnreadCount: () => {},
  refreshProfile: async () => {},
});

// ─── Hooks ───────────────────────────────────────────

/** Combined hook — backward compatible, returns everything */
export function useAuth() {
  const userCtx = useContext(UserContext);
  const dataCtx = useContext(AppDataContext);
  return { ...userCtx, ...dataCtx };
}

/** Focused hook — only user/auth state */
export function useUser() {
  return useContext(UserContext);
}

/** Focused hook — only progress/profile/views */
export function useAppData() {
  return useContext(AppDataContext);
}

// ─── Helpers ─────────────────────────────────────────

function extractProfile(data: { profile?: Record<string, unknown> }): ProfileData | null {
  if (!data.profile) return null;
  const p = data.profile;
  return {
    avatar: (p.avatar as string) || "gopher",
    bio: (p.bio as string) || "",
    theme: (p.theme as string) || "system",
    xp: (p.xp as number) || 0,
    streak_days: (p.streak_days as number) || 0,
    plan: (p.plan as string) || "free",
    subscription_expires_at: (p.subscription_expires_at as string | null) ?? null,
    emailVerified: !!(p.email_verified as number),
    isAdmin: !!(p.is_admin as number),
    onboarding_goal: (p.onboarding_goal as string | null) ?? null,
    onboarding_lang: (p.onboarding_lang as string | null) ?? null,
  };
}

// ─── Provider ────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressByLang, setProgressByLang] = useState<Record<string, string[]>>({});
  const [stepCountByLang, setStepCountByLang] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [limited, setLimited] = useState(false);
  const pathname = usePathname();

  // ── Enforce light mode outside tutorial pages on every navigation ──
  useEffect(() => {
    enforceThemeForRoute();
  }, [pathname]);

  const applyAppState = useCallback((data: {
    user: User | null;
    profile?: Record<string, unknown> | null;
    progress?: Record<string, string[]>;
    stepCounts?: Record<string, number>;
    unreadCount?: number;
    viewCount?: number;
    limited?: boolean;
  }) => {
    setUser(data.user);
    setProgressByLang(data.progress ?? {});
    setStepCountByLang(data.stepCounts ?? {});
    setProfile(extractProfile({ profile: data.profile ?? undefined }));
    setNotificationUnreadCount(data.unreadCount ?? 0);
    setViewCount(data.viewCount ?? 0);
    setLimited(data.limited ?? false);

    const nextTheme = typeof data.profile?.theme === "string" ? data.profile.theme : null;
    if (nextTheme) applyTheme(nextTheme);
  }, []);

  // ── Init: check auth + load data ──
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/app-state", { credentials: "same-origin" });
      const data = await res.json();
      applyAppState(data);
    } catch {
      applyAppState({
        user: null,
        profile: null,
        progress: {},
        stepCounts: {},
        unreadCount: 0,
        viewCount: 0,
        limited: false,
      });
    } finally {
      setLoading(false);
    }
  }, [applyAppState]);

  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (savedTheme) applyTheme(savedTheme);
    fetchUser();
  }, [fetchUser]);

  // ── Cross-tab auth sync ──
  // When the user logs in or out in another tab, localStorage fires a "storage"
  // event in every OTHER tab on the same origin. We listen for that and re-fetch
  // so all tabs immediately reflect the correct session instead of showing a
  // stale user or showing "logged in" when they've actually been logged out.
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key === "ubyte_auth_changed") fetchUser();
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, [fetchUser]);

  // Notify other tabs that auth state changed so they re-fetch immediately.
  // The storage event only fires in OTHER tabs (not the current one), which
  // is exactly what we want — the current tab already has fresh state.
  const broadcastAuthChange = useCallback(() => {
    try { localStorage.setItem("ubyte_auth_changed", String(Date.now())); } catch { /* ignore */ }
  }, []);

  // ── Shared post-auth hydration (used by login, loginWithGoogle, signup) ──
  const hydrateAfterAuth = useCallback(async (userData: User) => {
    setUser(userData);
    setLimited(false);
    setViewCount(0);
    try {
      const res = await fetch("/api/app-state", { credentials: "same-origin" });
      const data = await res.json().catch(() => null);
      if (res.ok && data) applyAppState(data);
    } catch { /* ignore */ }
  }, [applyAppState]);

  // ── Auth actions ──
  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    // Pick up referral code stored by ReferralTracker when user arrived via ?ref= link
    let referralCode: string | null = null;
    try {
      const raw = localStorage.getItem("ubyte_ref");
      if (raw) {
        const { code, expires } = JSON.parse(raw) as { code: string; expires: number };
        if (Date.now() < expires) referralCode = code;
        localStorage.removeItem("ubyte_ref"); // consume — one use only
      }
    } catch { /* ignore */ }

    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, ...(referralCode ? { referralCode } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error || "Signup failed";
    if (data.user) {
      // Use hydrateAfterAuth (same as login) so profile, progress, stepCounts
      // and all derived state are loaded from the DB immediately — avoids stale
      // data (e.g. wrong plan, missing XP) until the user manually refreshes.
      await hydrateAfterAuth(data.user);
      trackConversion("signup");
      try { localStorage.setItem("ubyte_has_account", "1"); } catch { /* noop */ }
      broadcastAuthChange();
    }
    return null;
  }, [hydrateAfterAuth, broadcastAuthChange]);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error || "Login failed";
    }
    const data = await res.json().catch(() => ({}));
    if (data.user) {
      await hydrateAfterAuth(data.user);
      trackConversion("login", { method: "email" });
      try { localStorage.setItem("ubyte_has_account", "1"); } catch { /* noop */ }
      broadcastAuthChange();
    }
    return null;
  }, [hydrateAfterAuth, broadcastAuthChange]);

  const loginWithGoogle = useCallback(async (credential: string): Promise<{ error: string | null; isNewUser: boolean }> => {
    const res = await apiFetch("/api/auth/google-id-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || "Google sign-in failed", isNewUser: false };
    }
    const data = await res.json().catch(() => ({}));
    if (data.user) {
      await hydrateAfterAuth(data.user);
      trackConversion("login", { method: "google" });
      try { localStorage.setItem("ubyte_has_account", "1"); } catch { /* noop */ }
      broadcastAuthChange();
    }
    return { error: null, isNewUser: data.isNewUser ?? false };
  }, [hydrateAfterAuth, broadcastAuthChange]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProgressByLang({});
    setStepCountByLang({});
    setProfile(null);
    broadcastAuthChange();
  }, [broadcastAuthChange]);

  const logoutAll = useCallback(async () => {
    await apiFetch("/api/auth/logout-all", { method: "POST" });
    setUser(null);
    setProgressByLang({});
    setStepCountByLang({});
    setProfile(null);
    broadcastAuthChange();
  }, [broadcastAuthChange]);

  // ── Data actions ──
  const recordView = useCallback(async (slug: string) => {
    if (user) return;
    try {
      const res = await apiFetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = res.ok ? await res.json() : { viewCount: 0, limited: false };
      setViewCount(data.viewCount);
      setLimited(data.limited);
    } catch { /* ignore */ }
  }, [user]);

  const toggleProgress = useCallback(async (slug: string, lang: string = "go") => {
    if (!user) return;
    // Always mark as completed — never untoggle. The hook (useStepProgress) only
    // calls this when the user genuinely finishes all steps. The DB uses
    // ON CONFLICT DO NOTHING so double-calls are safe and idempotent.
    try {
      const res = await apiFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, completed: true, lang }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update only the slice for this language — other languages are unchanged.
        setProgressByLang((prev) => ({ ...prev, [lang]: data.progress as string[] }));
      }
    } catch { /* ignore */ }
  }, [user]);

  /** Called by useStepProgress each time a step is genuinely passed (not skipped). */
  const incrementStepCount = useCallback((lang: string) => {
    setStepCountByLang((prev) => ({ ...prev, [lang]: (prev[lang] ?? 0) + 1 }));
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await res.json();
      const prof = extractProfile(data);
      if (prof) setProfile(prof);
    } catch { /* ignore */ }
  }, []);

  const userCtx = useMemo(
    () => ({ user, loading, login, loginWithGoogle, signup, logout, logoutAll }),
    [user, loading, login, loginWithGoogle, signup, logout, logoutAll]
  );

  const appDataCtx = useMemo(
    () => ({
      progressByLang,
      progress: progressByLang["go"] ?? [],   // backward-compat alias
      stepCountByLang,
      profile,
      notificationUnreadCount,
      viewCount,
      limited,
      recordView,
      toggleProgress,
      incrementStepCount,
      setNotificationUnreadCount,
      refreshProfile,
    }),
    [progressByLang, stepCountByLang, profile, notificationUnreadCount, viewCount, limited, recordView, toggleProgress, incrementStepCount, refreshProfile]
  );

  return (
    <UserContext.Provider value={userCtx}>
      <AppDataContext.Provider value={appDataCtx}>
        {children}
      </AppDataContext.Provider>
    </UserContext.Provider>
  );
}
