/**
 * Admin dashboard — thin orchestrator.
 *
 * All business logic lives in hooks.ts, shared UI primitives in
 * components.tsx, and each tab panel in tabs/. This file wires them
 * together: sidebar navigation, header, and the active tab.
 */

"use client";

import Link from "next/link";
import { useAdminData } from "./hooks";
import { Spinner, TabIcon } from "./components";
import { TAB_LABELS } from "./types";
import type { Tab } from "./types";
import { UsersTab, AnalyticsTab, RevenueTab, ExamsTab, BannerTab, SettingsTab, AuditTab } from "./tabs";

/* ── Tab header subtitles (concise one-liners per tab) ───────────────────── */
const TAB_SUBTITLES: Record<Tab, string> = {
  users:     "registered users",
  analytics: "Tutorial completions & practice stats",
  revenue:   "Income, subscribers & billing events",
  audit:     "Admin action history",
  exams:     "Questions, attempts, settings & upload",
  banner:    "Site-wide announcement banner",
  settings:  "Global site configuration",
};

/* ── Sidebar section definitions ─────────────────────────────────────────── */
const SIDEBAR_SECTIONS: { label: string; tabs: Tab[] }[] = [
  { label: "Overview", tabs: ["users", "analytics", "revenue"] },
  { label: "Manage",   tabs: ["exams", "banner", "settings"] },
  { label: "History",  tabs: ["audit"] },
];

/* ── Active tab button classes (shared between sidebar groups) ────────────── */
const activeCls  = "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400";
const defaultCls = "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export default function AdminPage() {
  const data = useAdminData();
  const { user, loading, fetching, error, router, tab, setTab, query, setQuery, users, revenue, revenuePeriod, setRevenuePeriod, exportRevenueCSV, printRevenuePDF, exportUsersCSV, printRef } = data;

  /* ── Full-page loading state ──────────────────────────────────────────── */
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

  /* ── Full-page error state ────────────────────────────────────────────── */
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

  /* ── Dashboard layout: sidebar + main ─────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

        {/* Logo / branding strip */}
        <div className="flex h-14 items-center gap-2.5 border-b border-zinc-100 px-5 dark:border-zinc-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" aria-hidden>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</span>
        </div>

        {/* Navigation — grouped by section */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {SIDEBAR_SECTIONS.map((section, idx) => (
            <div key={section.label}>
              <p className={`${idx > 0 ? "mt-5 " : ""}mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600`}>
                {section.label}
              </p>
              {section.tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${tab === t ? activeCls : defaultCls}`}
                >
                  <TabIcon tab={t} />
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer — user email + exit link */}
        <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400" title={user?.email ?? ""}>{user?.email}</p>
          <Link href="/" className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            Exit admin
          </Link>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header — tab title, subtitle, and tab-specific controls */}
        <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{TAB_LABELS[tab]}</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {tab === "users" ? `${users.length} ${TAB_SUBTITLES[tab]}` : TAB_SUBTITLES[tab]}
            </p>
          </div>

          {/* Users tab: search + CSV export */}
          {tab === "users" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search users" className="w-48 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30" />
              </div>
              <HeaderButton onClick={exportUsersCSV}>Export CSV</HeaderButton>
            </div>
          )}

          {/* Revenue tab: period selector + export */}
          {tab === "revenue" && revenue && (
            <div className="flex items-center gap-2">
              <select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value as typeof revenuePeriod)} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <option value="7days">7 days</option>
                <option value="month">1 month</option>
                <option value="year">1 year</option>
              </select>
              <HeaderButton onClick={exportRevenueCSV}>CSV</HeaderButton>
              <HeaderButton onClick={printRevenuePDF}>Print</HeaderButton>
            </div>
          )}
        </header>

        {/* Active tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "users"     && <UsersTab     data={data} />}
          {tab === "analytics" && <AnalyticsTab data={data} />}
          {tab === "revenue"   && <RevenueTab   data={data} />}
          {tab === "exams"     && <ExamsTab     data={data} />}
          {tab === "banner"    && <BannerTab    data={data} />}
          {tab === "settings"  && <SettingsTab  data={data} />}
          {tab === "audit"     && <AuditTab     data={data} />}
        </div>
      </main>

      {/* Hidden element used by printRevenuePDF */}
      <div ref={printRef} className="hidden" aria-hidden />
    </div>
  );
}

/* ── Small header toolbar button (reused across tabs) ────────────────────── */

function HeaderButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
    >
      {children}
    </button>
  );
}
