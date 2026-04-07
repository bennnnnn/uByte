"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export type BannerType = "announcement" | "promo" | "sale" | "info";

export interface BannerData {
  enabled: boolean;
  message: string;
  linkUrl: string;
  linkText: string;
  bannerType?: BannerType;
  bannerIcon?: string;
}

interface Props {
  /** Pre-fetched server-side banner data. Skips client-side fetch when provided. */
  initialData?: BannerData | null;
}

const TYPE_CONFIG: Record<
  BannerType,
  {
    gradient: string;
    defaultIcon: string;
    badgeLabel: string;
    badgeCls: string;
  }
> = {
  announcement: {
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    defaultIcon: "🎉",
    badgeLabel: "New",
    badgeCls: "bg-white/20 text-white border border-white/25",
  },
  promo: {
    gradient: "from-orange-500 via-rose-500 to-pink-600",
    defaultIcon: "🔥",
    badgeLabel: "Deal",
    badgeCls: "bg-white/20 text-white border border-white/25",
  },
  sale: {
    gradient: "from-red-500 via-red-600 to-orange-500",
    defaultIcon: "⚡",
    badgeLabel: "Sale",
    badgeCls: "bg-white/20 text-white border border-white/25",
  },
  info: {
    gradient: "from-sky-500 via-blue-500 to-blue-700",
    defaultIcon: "💡",
    badgeLabel: "Info",
    badgeCls: "bg-white/20 text-white border border-white/25",
  },
};

export default function SiteBanner({ initialData }: Props = {}) {
  const { user } = useAuth();
  const [banner, setBanner] = useState<BannerData | null>(
    initialData?.enabled && initialData.message.trim() ? initialData : null,
  );
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
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
            bannerType: data.bannerType ?? "announcement",
            bannerIcon: (data.bannerIcon ?? "").trim(),
          });
        }
      })
      .catch(() => {});
  }, [initialData]);

  // Fade in after mount to avoid FOUC
  useEffect(() => {
    if (banner && !dismissed) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
    setVisible(false);
  }, [banner, dismissed]);

  if (!banner || dismissed) return null;

  // Don't show signup CTAs to logged-in users
  const isSignupCta =
    banner.linkUrl.toLowerCase().includes("signup") ||
    banner.linkText.toLowerCase() === "sign up";
  if (user && isSignupCta) return null;

  const type = banner.bannerType ?? "announcement";
  const cfg = TYPE_CONFIG[type];
  const icon = banner.bannerIcon?.trim() || cfg.defaultIcon;
  const showLink = banner.linkUrl.length > 0 && banner.linkText.length > 0;

  return (
    <div
      role="region"
      aria-label="Site announcement"
      className={`relative z-30 shrink-0 bg-gradient-to-r ${cfg.gradient} transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}
    >
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2 sm:px-12">

        {/* Badge */}
        <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide sm:inline-flex ${cfg.badgeCls}`}>
          <span>{icon}</span>
          <span>{cfg.badgeLabel}</span>
        </span>

        {/* Mobile icon only */}
        <span className="shrink-0 text-sm sm:hidden">{icon}</span>

        {/* Message */}
        <p className="text-center text-[13px] font-medium leading-snug text-white">
          {banner.message}
        </p>

        {/* CTA pill */}
        {showLink && (
          <Link
            href={banner.linkUrl}
            className="hidden shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/30 transition-colors hover:bg-white/25 sm:inline-flex"
          >
            {banner.linkText}
            <svg className="h-3 w-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        )}

        {/* Mobile CTA inline with message */}
        {showLink && (
          <Link
            href={banner.linkUrl}
            className="shrink-0 text-[13px] font-semibold text-white underline decoration-white/50 underline-offset-2 sm:hidden"
          >
            {banner.linkText} →
          </Link>
        )}

        {/* Dismiss */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white sm:right-3"
          aria-label="Dismiss banner"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
