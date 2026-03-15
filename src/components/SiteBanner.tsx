"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export interface BannerData {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
}

interface Props {
  /** Pre-fetched server-side banner data. When provided the client-side fetch
   *  is skipped entirely, so the banner is in the initial SSR HTML and causes
   *  no layout shift. Falls back to a client fetch when omitted. */
  initialData?: BannerData | null;
}

export default function SiteBanner({ initialData }: Props = {}) {
  const { user } = useAuth();
  const [banner, setBanner] = useState<BannerData | null>(
    initialData?.enabled && initialData.message.trim() ? initialData : null,
  );
  const [dismissed, setDismissed] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Skip the client fetch when the server already provided data.
    if (initialData !== undefined || fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/banner", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.enabled && data?.message?.trim()) {
          setBanner({
            enabled: true,
            message: String(data.message).trim(),
            linkUrl: (data.linkUrl ?? "").trim(),
            linkText: (data.linkText ?? "").trim(),
          });
        }
      })
      .catch(() => {});
  }, [initialData]);

  if (!banner || dismissed) return null;

  // Don't show signup-style banners to logged-in users
  const isSignupCta =
    banner.linkUrl.toLowerCase().includes("signup") ||
    banner.linkText.toLowerCase() === "sign up";
  if (user && isSignupCta) return null;

  const showLink = banner.linkUrl.length > 0 && banner.linkText.length > 0;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className="relative z-30 shrink-0 border-b border-violet-200/70 bg-violet-50/80 dark:border-violet-900/50 dark:bg-violet-950/40"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 sm:px-6">
        <p className="text-center text-[13px] font-medium text-violet-900 dark:text-violet-100">
          {banner.message}
          {showLink && (
            <>
              {" · "}
              <Link
                href={banner.linkUrl}
                className="inline-flex items-center gap-0.5 font-semibold text-violet-600 underline decoration-violet-600/40 underline-offset-2 transition-colors hover:text-violet-700 hover:decoration-violet-600 dark:text-violet-300 dark:decoration-violet-400/50 dark:hover:text-violet-200 dark:hover:decoration-violet-400"
              >
                {banner.linkText}
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </>
          )}
        </p>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-violet-500 transition-colors hover:bg-violet-200/60 hover:text-violet-800 dark:text-violet-400 dark:hover:bg-violet-800/60 dark:hover:text-violet-200 sm:right-4"
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
