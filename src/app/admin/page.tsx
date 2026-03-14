/**
 * Admin dashboard — thin orchestrator.
 *
 * All business logic lives in hooks.ts, shared UI primitives in
 * components.tsx, and each tab panel in tabs/. This file wires them
 * together: sidebar navigation, header, and the active tab.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAdminData } from "./hooks";
import { Spinner, TabIcon } from "./components";
import { TAB_LABELS, LIMITED_ADMIN_TABS } from "./types";
import type { Tab } from "./types";
import { UsersTab, AnalyticsTab, RevenueTab, GrowthTab, ExamsTab, BannerTab, AuditTab, BlogTab, MessagesTab, InterviewsTab, AdminsTab, SiteSettingsTab } from "./tabs";

/* ── Tab header subtitles (concise one-liners per tab) ───────────────────── */
const TAB_SUBTITLES: Record<Tab, string> = {
  users:           "Registered users",
  analytics:       "Tutorial completions & practice stats",
  revenue:         "Income, subscribers & billing events",
  growth:          "Conversion funnel, signup trend & churn signals",
  audit:           "Admin action history",
  exams:           "Questions, attempts, pass threshold, settings & upload",
  banner:          "Site-wide announcement banner",
  blog:            "Create and edit blog posts without touching the repo",
  messages:        "Contact form submissions from users",
  interviews:      "Moderate user-submitted interview experiences",
  admins:          "Manage admin access and roles",
  "site-settings": "Global site configuration",
};

/* ── Full sidebar section definitions (super admin sees all) ─────────────── */
const ALL_SIDEBAR_SECTIONS: { label: string; tabs: Tab[] }[] = [
  { label: "Overview", tabs: ["users", "analytics", "revenue", "growth"] },
  { label: "Manage",   tabs: ["exams", "banner", "blog", "interviews"] },
  { label: "Inbox",    tabs: ["messages"] },
  { label: "History",  tabs: ["audit"] },
  { label: "Admin",    tabs: ["admins", "site-settings"] },
];

/* ── Active tab button classes (shared between sidebar groups) ────────────── */
const activeCls  = "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400";
const defaultCls = "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200";

export default function AdminPage() {
  const data = useAdminData();
  const { user, loading, fetching, error, router, tab, setTab, query, setQuery, users, revenue, revenuePeriod, setRevenuePeriod, exportRevenueCSV, printRevenuePDF, exportUsersCSV, printRef, currentAdminRole } = data;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSuperAdmin = !currentAdminRole || currentAdminRole === "super";

  // Filter sidebar sections based on role
  const sidebarSections = useMemo(() => {
    if (isSuperAdmin) return ALL_SIDEBAR_SECTIONS;
    return ALL_SIDEBAR_SECTIONS
      .map((s) => ({ ...s, tabs: s.tabs.filter((t) => LIMITED_ADMIN_TABS.includes(t)) }))
      .filter((s) => s.tabs.length > 0);
  }, [isSuperAdmin]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [tab]);

  /* ── Full-page loading state ──────────────────────────────────────────── */
  if (loading || fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-card">
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
      <div className="flex min-h-screen items-center justify-center bg-surface-card">
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

  /* ── Sidebar content (shared between desktop fixed + mobile drawer) ──── */
  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-100 px-5 dark:border-zinc-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" aria-hidden>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </span>
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</span>
        {/* Close button — only visible on mobile */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 md:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="Close menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {/* Role badge */}
        {currentAdminRole && (
          <div className={`mx-3 mb-4 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
            isSuperAdmin
              ? "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400"
              : "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
          }`}>
            {isSuperAdmin ? "⭐ Super admin" : "🔒 Limited admin"}
          </div>
        )}
        {sidebarSections.map((section, idx) => (
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

      <div className="border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400" title={user?.email ?? ""}>{user?.email}</p>
        <Link href="/" className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          Exit admin
        </Link>
      </div>
    </>
  );

  /* ── Dashboard layout ─────────────────────────────────────────────────── */
  return (
    <div className="flex h-full bg-surface-card">

      {/* ── Desktop sidebar (hidden on mobile) ──────────────────────────── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-900">
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl md:hidden dark:bg-zinc-900">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ── Main content area ──────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="shrink-0 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-zinc-900 sm:text-lg dark:text-zinc-100">{TAB_LABELS[tab]}</h1>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                {tab === "users" ? `${users.length} ${TAB_SUBTITLES["users"]}` : TAB_SUBTITLES[tab]}
              </p>
            </div>

            {/* Tab-specific controls */}
            {tab === "users" && (
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative hidden sm:block">
                  <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" aria-label="Search users" className="w-40 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 lg:w-48 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30" />
                </div>
                <HeaderButton onClick={exportUsersCSV}>CSV</HeaderButton>
              </div>
            )}

            {tab === "revenue" && revenue && (
              <div className="flex shrink-0 items-center gap-2">
                <select value={revenuePeriod} onChange={(e) => setRevenuePeriod(e.target.value as typeof revenuePeriod)} className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 focus:border-indigo-300 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <option value="7days">7d</option>
                  <option value="month">1m</option>
                  <option value="year">1y</option>
                </select>
                <HeaderButton onClick={exportRevenueCSV}>CSV</HeaderButton>
                <HeaderButton onClick={printRevenuePDF} className="hidden sm:inline-flex">Print</HeaderButton>
              </div>
            )}
          </div>

          {/* Mobile search — shown below header for users tab */}
          {tab === "users" && (
            <div className="mt-3 sm:hidden">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" aria-label="Search users" className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-8 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-900/30" />
              </div>
            </div>
          )}
        </header>

        {/* Active tab content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {tab === "users"          && <UsersTab        data={data} />}
          {tab === "analytics"      && <AnalyticsTab    data={data} />}
          {tab === "revenue"        && <RevenueTab      data={data} />}
          {tab === "growth"         && <GrowthTab       data={data} />}
          {tab === "exams"          && <ExamsTab        data={data} />}
          {tab === "banner"         && <BannerTab       data={data} />}
          {tab === "audit"          && <AuditTab        data={data} />}
          {tab === "blog"           && <BlogTab />}
          {tab === "messages"       && <MessagesTab />}
          {tab === "interviews"     && <InterviewsTab />}
          {tab === "admins"         && <AdminsTab       data={data} />}
          {tab === "site-settings"  && <SiteSettingsTab />}
        </div>
      </main>

      {/* Hidden element used by printRevenuePDF */}
      <div ref={printRef} className="hidden" aria-hidden />
    </div>
  );
}

/* ── Small header toolbar button (reused across tabs) ────────────────────── */

function HeaderButton({ onClick, children, className = "" }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 ${className}`}
    >
      {children}
    </button>
  );
}
