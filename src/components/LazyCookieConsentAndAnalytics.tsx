"use client";

import dynamic from "next/dynamic";

const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })),
  { ssr: false }
);

export default function LazyCookieConsentAndAnalytics() {
  return (
    <>
      <CookieConsent />
      <Analytics />
    </>
  );
}
