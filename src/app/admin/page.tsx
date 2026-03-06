"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";
import { formatDate, slugToTitle, formatCents } from "./utils";
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
import { TAB_LABELS } from "./types";

/* ── Tiny reusable pieces ─────────────────────────────────────────────────── */

function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <div className={`animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-400 ${className}`} />;
}

function EmptyRow({ cols, text = "No data." }: { cols: number; text?: string }) {
  return <tr><td colSpan={cols} className="px-4 py-12 text-center text-sm text-zinc-400 dark:text-zinc-500">{text}</td></tr>;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{label}</p>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaveButton({ saving, label = "Save", savingLabel = "Saving…", onClick }: { saving: boolean; label?: string; savingLabel?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={saving}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
    >
      {saving && <Spinner className="h-3.5 w-3.5 border-white/30 border-t-white" />}
      {saving ? savingLabel : label}
    </button>
  );
}

function SaveFeedback({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span className={`text-sm font-medium ${message === "Saved." ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
      {message}
    </span>
  );
}

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  analytics: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  revenue: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />,
  audit: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />,
  exams: <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />,
  banner: <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />,
  settings: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />,
};

function TabIcon({ tab: t }: { tab: Tab }) {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {TAB_ICONS[t]}
    </svg>
  );
}

/* ── Main page ────────────────────────────────────────────────────────────── */

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<TutorialAnalytics[]>([]);
  const [practiceStats, setPracticeStats] = useState<PracticeStat[]>([]);
  const [revenue, setRevenue] = useState<AdminRevenueStats | null>(null);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("7days");
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number }[]>([]);
  const [subscriptionEvents, setSubscriptionEvents] = useState<SubscriptionEventRow[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [stepStats, setStepStats] = useState<StepStat[]>([]);
  const [heatmapSlug, setHeatmapSlug] = useState("");
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<{ id: number; action: string } | null>(null);
  const [userActionsOpen, setUserActionsOpen] = useState<number | null>(null);
  const [actionAnchorRect, setActionAnchorRect] = useState<DOMRect | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [examStats, setExamStats] = useState<ExamStats | null>(null);
  const [examStatsLoading, setExamStatsLoading] = useState(false);
  const [examUploadFile, setExamUploadFile] = useState<File | null>(null);
  const [examUploading, setExamUploading] = useState(false);
  const [examUploadResult, setExamUploadResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [examSettings, setExamSettings] = useState<Record<string, { examSize: number; examDurationMinutes: number }> | null>(null);
  const [examSettingsSaving, setExamSettingsSaving] = useState(false);
  const [examSettingsMessage, setExamSettingsMessage] = useState<string | null>(null);
  const [bannerData, setBannerData] = useState<{ enabled: boolean; message: string; linkUrl: string; linkText: string } | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<{ exam_pass_percent: string } | null>(null);
  const [siteSettingsSaving, setSiteSettingsSaving] = useState(false);
  const [siteSettingsMessage, setSiteSettingsMessage] = useState<string | null>(null);

  /* ── Data loading ─────────────────────────────────────────────────────── */

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/"); return; }

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
        if (userData) setUsers(userData.users ?? []);
        setAnalytics(analyticsData.analytics ?? []);
        setPracticeStats(practiceData?.stats ?? []);
        if (revenueData) { setRevenue(revenueData); setRevenueSeries(revenueData.revenueByPeriod ?? revenueData.revenueByDay ?? []); }
        setAuditLog(auditData.log ?? []);
        setSubscriptionEvents(eventsData?.events ?? []);
      })
      .catch((err) => setError(String(err.message ?? err)))
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  useEffect(() => {
    if (tab !== "revenue" || !revenue) return;
    let cancelled = false;
    fetch("/api/admin/stats?period=" + revenuePeriod, { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data?.revenueByPeriod) setRevenueSeries(data.revenueByPeriod); });
    return () => { cancelled = true; };
  }, [tab, revenuePeriod, revenue]);

  useEffect(() => {
    if (tab !== "exams") return;
    setExamStatsLoading(true);
    setExamSettings(null);
    let cancelled = false;
    fetch("/api/admin/exam-stats", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => { if (!cancelled && data) setExamStats(data); }).finally(() => { if (!cancelled) setExamStatsLoading(false); });
    fetch("/api/admin/exam-settings", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => { if (!cancelled && data && typeof data === "object") setExamSettings(data); });
    return () => { cancelled = true; };
  }, [tab]);

  useEffect(() => {
    if (tab !== "banner") return;
    setBannerData(null);
    let cancelled = false;
    fetch("/api/admin/banner", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (!cancelled && data) setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "/", linkText: data.linkText ?? "Sign up" });
    });
    return () => { cancelled = true; };
  }, [tab]);

  useEffect(() => {
    if (tab !== "settings") return;
    setSiteSettings(null);
    let cancelled = false;
    fetch("/api/admin/site-settings", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (!cancelled && data) setSiteSettings({ exam_pass_percent: data.exam_pass_percent ?? "70" });
    });
    return () => { cancelled = true; };
  }, [tab]);

  /* ── Actions ──────────────────────────────────────────────────────────── */

  async function doAction(userId: number, action: string, confirmMsg?: string, extra?: { plan?: string }) {
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
  }

  /* ── Computed ──────────────────────────────────────────────────────────── */

  const filtered = query.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))
    : users;

  const totalCompletions = analytics.reduce((s, t) => s + t.completed_count, 0);
  const mrr = revenue ? (revenue.monthlySubscribers * 999 + revenue.yearlySubscribers * 4999) / 12 : 0;

  function exportRevenueCSV() {
    const header = "Period,Revenue (USD)";
    const rows = revenueSeries.map((d) => d.date + "," + (d.revenue / 100).toFixed(2));
    const total = revenueSeries.reduce((s, d) => s + d.revenue, 0);
    const csv = [header, ...rows, "Total," + (total / 100).toFixed(2)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "revenue-" + revenuePeriod + "-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function printRevenuePDF() {
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
    win.document.close(); win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  }

  /* ── Loading / error states ───────────────────────────────────────────── */

  if (loading || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-zinc-400">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-sm rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-zinc-900">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button type="button" onClick={() => router.push("/")} className="mt-4 text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">Back to home</button>
        </div>
      </div>
    );
  }

  /* ── Layout ───────────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-14 items-center gap-2.5 border-b border-zinc-100 px-5 dark:border-zinc-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" aria-hidden>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Overview</p>
          {(["users", "analytics", "revenue"] as Tab[]).map((t) => (
            <button
              key={t} type="button" onClick={() => setTab(t)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                tab === t
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <TabIcon tab={t} />
              {TAB_LABELS[t]}
            </button>
          ))}

          <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Manage</p>
          {(["exams", "banner", "settings"] as Tab[]).map((t) => (
            <button
              key={t} type="button" onClick={() => setTab(t)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                tab === t
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <TabIcon tab={t} />
              {TAB_LABELS[t]}
            </button>
          ))}

          <p className="mb-2 mt-5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">History</p>
          <button
            type="button" onClick={() => setTab("audit")}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
              tab === "audit"
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <TabIcon tab="audit" />
            {TAB_LABELS.audit}
          </button>
        </nav>

        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400" title={user?.email ?? ""}>{user?.email}</p>
          <Link href="/" className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            Exit admin
          </Link>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{TAB_LABELS[tab]}</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {tab === "users" && `${users.length} registered users`}
              {tab === "analytics" && "Tutorial completions & practice stats"}
              {tab === "revenue" && "Income, subscribers & billing events"}
              {tab === "audit" && "Admin action history"}
              {tab === "exams" && "Questions, attempts, settings & upload"}
              {tab === "banner" && "Site-wide announcement banner"}
              {tab === "settings" && "Global site configuration"}
            </p>
          </div>
          {tab === "users" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search users" className="w-48 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30" />
              </div>
              <button type="button" onClick={async () => { const r = await fetch("/api/admin/users?export=csv", { credentials: "same-origin" }); if (!r.ok) return; const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click(); URL.revokeObjectURL(url); }} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Export CSV</button>
            </div>
          )}
          {tab === "revenue" && revenue && (
            <div className="flex items-center gap-2">
              <select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value as RevenuePeriod)} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <option value="7days">7 days</option>
                <option value="month">1 month</option>
                <option value="year">1 year</option>
              </select>
              <button type="button" onClick={exportRevenueCSV} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">CSV</button>
              <button type="button" onClick={printRevenuePDF} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Print</button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6">

          {/* ═══════ USERS TAB ═══════════════════════════════════════════════ */}
          {tab === "users" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total users" value={users.length} />
                <StatCard label="Total XP" value={users.reduce((s, u) => s + u.xp, 0).toLocaleString()} />
                <StatCard label="Completions" value={totalCompletions} />
                <StatCard label="Pro subscribers" value={revenue?.proSubscribers ?? "—"} />
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="max-h-[calc(100vh-20rem)] overflow-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/90">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">User</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">XP</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Done</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Streak</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Joined</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Active</th>
                        <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {filtered.map((u) => {
                        const isMe = u.id === user?.id;
                        const anyBusy = pending?.id === u.id;
                        const open = userActionsOpen === u.id;
                        return (
                          <tr key={u.id} className={`transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${u.banned ? "opacity-60" : ""}`}>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.plan === "yearly" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" : u.plan === "pro" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"}`}>
                                  {u.plan ?? "free"}
                                </span>
                                {u.is_admin === 1 && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">admin</span>}
                                {u.banned && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-400">banned</span>}
                                {isMe && <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">you</span>}
                              </div>
                              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500" title={u.email}>{u.email}</p>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">{u.xp}</td>
                            <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.completed_count}</td>
                            <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">{u.streak_days}d</td>
                            <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.created_at)}</td>
                            <td className="px-4 py-3 text-right text-xs text-zinc-400">{formatDate(u.last_active_at)}</td>
                            <td className="relative px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (open) { setUserActionsOpen(null); setActionAnchorRect(null); }
                                  else { setActionAnchorRect((e.currentTarget as HTMLElement).getBoundingClientRect()); setUserActionsOpen(u.id); }
                                }}
                                disabled={anyBusy}
                                className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                              >
                                {anyBusy ? <Spinner className="h-3 w-3" /> : <>Actions <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></>}
                              </button>
                              {open && typeof document !== "undefined" && actionAnchorRect && createPortal(
                                <>
                                  <div
                                    className="fixed z-50 w-44 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                                    role="menu"
                                    style={{ left: Math.max(8, Math.min(actionAnchorRect.right - 176, (typeof window !== "undefined" ? window.innerWidth : 800) - 184)), top: actionAnchorRect.bottom + 6, maxHeight: "16rem", overflowY: "auto" }}
                                  >
                                    {!isMe && (u.banned
                                      ? <button type="button" onClick={() => doAction(u.id, "unban_user")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-emerald-600 hover:bg-zinc-50 dark:text-emerald-400 dark:hover:bg-zinc-800">Unban</button>
                                      : <button type="button" onClick={() => doAction(u.id, "ban_user", "Ban " + u.name + "?")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-orange-600 hover:bg-zinc-50 dark:text-orange-400 dark:hover:bg-zinc-800">Ban user</button>
                                    )}
                                    {!isMe && (u.is_admin === 1
                                      ? <button type="button" onClick={() => doAction(u.id, "remove_admin", "Remove admin from " + u.name + "?")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800">Remove admin</button>
                                      : <button type="button" onClick={() => doAction(u.id, "set_admin", "Make " + u.name + " admin?")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-indigo-600 hover:bg-zinc-50 dark:text-indigo-400 dark:hover:bg-zinc-800">Make admin</button>
                                    )}
                                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                    {(["free", "pro", "yearly"] as const).map((p) => (
                                      <button key={p} type="button" onClick={() => doAction(u.id, "set_plan", "Set " + u.name + " to " + p + "?", { plan: p })} disabled={(u.plan ?? "free") === p} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800">Set plan: <span className="font-semibold">{p}</span></button>
                                    ))}
                                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                    <button type="button" onClick={() => doAction(u.id, "reset_progress", "Reset all progress for " + u.name + "?")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-amber-600 hover:bg-zinc-50 dark:text-amber-400 dark:hover:bg-zinc-800">Reset progress</button>
                                    {!isMe && <button type="button" onClick={() => doAction(u.id, "delete_user", "Permanently delete " + u.name + "?")} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800">Delete user</button>}
                                  </div>
                                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => { setUserActionsOpen(null); setActionAnchorRect(null); }} />
                                </>,
                                document.body
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && <EmptyRow cols={7} text="No users found." />}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ ANALYTICS TAB ════════════════════════════════════════════ */}
          {tab === "analytics" && (
            <div className="space-y-5">
              <SectionCard title="Tutorial completions & ratings">
                <div className="max-h-80 overflow-auto -mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Tutorial</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Done</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">👍</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">👎</th><th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Score</th></tr></thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {analytics.map((t) => {
                        const total = t.thumbs_up + t.thumbs_down;
                        const score = total > 0 ? Math.round((t.thumbs_up / total) * 100) : null;
                        return (
                          <tr key={t.slug} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                            <td className="px-5 py-2.5"><span className="font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(t.slug)}</span><span className="ml-2 text-xs text-zinc-400">{t.slug}</span></td>
                            <td className="px-4 py-2.5 text-right font-mono">{t.completed_count}</td>
                            <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">{t.thumbs_up}</td>
                            <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">{t.thumbs_down}</td>
                            <td className="px-5 py-2.5 text-right">{score !== null ? <span className={score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500"}>{score}%</span> : <span className="text-zinc-300 dark:text-zinc-600">—</span>}</td>
                          </tr>
                        );
                      })}
                      {analytics.length === 0 && <EmptyRow cols={5} />}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Practice problems">
                <div className="max-h-64 overflow-auto -mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Problem</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Solved</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Attempts</th><th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Rate</th></tr></thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {practiceStats.map((p) => (
                        <tr key={p.problem_slug} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                          <td className="px-5 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{slugToTitle(p.problem_slug)}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{p.solved_count}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{p.attempt_count}</td>
                          <td className="px-5 py-2.5 text-right">{p.attempt_count > 0 ? Math.round((p.solved_count / p.attempt_count) * 100) + "%" : "—"}</td>
                        </tr>
                      ))}
                      {practiceStats.length === 0 && <EmptyRow cols={4} />}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="Step difficulty heatmap" description="Pick a tutorial to see pass rates per step.">
                <select value={heatmapSlug} onChange={async (e) => { const slug = e.target.value; setHeatmapSlug(slug); if (!slug) { setStepStats([]); return; } const r = await fetch("/api/admin/users?view=step-stats&slug=" + encodeURIComponent(slug), { credentials: "same-origin" }); const d = await r.json(); setStepStats(d.stats ?? []); }} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <option value="">Select tutorial…</option>
                  {analytics.map((t) => <option key={t.slug} value={t.slug}>{slugToTitle(t.slug)}</option>)}
                </select>
                {stepStats.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {stepStats.map((s) => { const total = s.pass_count + s.fail_count; const pct = total > 0 ? Math.round((s.pass_count / total) * 100) : 0; return (
                      <div key={s.step_index} className="flex items-center gap-3">
                        <span className="w-14 text-right text-xs font-medium text-zinc-500">Step {s.step_index + 1}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"><div className={"h-2.5 rounded-full transition-all " + (pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: Math.max(pct, 2) + "%" }} /></div>
                        <span className="w-20 text-right text-xs text-zinc-400">{pct}% ({total})</span>
                      </div>
                    ); })}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════ REVENUE TAB ══════════════════════════════════════════════ */}
          {tab === "revenue" && revenue && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Today" value={formatCents(revenue.revenueToday)} />
                <StatCard label="This week" value={formatCents(revenue.revenueThisWeek ?? 0)} />
                <StatCard label="This month" value={formatCents(revenue.revenueThisMonth)} />
                <StatCard label="This year" value={formatCents(revenue.revenueThisYear ?? 0)} />
              </div>

              <SectionCard title="Revenue chart">
                {revenueSeries.length > 0 ? (
                  <>
                    <div className="flex h-40 items-end gap-0.5">
                      {revenueSeries.map((d) => {
                        const maxR = Math.max(...revenueSeries.map((x) => x.revenue), 1);
                        const h = (d.revenue / maxR) * 100;
                        return (
                          <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end" title={d.date + ": " + formatCents(d.revenue)}>
                            <div className="w-full rounded-t bg-indigo-500 transition-all group-hover:bg-indigo-400 dark:bg-indigo-600" style={{ height: Math.max(h, d.revenue > 0 ? 4 : 1) + "%" }} />
                            <div className="absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-zinc-800 px-2 py-1 text-[10px] text-white group-hover:block">{"$" + (d.revenue / 100).toFixed(2)}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-zinc-400">Est. MRR: {formatCents(Math.round(mrr))} · Pro: {revenue.proSubscribers} · Monthly: {revenue.monthlySubscribers} · Yearly: {revenue.yearlySubscribers}</p>
                  </>
                ) : (
                  <p className="py-4 text-center text-sm text-zinc-400">No revenue data for this period.</p>
                )}
              </SectionCard>

              <SectionCard title="Recent subscription events">
                <div className="max-h-64 overflow-auto -mx-5 -mb-5">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">When</th><th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">User</th><th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Plan</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Amount</th><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Event</th></tr></thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {subscriptionEvents.map((e) => (
                        <tr key={e.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                          <td className="px-5 py-2.5 text-xs text-zinc-500">{formatDate(e.created_at)}</td>
                          <td className="px-4 py-2.5"><span className="text-zinc-900 dark:text-zinc-100">{e.user_name ?? "—"}</span>{e.user_email && <span className="ml-1.5 text-xs text-zinc-400">{e.user_email}</span>}</td>
                          <td className="px-4 py-2.5 font-medium">{e.plan}</td>
                          <td className="px-4 py-2.5 text-right font-mono">{formatCents(e.amount_cents)}</td>
                          <td className="px-5 py-2.5 font-mono text-xs text-zinc-500">{e.event_type}</td>
                        </tr>
                      ))}
                      {subscriptionEvents.length === 0 && <EmptyRow cols={5} text="No events yet." />}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ═══════ EXAMS TAB ════════════════════════════════════════════════ */}
          {tab === "exams" && (
            <div className="space-y-5">
              <SectionCard title="Exam settings" description="Questions and duration per language. Changes apply to new attempts.">
                {examSettings === null ? (
                  <div className="flex items-center gap-3 py-4"><Spinner /><span className="text-sm text-zinc-400">Loading…</span></div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-zinc-200 dark:border-zinc-700"><th className="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Language</th><th className="pb-2 pr-4 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Questions</th><th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Duration (min)</th></tr></thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {["go", "python", "javascript", "java", "rust", "cpp"].map((lang) => {
                            const cfg = examSettings[lang] ?? { examSize: 40, examDurationMinutes: 45 };
                            const name = { go: "Go", python: "Python", javascript: "JavaScript", java: "Java", rust: "Rust", cpp: "C++" }[lang] ?? lang;
                            return (
                              <tr key={lang}>
                                <td className="py-2.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100">{name}</td>
                                <td className="py-2.5 pr-4 text-right"><input type="number" min={1} max={200} value={cfg.examSize} onChange={(e) => setExamSettings((s) => s ? { ...s, [lang]: { ...cfg, examSize: Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)) } } : s)} className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" /></td>
                                <td className="py-2.5 text-right"><input type="number" min={5} max={180} value={cfg.examDurationMinutes} onChange={(e) => setExamSettings((s) => s ? { ...s, [lang]: { ...cfg, examDurationMinutes: Math.max(5, Math.min(180, parseInt(e.target.value, 10) || 5)) } } : s)} className="w-20 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-right text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <SaveButton saving={examSettingsSaving} label="Save settings" onClick={async () => {
                        if (!examSettings) return;
                        setExamSettingsSaving(true); setExamSettingsMessage(null);
                        try {
                          const res = await fetch("/api/admin/exam-settings", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: examSettings }) });
                          const data = await res.json();
                          if (res.ok) { setExamSettings(data); setExamSettingsMessage("Saved."); setTimeout(() => setExamSettingsMessage(null), 3000); }
                          else setExamSettingsMessage(data.error ?? "Save failed");
                        } catch (e) { setExamSettingsMessage(String(e)); } finally { setExamSettingsSaving(false); }
                      }} />
                      <SaveFeedback message={examSettingsMessage} />
                    </div>
                  </>
                )}
              </SectionCard>

              {examStatsLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center"><Spinner /><span className="text-sm text-zinc-400">Loading exam stats…</span></div>
              ) : examStats ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Total questions" value={examStats.totalQuestions} />
                    <StatCard label="Exam attempts" value={examStats.totalAttempts} />
                    <StatCard label="Pass rate" value={examStats.totalAttempts > 0 ? examStats.passRatePercent + "%" : "—"} />
                    <StatCard label="Certificates" value={examStats.certificatesIssued} />
                  </div>

                  <SectionCard title="Stats by language">
                    <div className="overflow-auto -mx-5 -mb-5">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Lang</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Questions</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Attempts</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Passed</th><th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Certs</th><th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">Pass %</th></tr></thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {examStats.questionsByLang.length === 0
                            ? <EmptyRow cols={6} text="No questions yet. Upload below." />
                            : examStats.questionsByLang.map((r) => (
                              <tr key={r.lang} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                                <td className="px-5 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">{r.lang}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{r.question_count}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{r.attempt_count}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{r.passed_count}</td>
                                <td className="px-4 py-2.5 text-right font-mono">{r.certificates_count}</td>
                                <td className="px-5 py-2.5 text-right">{r.attempt_count > 0 ? Math.round((r.passed_count / r.attempt_count) * 100) + "%" : "—"}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </>
              ) : null}

              <SectionCard title="Bulk upload questions" description="CSV columns: lang, prompt, choice1–4, correct_index (0–3), explanation. JSON: { questions: [...] }">
                <div className="flex flex-wrap items-center gap-3">
                  <input type="file" accept=".csv,.json,text/csv,application/json" onChange={(e) => { setExamUploadFile(e.target.files?.[0] ?? null); setExamUploadResult(null); }} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:file:bg-indigo-900/30 dark:file:text-indigo-400" />
                  <SaveButton saving={examUploading} label="Upload" savingLabel="Uploading…" onClick={async () => {
                    if (!examUploadFile) return;
                    setExamUploading(true); setExamUploadResult(null);
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
                  }} />
                </div>
                {examUploadResult && (
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Inserted: {examUploadResult.inserted}</p>
                    {examUploadResult.errors.length > 0 && (
                      <ul className="mt-1.5 list-inside list-disc text-xs text-amber-700 dark:text-amber-400">
                        {examUploadResult.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                        {examUploadResult.errors.length > 10 && <li>… and {examUploadResult.errors.length - 10} more</li>}
                      </ul>
                    )}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════ BANNER TAB ═══════════════════════════════════════════════ */}
          {tab === "banner" && (
            <div className="max-w-2xl">
              <SectionCard title="Announcement banner" description="Displays a message below the header for all users. Users can dismiss it for the session.">
                {bannerData === null ? (
                  <div className="flex items-center gap-3 py-4"><Spinner /><span className="text-sm text-zinc-400">Loading…</span></div>
                ) : (
                  <div className="space-y-4">
                    <label className="flex items-center gap-2.5">
                      <input type="checkbox" checked={bannerData.enabled} onChange={(e) => setBannerData((b) => b ? { ...b, enabled: e.target.checked } : b)} className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Banner enabled</span>
                      {bannerData.enabled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">Live</span>}
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Message</span>
                        <textarea value={bannerData.message} onChange={(e) => setBannerData((b) => b ? { ...b, message: e.target.value } : b)} placeholder="e.g. 80% off this week!" rows={2} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                      </label>
                      <div className="space-y-3">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Link URL</span>
                          <input type="text" value={bannerData.linkUrl} onChange={(e) => setBannerData((b) => b ? { ...b, linkUrl: e.target.value } : b)} placeholder="/pricing" className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                        </label>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Link text</span>
                          <input type="text" value={bannerData.linkText} onChange={(e) => setBannerData((b) => b ? { ...b, linkText: e.target.value } : b)} placeholder="Sign up" className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <SaveButton saving={bannerSaving} label="Save banner" onClick={async () => {
                        if (!bannerData) return;
                        setBannerSaving(true); setBannerMessage(null);
                        try {
                          const res = await fetch("/api/admin/banner", { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: bannerData.enabled, message: bannerData.message, linkUrl: bannerData.linkUrl || "/", linkText: bannerData.linkText || "Sign up" }) });
                          const data = await res.json();
                          if (res.ok) { setBannerData({ enabled: !!data.enabled, message: data.message ?? "", linkUrl: data.linkUrl ?? "/", linkText: data.linkText ?? "Sign up" }); setBannerMessage("Saved."); setTimeout(() => setBannerMessage(null), 3000); }
                          else setBannerMessage(data.error ?? "Save failed");
                        } catch (e) { setBannerMessage(String(e)); } finally { setBannerSaving(false); }
                      }} />
                      <SaveFeedback message={bannerMessage} />
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════ SETTINGS TAB ═════════════════════════════════════════════ */}
          {tab === "settings" && (
            <div className="max-w-2xl">
              <SectionCard title="Exam configuration" description="The pass threshold applies globally to all exams. Changes take effect immediately.">
                {siteSettings === null ? (
                  <div className="flex items-center gap-3 py-4"><Spinner /><span className="text-sm text-zinc-400">Loading…</span></div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Pass threshold (%)</label>
                      <div className="flex items-center gap-4">
                        <input type="number" min={1} max={100} value={siteSettings.exam_pass_percent} onChange={(e) => setSiteSettings((s) => s ? { ...s, exam_pass_percent: e.target.value } : s)} className="w-24 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-right font-mono dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200" />
                        <div className="flex-1">
                          <p className="text-sm text-zinc-600 dark:text-zinc-300">Minimum score to pass</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">Users must score at least this % to earn a certificate.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                      <SaveButton saving={siteSettingsSaving} label="Save" onClick={async () => {
                        if (!siteSettings) return;
                        setSiteSettingsSaving(true); setSiteSettingsMessage(null);
                        try {
                          const res = await fetch("/api/admin/site-settings", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(siteSettings) });
                          const data = await res.json();
                          if (res.ok) { setSiteSettings({ exam_pass_percent: data.exam_pass_percent ?? siteSettings.exam_pass_percent }); setSiteSettingsMessage("Saved."); setTimeout(() => setSiteSettingsMessage(null), 3000); }
                          else setSiteSettingsMessage(data.error ?? "Save failed");
                        } catch (e) { setSiteSettingsMessage(String(e)); } finally { setSiteSettingsSaving(false); }
                      }} />
                      <SaveFeedback message={siteSettingsMessage} />
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ═══════ AUDIT TAB ════════════════════════════════════════════════ */}
          {tab === "audit" && (
            <SectionCard title="Admin action log">
              <div className="max-h-[calc(100vh-20rem)] overflow-auto -mx-5 -mb-5">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-900"><tr><th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Action</th><th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Admin</th><th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">Target</th><th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400">When</th></tr></thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {auditLog.map((entry) => (
                      <tr key={entry.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-2.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">{entry.action}</td>
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.admin_name ?? "—"}</td>
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{entry.target_name ?? "—"}</td>
                        <td className="px-5 py-2.5 text-right text-xs text-zinc-400">{formatDate(entry.created_at)}</td>
                      </tr>
                    ))}
                    {auditLog.length === 0 && <EmptyRow cols={4} text="No admin actions yet." />}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

        </div>
      </main>

      <div ref={printRef} className="hidden" aria-hidden />
    </div>
  );
}
