"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { applyTheme } from "@/lib/theme";

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
}

// ─── Auth Context (user, login, signup, logout) ──────

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => null,
  signup: async () => null,
  logout: async () => {},
  logoutAll: async () => {},
});

// ─── App Data Context (progress, profile, views) ────

interface AppDataContextType {
  progress: string[];
  profile: ProfileData | null;
  viewCount: number;
  limited: boolean;
  recordView: (slug: string) => Promise<void>;
  toggleProgress: (slug: string, lang?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType>({
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
  };
}

// ─── Provider ────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string[]>([]);
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
          fetch("/api/progress?lang=go", { credentials: "same-origin" }),
          fetch("/api/profile", { credentials: "same-origin" }),
        ]);
        const progData = progRes.ok ? await progRes.json() : { progress: [] };
        const profData = profRes.ok ? await profRes.json() : {};
        setProgress(progData.progress || []);
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

  // ── Auth actions ──
  const signup = async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await apiFetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return data.error || "Signup failed";
    if (data.user) setUser(data.user);
    setProfile({ avatar: "gopher", bio: "", theme: "system", xp: 0, streak_days: 0, plan: "free", emailVerified: false, isAdmin: false });
    setLimited(false);
    setViewCount(0);
    return null;
  };

  const login = async (email: string, password: string): Promise<string | null> => {
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
    if (data.user) setUser(data.user);
    setLimited(false);
    setViewCount(0);
    try {
      const [progRes, profRes] = await Promise.all([
        fetch("/api/progress?lang=go", { credentials: "same-origin" }),
        fetch("/api/profile", { credentials: "same-origin" }),
      ]);
      const progData = progRes.ok ? await progRes.json() : { progress: [] };
      setProgress(progData.progress || []);
      if (profRes.ok) {
        const profData = await profRes.json();
        const prof = extractProfile(profData);
        if (prof) {
          setProfile(prof);
          applyTheme(prof.theme);
        }
      }
    } catch { /* ignore */ }
    return null;
  };

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProgress([]);
    setProfile(null);
  };

  const logoutAll = async () => {
    await apiFetch("/api/auth/logout-all", { method: "POST" });
    setUser(null);
    setProgress([]);
    setProfile(null);
  };

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

  const toggleProgress = async (slug: string, lang: string = "go") => {
    if (!user) return;
    const completed = !progress.includes(slug);
    try {
      const res = await apiFetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, completed, lang }),
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
      }
    } catch { /* ignore */ }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = await res.json();
      const prof = extractProfile(data);
      if (prof) setProfile(prof);
    } catch { /* ignore */ }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, login, signup, logout, logoutAll }}>
      <AppDataContext.Provider value={{ progress, profile, viewCount, limited, recordView, toggleProgress, refreshProfile }}>
        {children}
      </AppDataContext.Provider>
    </UserContext.Provider>
  );
}
