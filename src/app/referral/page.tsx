"use client";

import { Suspense, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ReferralSection from "@/components/profile/ReferralSection";

function ReferralSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-4 py-12 sm:px-6">
      <div className="mb-8 h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-10 h-8 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-40 rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900" />
    </div>
  );
}

export default function ReferralPageWrapper() {
  return (
    <Suspense fallback={<ReferralSkeleton />}>
      <ReferralPage />
    </Suspense>
  );
}

function ReferralPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) startTransition(() => { router.push("/"); });
  }, [user, loading, router]);

  if (loading || !user) return <ReferralSkeleton />;

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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Refer &amp; Earn</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Share your referral link and earn one free month of Pro for every friend who signs up.
          </p>
        </div>

        <ReferralSection />

        <div className="h-12" />
      </div>
    </div>
  );
}
