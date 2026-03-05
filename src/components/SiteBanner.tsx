"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BannerData {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
}

export default function SiteBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/banner", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.enabled && data?.message?.trim()) {
          setBanner({
            enabled: true,
            message: String(data.message).trim(),
            linkUrl: data.linkUrl ?? "/",
            linkText: data.linkText?.trim() || "Sign up",
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!banner || dismissed) return null;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="relative z-30 shrink-0 overflow-hidden border-b border-amber-200/70 dark:border-amber-800/50"
    >
      {/* Fluid gradient — soft diagonal flow, works in light and dark */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:from-amber-950 dark:via-amber-900/95 dark:to-orange-950/90" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(254,243,199,0.6)_0%,transparent_40%,rgba(255,237,213,0.5)_100%)] dark:bg-[linear-gradient(135deg,rgba(69,26,3,0.4)_0%,transparent_50%,rgba(120,53,15,0.3)_100%)]" />
      {/* Subtle bottom edge for depth */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-b from-amber-300/40 to-transparent dark:from-amber-600/30" />

      <div className="relative flex items-center justify-center gap-3 px-4 py-3 text-center">
        <p className="text-sm font-medium text-amber-900 drop-shadow-sm dark:text-amber-100">
          {banner.message}
        </p>
        <Link
          href={banner.linkUrl}
          className="shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/30 transition-all duration-200 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 dark:from-amber-600 dark:to-amber-700 dark:shadow-amber-600/30 dark:hover:from-amber-500 dark:hover:to-amber-600"
        >
          {banner.linkText}
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1.5 text-amber-700/90 transition-all hover:bg-amber-200/60 hover:text-amber-800 dark:text-amber-300 dark:hover:bg-amber-700/40 dark:hover:text-amber-200"
          aria-label="Dismiss banner"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
