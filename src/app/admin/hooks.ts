/**
 * useAdminData — central data-fetching hook for the admin dashboard.
 *
 * Loads all admin data on mount, exposes per-tab refresh helpers,
 * and keeps derived/computed values in one place so tabs only
 * receive the slices they need.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import type {
  AdminMe,
  TutorialAnalytics,
  AuditEntry,
  StepStat,
  Tab,
} from "./types";
import type { AdminGrowthSnapshot } from "@/lib/db/types";
import { TAB_PERMISSION } from "./permission-constants";

/** Sidebar order — first visible tab becomes the default for sub-admins. */
const ADMIN_TAB_ORDER: Tab[] = [
  "users",
  "analytics",
  "growth",
  "banner",
  "blog",
  "messages",
  "reports",
  "audit",
  "admins",
  "site-settings",
];

/* ── Shared banner / site-settings shapes ───────────────────────────────── */

export type BannerType = "announcement" | "promo" | "sale" | "info";

export interface BannerData {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
  bannerType: BannerType;
  bannerIcon: string;
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

export function useAdminData() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ── State: current admin identity ──────────────────────────────────── */
  const [adminMe, setAdminMe] = useState<AdminMe | null>(null);

  /* ── State: navigation ───────────────────────────────────────────────── */
  const [tab, setTab] = useState<Tab | null>(null);

  /* ── State: core data fetched on mount ───────────────────────────────── */
  const [analytics, setAnalytics] = useState<TutorialAnalytics[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [growthSnapshot, setGrowthSnapshot] = useState<AdminGrowthSnapshot | null>(null);

  /* ── State: analytics heatmap ────────────────────────────────────────── */
  const [stepStats, setStepStats] = useState<StepStat[]>([]);
  const [heatmapSlug, setHeatmapSlug] = useState("");

  /* ── State: loading / error ──────────────────────────────────────────── */
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  /* ── State: banner tab ───────────────────────────────────────────────── */
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  /* ── Initial bulk fetch (runs once after auth resolves) ──────────────── */
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }

    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/admin/me", { credentials: "same-origin" });
        if (!meRes.ok) throw new Error("Forbidden — not an admin");
        const meData = (await meRes.json()) as AdminMe;
        if (cancelled) return;

        setAdminMe(meData);

        const perm = (p: string) => meData.isSuperAdmin || meData.permissions.includes(p);

        setTab((prev) => {
          if (prev) return prev;
          for (const t of ADMIN_TAB_ORDER) {
            if (t === "admins" && !meData.isSuperAdmin) continue;
            const need = TAB_PERMISSION[t];
            if (!need) continue;
            if (meData.isSuperAdmin || meData.permissions.includes(need)) return t;
          }
          return "blog";
        });

        const pulls: Promise<void>[] = [];

        if (perm("analytics")) {
          pulls.push(
            fetch("/api/admin/users?view=analytics", { credentials: "same-origin" }).then(async (r) => {
              if (cancelled || !r.ok) return;
              const d = (await r.json()) as { analytics?: TutorialAnalytics[] };
              setAnalytics(d.analytics ?? []);
            }),
          );
        }

        if (perm("audit")) {
          pulls.push(
            fetch("/api/admin/audit-log", { credentials: "same-origin" }).then(async (r) => {
              if (cancelled || !r.ok) return;
              const d = (await r.json()) as { log?: AuditEntry[] };
              setAuditLog(d.log ?? []);
            }),
          );
        }

        if (perm("growth")) {
          pulls.push(
            fetch("/api/admin/stats?view=growth", { credentials: "same-origin" }).then(async (r) => {
              if (cancelled || !r.ok) return;
              const d = (await r.json()) as AdminGrowthSnapshot;
              setGrowthSnapshot(d);
            }),
          );
        }

