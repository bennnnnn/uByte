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
import { formatCents } from "./utils";
import { MONTHLY_PRICE_CENTS, YEARLY_PRICE_CENTS } from "@/lib/plans";
import type {
  AdminUser,
  TutorialAnalytics,
  AuditEntry,
  StepStat,
  SubscriptionEventRow,
  PracticeStat,
  ExamStats,
  Tab,
  RevenuePeriod,
  AdminRevenueStats,
} from "./types";

/* ── Shared banner / site-settings shapes ───────────────────────────────── */

export interface BannerData {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
}

export interface ExamSettingsMap {
  [lang: string]: { examSize: number; examDurationMinutes: number; passPercent: number };
}

export interface ExamUploadResult {
  inserted: number;
  errors: string[];
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

export function useAdminData() {
  const { user, loading } = useAuth();
  const router = useRouter();

  /* ── State: navigation ───────────────────────────────────────────────── */
  const [tab, setTab] = useState<Tab>("users");
  const [query, setQuery] = useState("");

  /* ── State: core data fetched on mount ───────────────────────────────── */
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<TutorialAnalytics[]>([]);
  const [practiceStats, setPracticeStats] = useState<PracticeStat[]>([]);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("7days");
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number }[]>([]);
  const [subscriptionEvents, setSubscriptionEvents] = useState<SubscriptionEventRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  /* ── State: analytics heatmap ────────────────────────────────────────── */
  const [stepStats, setStepStats] = useState<StepStat[]>([]);
  const [heatmapSlug, setHeatmapSlug] = useState("");

  /* ── State: loading / error ──────────────────────────────────────────── */
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  /* ── State: user-actions dropdown ────────────────────────────────────── */
  const [pending, setPending] = useState<{ id: number; action: string } | null>(null);
  const [userActionsOpen, setUserActionsOpen] = useState<number | null>(null);
  const [actionAnchorRect, setActionAnchorRect] = useState<DOMRect | null>(null);

  /* ── State: exams tab ────────────────────────────────────────────────── */
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [examStatsLoading, setExamStatsLoading] = useState(false);
  const [examUploadFile, setExamUploadFile] = useState<File | null>(null);
  const [examUploading, setExamUploading] = useState(false);
  const [examUploadResult, setExamUploadResult] = useState<ExamUploadResult | null>(null);
  const [examSettings, setExamSettings] = useState<ExamSettingsMap | null>(null);
  const [examSettingsSaving, setExamSettingsSaving] = useState(false);
  const [examSettingsMessage, setExamSettingsMessage] = useState<string | null>(null);

  /* ── State: banner tab ───────────────────────────────────────────────── */
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  /* ── Ref for revenue print ───────────────────────────────────────────── */
  const printRef = useRef<HTMLDivElement>(null);

