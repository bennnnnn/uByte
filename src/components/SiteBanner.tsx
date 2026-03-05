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
      className="relative z-30 shrink-0 border-b border-zinc-200/80 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 sm:px-6">
        {/* Accent bar — modern left stripe */}
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 dark:bg-indigo-500" aria-hidden />

        <p className="text-center text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
          {banner.message}
          {" · "}
          <Link
            href={banner.linkUrl}
            className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 underline decoration-indigo-600/40 underline-offset-2 transition-colors hover:text-indigo-700 hover:decoration-indigo-600 dark:text-indigo-400 dark:decoration-indigo-400/50 dark:hover:text-indigo-300 dark:hover:decoration-indigo-400"
          >
            {banner.linkText}
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 sm:right-4"
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
