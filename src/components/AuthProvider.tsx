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
  emailVerified: boolean;
  isAdmin: boolean;
  onboarding_goal?: string | null;
}

// ─── Auth Context (user, login, signup, logout) ──────

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  loginWithGoogle: (credential: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => null,
  loginWithGoogle: async () => null,
  signup: async () => null,
  logout: async () => {},
  logoutAll: async () => {},
});

// ─── App Data Context (progress, profile, views) ────

interface AppDataContextType {
  /** Completed tutorial slugs for every language. Key = language id (e.g. "go", "rust"). */
  progressByLang: Record<string, string[]>;
  /** Convenience alias — slugs completed in Go. Kept for backward compat. */
  progress: string[];
  profile: ProfileData | null;
  viewCount: number;
  limited: boolean;
  recordView: (slug: string) => Promise<void>;
  toggleProgress: (slug: string, lang?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType>({
  progressByLang: {},
  progress: [],
  profile: null,
  viewCount: 0,
  limited: false,
  recordView: async () => {},
  toggleProgress: async (slug: string, lang?: string) => { void slug; void lang; },
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
        const progData = progRes.ok ? await progRes.json() : { progress: {} };
        const profData = profRes.ok ? await profRes.json() : {};
        setProgressByLang(progData.progress || {});
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
      const progData = progRes.ok ? await progRes.json() : { progress: {} };
      setProgressByLang(progData.progress || {});
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

  const loginWithGoogle = useCallback(async (credential: string): Promise<string | null> => {
    const res = await apiFetch("/api/auth/google-id-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error || "Google sign-in failed";
    }
    const data = await res.json().catch(() => ({}));
    if (data.user) {
      await hydrateAfterAuth(data.user);
      trackConversion("login", { method: "google" });
      try { localStorage.setItem("ubyte_has_account", "1"); } catch { /* noop */ }
    }
    return null;
  }, [hydrateAfterAuth]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProgressByLang({});
    setProfile(null);
  }, []);

  const logoutAll = useCallback(async () => {
    await apiFetch("/api/auth/logout-all", { method: "POST" });
    setUser(null);
    setProgressByLang({});
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
    const existing = progressByLang[lang] ?? [];
    const completed = !existing.includes(slug);
    try {
      const res = await apiFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, completed, lang }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update only the slice for this language — other languages are unchanged.
        setProgressByLang((prev) => ({ ...prev, [lang]: data.progress as string[] }));
      }
    } catch { /* ignore */ }
  }, [user, progressByLang]);

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
      profile,
      viewCount,
      limited,
      recordView,
      toggleProgress,
      refreshProfile,
    }),
    [progressByLang, profile, viewCount, limited, recordView, toggleProgress, refreshProfile]
  );

  return (
    <UserContext.Provider value={userCtx}>
      <AppDataContext.Provider value={appDataCtx}>
        {children}
      </AppDataContext.Provider>
    </UserContext.Provider>
  );
}
