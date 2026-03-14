"use client";

/**
 * DeferredWidgets — wraps all non-critical layout components in a single
 * "use client" boundary so we can use `dynamic + ssr:false` legally.
 * Each component is loaded in its own lazy chunk after hydration,
 * keeping them out of the critical JS bundle.
 */
import dynamic from "next/dynamic";

const TrialBanner             = dynamic(() => import("@/components/TrialBanner"),             { ssr: false, loading: () => null });
const EmailVerificationBanner = dynamic(() => import("@/components/EmailVerificationBanner"),  { ssr: false, loading: () => null });
const ReferralTracker         = dynamic(() => import("@/components/ReferralTracker"),          { ssr: false, loading: () => null });
const PostHogProvider         = dynamic(() => import("@/components/PostHogProvider"),          { ssr: false, loading: () => null });
const GoogleOneTap            = dynamic(() => import("@/components/GoogleOneTap"),             { ssr: false, loading: () => null });
const OnboardingChecklist     = dynamic(() => import("@/components/OnboardingChecklist"),      { ssr: false, loading: () => null });
const PushPermissionBanner    = dynamic(() => import("@/components/PushPermissionBanner"),     { ssr: false, loading: () => null });

export default function DeferredWidgets() {
  return (
    <>
      <TrialBanner />
      <EmailVerificationBanner />
      <ReferralTracker />
      <PostHogProvider />
      <GoogleOneTap />
      <OnboardingChecklist />
      <PushPermissionBanner />
    </>
  );
}
