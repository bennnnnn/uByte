"use client";

import { Suspense, useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ReferralSection from "@/components/profile/ReferralSection";
import AccountShell from "@/components/profile/AccountShell";
import { isActiveSubscriber } from "@/lib/plans";

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
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) startTransition(() => { router.push("/"); });
  }, [user, loading, router]);

  // Fetch the user's current plan to check if they're an active subscriber.
  useEffect(() => {
    if (!user) return;
    fetch("/api/profile", { credentials: "same-origin" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setPlan((d?.plan as string) ?? "free"); })
      .catch(() => { setPlan("free"); });
  }, [user]);

  if (loading || !user || plan === null) return <ReferralSkeleton />;

  // Active subscribers: redirect to billing — showing the earn-30-days offer
  // could incentivise them to cancel their subscription to claim the reward.
  if (isActiveSubscriber(plan)) {
    startTransition(() => { router.replace("/dashboard?tab=billing"); });
    return <ReferralSkeleton />;
  }

  return (
    <AccountShell>
      <div className="max-w-2xl">
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
    </AccountShell>
  );
}