        await Promise.all(pulls);
      } catch (err) {
        if (!cancelled) setError(String((err as Error).message ?? err));
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, loading, router]);

  useEffect(() => {
    let cancelled = false;
      .then((r) => r.ok ? r.json() : null)
    return () => { cancelled = true; };

  /* ── Banner (loaded when banner tab activates) ───────────────────────── */
  useEffect(() => {
    if (tab !== "banner") return;
    setBannerData(null);
    let cancelled = false;
    fetch("/api/admin/banner", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (!cancelled && data) setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "", linkText: data.linkText ?? "", bannerType: data.bannerType ?? "announcement", bannerIcon: data.bannerIcon ?? "" });
    });
    return () => { cancelled = true; };
  }, [tab]);

  /* ── Heatmap step loader ─────────────────────────────────────────────── */
  const loadStepStats = useCallback(async (slug: string) => {
    setHeatmapSlug(slug);
    if (!slug) { setStepStats([]); return; }
    const r = await fetch("/api/admin/users?view=step-stats&slug=" + encodeURIComponent(slug), { credentials: "same-origin" });
    const d = await r.json();
    setStepStats(d.stats ?? []);
  }, []);

  /* ── Banner save ─────────────────────────────────────────────────────── */
  const saveBanner = useCallback(async () => {
    if (!bannerData) return;
    setBannerSaving(true);
    setBannerMessage(null);
    try {
      const res = await apiFetch("/api/admin/banner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: bannerData.enabled,
          message: bannerData.message,
          linkUrl: bannerData.linkUrl.trim(),
          linkText: bannerData.linkText.trim(),
          bannerType: bannerData.bannerType,
          bannerIcon: bannerData.bannerIcon.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) { setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "", linkText: data.linkText ?? "", bannerType: data.bannerType ?? "announcement", bannerIcon: data.bannerIcon ?? "" }); setBannerMessage("Saved."); setTimeout(() => setBannerMessage(null), 3000); }
      else setBannerMessage(data.error ?? "Save failed");
    } catch (e) { setBannerMessage(String(e)); } finally { setBannerSaving(false); }
  }, [bannerData]);

    const csv = [header, ...rows, "Total," + (total / 100).toFixed(2)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      "<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#1f2937}h1{font-size:1.5rem;margin-bottom:.5rem}.meta{color:#6b7280;font-size:.875rem;margin-bottom:1.5rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:.5rem .75rem;text-align:left}th{background:#f9fafb}.num{text-align:right}.total{font-weight:700}</style></head><body>" +
    );
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);

  /* ── User CSV export ─────────────────────────────────────────────────── */
  const exportUsersCSV = useCallback(async () => {
    const r = await fetch("/api/admin/users?export=csv", { credentials: "same-origin" });
    if (!r.ok) return;
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  /* ── Computed / derived ──────────────────────────────────────────────── */
  const totalCompletions = analytics.reduce((s, t) => s + t.completed_count, 0);

  // Role/permissions derived from /api/admin/me (NOT from the user list)
  const isSuperAdmin = adminMe?.isSuperAdmin ?? false;
  const currentAdminRole: string | null = isSuperAdmin ? "super" : "limited";
  const hasPermission = (permission: string): boolean =>
    isSuperAdmin || (adminMe?.permissions.includes(permission) ?? false);

  return {
    /* auth */
    user, loading, router,
    /* current admin identity / permissions */
    adminMe, isSuperAdmin, currentAdminRole, hasPermission,
    /* tab nav */
    tab: tab ?? "analytics", setTab,
    /* core data */
    analytics,
    auditLog,
    growthSnapshot,
    /* analytics heatmap */
    stepStats, heatmapSlug, loadStepStats,
    /* loading */
    fetching, error,
    /* banner */
    bannerData, setBannerData, bannerSaving, bannerMessage, saveBanner,
    /* computed */
    totalCompletions,
    /* ref */
    printRef,
  };
}

/** Return type helper so tabs can receive typed props. */
export type AdminData = ReturnType<typeof useAdminData>;
