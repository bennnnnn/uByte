"use client";

import { Suspense, useEffect, useState, useCallback, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import PlanTab from "@/components/profile/PlanTab";
import ReferralSection from "@/components/profile/ReferralSection";
import type { Profile } from "@/components/profile/types";

/* ── Skeleton ──────────────────────────────────────────────────────────── */
function BillingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12 sm:px-6">
      <div className="mb-8 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-10 h-8 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-8 h-32 rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
      <div className="mb-6 h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-24 rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
    </div>
  );
}

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingPage />
    </Suspense>
  );
}

/* ── Section divider ───────────────────────────────────────────────────── */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-6 mt-10 flex items-center gap-4">
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800" />
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
function BillingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const planSuccess = searchParams.get("plan") === "success";

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (res.status === 401) { router.push("/"); return; }
      if (!res.ok) { setError("Failed to load billing info."); return; }
      const data = await res.json() as { profile?: Profile };
      if (data.profile) setProfile(data.profile);
    } catch {
      setError("Failed to load billing info.");
    }
  }, [router]);

  useEffect(() => {
    if (!loading && !user) { router.push("/"); return; }
    if (user) startTransition(() => { void fetchProfile(); });
  }, [user, loading, router, fetchProfile]);

  if (loading || (!profile && !error)) return <BillingSkeleton />;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={() => void fetchProfile()}
          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return <BillingSkeleton />;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Billing</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your plan and earn free Pro time by referring friends.
          </p>
        </div>

        {/* Plan success banner */}
        {planSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">Payment successful. Welcome to Pro!</p>
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Your plan is now active. Check your email for a receipt.</p>
          </div>
        )}

        {/* ── Plan ─────────────────────────────────────────────────────── */}
        <PlanTab plan={profile.plan} expiresAtProp={profile.subscription_expires_at} />

        {/* ── Refer & Earn ─────────────────────────────────────────────── */}
        <SectionDivider label="Refer & Earn" />
        <ReferralSection />

        <div className="h-12" />
      </div>
    </div>
  );
}
