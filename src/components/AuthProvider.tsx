"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "@/lib/api-client";
import { applyTheme } from "@/lib/theme";
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
  viewCount: number;
  limited: boolean;
  recordView: (slug: string) => Promise<void>;
  toggleProgress: (slug: string, lang?: string) => Promise<void>;
  /** Call when a step is passed (not skipped) to update the progress bar instantly. */
  incrementStepCount: (lang: string) => void;
  refreshProfile: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType>({
  progressByLang: {},
  progress: [],
  stepCountByLang: {},
  profile: null,
  viewCount: 0,
  limited: false,
  recordView: async () => {},
  toggleProgress: async (slug: string, lang?: string) => { void slug; void lang; },
  incrementStepCount: () => {},
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
  };
}

// ─── Provider ────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progressByLang, setProgressByLang] = useState<Record<string, string[]>>({});
  const [stepCountByLang, setStepCountByLang] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [limited, setLimited] = useState(false);

  // ── Init: check auth + load data ──
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = await res.json();
      setUser(data.user);
      if (data.user) {
        const [progRes, profRes] = await Promise.all([
          fetch("/api/progress/all", { credentials: "same-origin" }),
          fetch("/api/profile", { credentials: "same-origin" }),
        ]);
        const profData = profRes.ok ? await profRes.json() : {};
        // If /api/progress/all fails or returns empty, fall back to Go-only
        // so the user doesn't see a blank dashboard.
        let byLang: Record<string, string[]> = {};
        let stepCounts: Record<string, number> = {};
        if (progRes.ok) {
          const progData = await progRes.json().catch(() => ({}));
          byLang = (progData.progress && Object.keys(progData.progress).length > 0)
            ? progData.progress
            : {};
          stepCounts = progData.stepCounts ?? {};
        }
        if (Object.keys(byLang).length === 0) {
          // Fallback: load at least Go progress the old way
          const goRes = await fetch("/api/progress?lang=go", { credentials: "same-origin" });
          if (goRes.ok) {
            const goData = await goRes.json().catch(() => ({}));
            if (Array.isArray(goData.progress) && goData.progress.length > 0) {
              byLang = { go: goData.progress };
            }
          }
        }
        setProgressByLang(byLang);
        setStepCountByLang(stepCounts);
        const prof = extractProfile(profData);
        if (prof) {
          setProfile(prof);
          applyTheme(prof.theme);
        }
        setLimited(false);
        setViewCount(0);
      } else {
        const viewRes = await fetch("/api/views");
        const viewData = viewRes.ok ? await viewRes.json() : { viewCount: 0, limited: false };
        setViewCount(viewData.viewCount);
        setLimited(viewData.limited);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (savedTheme) applyTheme(savedTheme);
    fetchUser();
  }, [fetchUser]);

  // ── Shared post-auth hydration (used by login, loginWithGoogle, signup) ──
  const hydrateAfterAuth = useCallback(async (userData: User) => {
    setUser(userData);
    setLimited(false);
    setViewCount(0);
    try {
      const [progRes, profRes] = await Promise.all([
        fetch("/api/progress/all", { credentials: "same-origin" }),
        fetch("/api/profile", { credentials: "same-origin" }),
      ]);
      let byLang: Record<string, string[]> = {};
      let stepCounts: Record<string, number> = {};
      if (progRes.ok) {
        const progData = await progRes.json().catch(() => ({}));
        byLang = (progData.progress && Object.keys(progData.progress).length > 0)
          ? progData.progress
          : {};
        stepCounts = progData.stepCounts ?? {};
      }
      if (Object.keys(byLang).length === 0) {
        const goRes = await fetch("/api/progress?lang=go", { credentials: "same-origin" });
        if (goRes.ok) {
          const goData = await goRes.json().catch(() => ({}));
          if (Array.isArray(goData.progress) && goData.progress.length > 0) {
            byLang = { go: goData.progress };
          }
        }
      }
      setProgressByLang(byLang);
      setStepCountByLang(stepCounts);
      if (profRes.ok) {
        const profData = await profRes.json();
        const prof = extractProfile(profData);
        if (prof) {
          setProfile(prof);
          applyTheme(prof.theme);
        }
      }
    } catch { /* ignore */ }
  }, []);

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
      setUser(data.user);
      setProfile({ avatar: "gopher", bio: "", theme: "system", xp: 0, streak_days: 0, plan: "free", emailVerified: false, isAdmin: false });
      setLimited(false);
      setViewCount(0);
      trackConversion("signup");
      try { localStorage.setItem("ubyte_has_account", "1"); } catch { /* noop */ }
    }
    return null;
  }, []);

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
    }
    return null;
  }, [hydrateAfterAuth]);

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
    }
    return { error: null, isNewUser: data.isNewUser ?? false };
  }, [hydrateAfterAuth]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProgressByLang({});
    setStepCountByLang({});
    setProfile(null);
  }, []);

  const logoutAll = useCallback(async () => {
    await apiFetch("/api/auth/logout-all", { method: "POST" });
    setUser(null);
    setProgressByLang({});
    setStepCountByLang({});
    setProfile(null);
  }, []);

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
      viewCount,
      limited,
      recordView,
      toggleProgress,
      incrementStepCount,
      refreshProfile,
    }),
    [progressByLang, stepCountByLang, profile, viewCount, limited, recordView, toggleProgress, incrementStepCount, refreshProfile]
  );

  return (
    <UserContext.Provider value={userCtx}>
      <AppDataContext.Provider value={appDataCtx}>
        {children}
      </AppDataContext.Provider>
    </UserContext.Provider>
  );
}
