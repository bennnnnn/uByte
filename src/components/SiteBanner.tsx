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
      className="flex items-center justify-center gap-3 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/80 px-4 py-2.5 text-center dark:border-amber-800 dark:from-amber-950/50 dark:to-amber-900/30"
    >
      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
        {banner.message}
      </p>
      <Link
        href={banner.linkUrl}
        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
      >
        {banner.linkText}
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-1 text-amber-700 transition-colors hover:bg-amber-200/80 dark:text-amber-300 dark:hover:bg-amber-800/80"
        aria-label="Dismiss banner"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
