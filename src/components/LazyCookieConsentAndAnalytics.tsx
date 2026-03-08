"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getConsentChoice } from "@/components/CookieConsent";

const CookieConsent = dynamic(() => import("@/components/CookieConsent"), { ssr: false });
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((mod) => ({ default: mod.Analytics })),
  { ssr: false }
);

export default function LazyCookieConsentAndAnalytics() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (getConsentChoice() === "accepted") setAnalyticsEnabled(true);

    function onConsentChange(e: Event) {
      const choice = (e as CustomEvent<string>).detail;
      setAnalyticsEnabled(choice === "accepted");
    }

    window.addEventListener("cookie-consent-change", onConsentChange);
    return () => window.removeEventListener("cookie-consent-change", onConsentChange);
  }, []);

  return (
    <>
      <CookieConsent />
      {analyticsEnabled && <Analytics />}
    </>
  );
}