  /* ── Initial bulk fetch (runs once after auth resolves) ──────────────── */
  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }

    let cancelled = false;

    Promise.all([
      fetch("/api/admin/users", { credentials: "same-origin" }).then(async (r) => {
        if (r.status === 403) { router.push("/"); return null; }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "HTTP " + r.status);
        return data;
      }),
      fetch("/api/admin/users?view=analytics", { credentials: "same-origin" }).then(async (r) => { const d = await r.json(); return r.ok ? d : { analytics: [] }; }),
      fetch("/api/admin/users?view=practice-stats", { credentials: "same-origin" }).then(async (r) => { const d = await r.json(); return r.ok ? d : { stats: [] }; }),
      fetch("/api/admin/stats?period=7days", { credentials: "same-origin" }).then(async (r) => r.ok ? r.json() : null),
      fetch("/api/admin/audit-log", { credentials: "same-origin" }).then(async (r) => { const d = await r.json(); return r.ok ? d : { log: [] }; }),
      fetch("/api/admin/stats?view=subscription-events", { credentials: "same-origin" }).then(async (r) => r.ok ? r.json() : { events: [] }),
    ])
      .then(([userData, analyticsData, practiceData, revenueData, auditData, eventsData]) => {
        if (cancelled) return;
        if (userData) setUsers(userData.users ?? []);
        setAnalytics(analyticsData.analytics ?? []);
        setPracticeStats(practiceData?.stats ?? []);
        if (revenueData) { setRevenue(revenueData); setRevenueSeries(revenueData.revenueByPeriod ?? revenueData.revenueByDay ?? []); }
        setAuditLog(auditData.log ?? []);
        setSubscriptionEvents(eventsData?.events ?? []);
      })
      .catch((err) => { if (!cancelled) setError(String(err.message ?? err)); })
      .finally(() => { if (!cancelled) setFetching(false); });

    return () => { cancelled = true; };
  }, [user, loading, router]);

  /* ── Revenue period switcher ─────────────────────────────────────────── */
  useEffect(() => {
    if (tab !== "revenue" || !revenue) return;
    let cancelled = false;
    fetch("/api/admin/stats?period=" + revenuePeriod, { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data?.revenueByPeriod) setRevenueSeries(data.revenueByPeriod); });
    return () => { cancelled = true; };
  }, [tab, revenuePeriod, revenue]);

  /* ── Exam stats & settings (loaded when exams tab activates) ─────────── */
  useEffect(() => {
    if (tab !== "exams") return;
    setExamStatsLoading(true);
    setExamSettings(null);
    let cancelled = false;
    fetch("/api/admin/exam-stats", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => { if (!cancelled && data) setExamStats(data); }).finally(() => { if (!cancelled) setExamStatsLoading(false); });
    fetch("/api/admin/exam-settings", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => { if (!cancelled && data && typeof data === "object") setExamSettings(data); });
    return () => { cancelled = true; };
  }, [tab]);

  /* ── Banner (loaded when banner tab activates) ───────────────────────── */
  useEffect(() => {
    if (tab !== "banner") return;
    setBannerData(null);
    let cancelled = false;
    fetch("/api/admin/banner", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (!cancelled && data) setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "/", linkText: data.linkText ?? "Sign up" });
    });
    return () => { cancelled = true; };
  }, [tab]);

  /* ── User actions (ban, promote, delete, etc.) ───────────────────────── */
  const doAction = useCallback(async (userId: number, action: string, confirmMsg?: string, extra?: { plan?: string }) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setUserActionsOpen(null);
    setPending({ id: userId, action });
    try {
      const res = await apiFetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      if (!res.ok) { const data = await res.json(); alert(data.error ?? "Action failed"); return; }
      if (action === "delete_user") setUsers((p) => p.filter((u) => u.id !== userId));
      else if (action === "reset_progress") setUsers((p) => p.map((u) => u.id === userId ? { ...u, completed_count: 0, xp: 0, streak_days: 0 } : u));
      else if (action === "ban_user") setUsers((p) => p.map((u) => u.id === userId ? { ...u, banned: true } : u));
      else if (action === "unban_user") setUsers((p) => p.map((u) => u.id === userId ? { ...u, banned: false } : u));
      else if (action === "set_admin") setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_admin: 1 } : u));
      else if (action === "remove_admin") setUsers((p) => p.map((u) => u.id === userId ? { ...u, is_admin: 0 } : u));
      else if (action === "set_plan" && extra?.plan) setUsers((p) => p.map((u) => u.id === userId ? { ...u, plan: extra.plan! } : u));
    } catch { alert("Action failed."); } finally { setPending(null); }
  }, []);

  /* ── Heatmap step loader ─────────────────────────────────────────────── */
  const loadStepStats = useCallback(async (slug: string) => {
    setHeatmapSlug(slug);
    if (!slug) { setStepStats([]); return; }
    const r = await fetch("/api/admin/users?view=step-stats&slug=" + encodeURIComponent(slug), { credentials: "same-origin" });
    const d = await r.json();
    setStepStats(d.stats ?? []);
  }, []);

  /* ── Exam settings save ──────────────────────────────────────────────── */
  const saveExamSettings = useCallback(async () => {
    if (!examSettings) return;
    setExamSettingsSaving(true);
    setExamSettingsMessage(null);
    try {
      const res = await apiFetch("/api/admin/exam-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: examSettings }),
      });
      const data = await res.json();
      if (res.ok) { setExamSettings(data); setExamSettingsMessage("Saved."); setTimeout(() => setExamSettingsMessage(null), 3000); }
      else setExamSettingsMessage(data.error ?? "Save failed");
    } catch (e) { setExamSettingsMessage(String(e)); } finally { setExamSettingsSaving(false); }
  }, [examSettings]);

  /* ── Exam upload ─────────────────────────────────────────────────────── */
  const uploadExamQuestions = useCallback(async () => {
    if (!examUploadFile) return;
    setExamUploading(true);
    setExamUploadResult(null);
    try {
      const isJson = examUploadFile.name.toLowerCase().endsWith(".json");
      const body = await examUploadFile.text();
      const res = await apiFetch("/api/admin/exam-questions/upload", {
        method: "POST",
        headers: isJson ? { "Content-Type": "application/json" } : { "Content-Type": "text/csv" },
        body: isJson ? JSON.stringify({ questions: (() => { try { const j = JSON.parse(body); return Array.isArray(j.questions) ? j.questions : Array.isArray(j) ? j : []; } catch { return []; } })() }) : body,
      });
      const data = await res.json();
      if (res.ok) {
        setExamUploadResult({ inserted: data.inserted ?? 0, errors: data.errors ?? [] });
        setExamUploadFile(null);
        if ((data.inserted ?? 0) > 0) { const st = await fetch("/api/admin/exam-stats", { credentials: "same-origin" }); if (st.ok) setExamStats(await st.json()); }
      } else { setExamUploadResult({ inserted: 0, errors: [data.error ?? "Upload failed"] }); }
    } catch (err) { setExamUploadResult({ inserted: 0, errors: [String(err)] }); } finally { setExamUploading(false); }
  }, [examUploadFile]);

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
          linkUrl: bannerData.linkUrl || "/",
          linkText: bannerData.linkText || "Sign up",
        }),
      });
      const data = await res.json();
      if (res.ok) { setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "/", linkText: data.linkText ?? "Sign up" }); setBannerMessage("Saved."); setTimeout(() => setBannerMessage(null), 3000); }
      else setBannerMessage(data.error ?? "Save failed");
    } catch (e) { setBannerMessage(String(e)); } finally { setBannerSaving(false); }
  }, [bannerData]);

  /* ── Revenue CSV export ──────────────────────────────────────────────── */
  const exportRevenueCSV = useCallback(() => {
    const header = "Period,Revenue (USD)";
    const rows = revenueSeries.map((d) => d.date + "," + (d.revenue / 100).toFixed(2));
    const total = revenueSeries.reduce((s, d) => s + d.revenue, 0);
    const csv = [header, ...rows, "Total," + (total / 100).toFixed(2)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-" + revenuePeriod + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [revenueSeries, revenuePeriod]);

  /* ── Revenue print / PDF ─────────────────────────────────────────────── */
  const printRevenuePDF = useCallback(() => {
    if (!printRef.current || !revenue) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = revenueSeries.map((d) => "<tr><td>" + d.date + "</td><td class=\"num\">" + formatCents(d.revenue) + "</td></tr>").join("");
    const totalCents = revenueSeries.reduce((s, d) => s + d.revenue, 0);
    win.document.write(
      "<!DOCTYPE html><html><head><title>Revenue Report</title>" +
      "<style>body{font-family:system-ui,sans-serif;padding:2rem;color:#1f2937}h1{font-size:1.5rem;margin-bottom:.5rem}.meta{color:#6b7280;font-size:.875rem;margin-bottom:1.5rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e5e7eb;padding:.5rem .75rem;text-align:left}th{background:#f9fafb}.num{text-align:right}.total{font-weight:700}</style></head><body>" +
      "<h1>Revenue Report</h1><p class=\"meta\">Generated " + new Date().toLocaleString() + " · Period: " + revenuePeriod + "</p>" +
      "<table><thead><tr><th>Period</th><th class=\"num\">Revenue</th></tr></thead><tbody>" + rows +
      "<tr class=\"total\"><td>Total</td><td class=\"num\">" + formatCents(totalCents) + "</td></tr></tbody></table>" +
      "<p class=\"meta\" style=\"margin-top:1.5rem\">Today " + formatCents(revenue.revenueToday) + " · Week " + formatCents(revenue.revenueThisWeek ?? 0) + " · Month " + formatCents(revenue.revenueThisMonth) + " · Pro subs " + revenue.proSubscribers + "</p></body></html>"
    );
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  }, [revenueSeries, revenuePeriod, revenue]);

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
  const filtered = query.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
    : users;

  const totalCompletions = analytics.reduce((s, t) => s + t.completed_count, 0);
  const mrr = revenue ? (revenue.monthlySubscribers * MONTHLY_PRICE_CENTS + revenue.yearlySubscribers * YEARLY_PRICE_CENTS) / 12 : 0;

  return {
    /* auth */
    user, loading, router,
    /* tab nav */
    tab, setTab, query, setQuery,
    /* core data */
    users, filtered, analytics, practiceStats,
    revenue, revenuePeriod, setRevenuePeriod, revenueSeries, subscriptionEvents,
    auditLog,
    /* analytics heatmap */
    stepStats, heatmapSlug, loadStepStats,
    /* loading */
    fetching, error,
    /* user actions */
    pending, userActionsOpen, setUserActionsOpen, actionAnchorRect, setActionAnchorRect, doAction,
    /* exams */
    examStats, examStatsLoading, examUploadFile, setExamUploadFile, examUploading, examUploadResult, setExamUploadResult,
    examSettings, setExamSettings, examSettingsSaving, examSettingsMessage, saveExamSettings, uploadExamQuestions,
    /* banner */
    bannerData, setBannerData, bannerSaving, bannerMessage, saveBanner,
    /* revenue helpers */
    exportRevenueCSV, printRevenuePDF, exportUsersCSV,
    /* computed */
    totalCompletions, mrr,
    /* ref */
    printRef,
  };
}

/** Return type helper so tabs can receive typed props. */
export type AdminData = ReturnType<typeof useAdminData>;
