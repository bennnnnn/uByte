"use client";

/**
 * PostHogProvider — initialises PostHog once per session and auto-tracks
 * page views on every client-side route change.
 *
 * Requires env vars (set in Vercel / .env.local):
 *   NEXT_PUBLIC_POSTHOG_KEY   — from posthog.com → Project Settings → API Keys
 *   NEXT_PUBLIC_POSTHOG_HOST  — optional, defaults to https://us.i.posthog.com
 *
 * Gracefully no-ops when NEXT_PUBLIC_POSTHOG_KEY is not set, so local dev
 * works without any config.
 *
 * We do NOT call posthog.init() here — init is done lazily in analytics.ts
 * getPostHog() to avoid loading posthog-js for every SSR request. This
 * component only subscribes to pathname changes to fire $pageview.
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPostHog } from "@/lib/analytics";
import { useAuth } from "./AuthProvider";

export default function PostHogProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const lastPath = useRef<string | null>(null);

  // Identify the user when they log in so PostHog links events to their account
  useEffect(() => {
    if (!user) return;
    const ph = getPostHog();
    if (!ph) return;
    ph.identify(String(user.id), { email: user.email, name: user.name });
  }, [user]);

  // Reset identity on logout
  useEffect(() => {
    if (user) return;
    const ph = getPostHog();
    if (!ph) return;
    ph.reset();
  }, [user]);

  // Track page views on every navigation
  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    if (url === lastPath.current) return;
    lastPath.current = url;
    const ph = getPostHog();
    if (!ph) return;
    ph.capture("$pageview", { $current_url: window.location.href });
  }, [pathname, searchParams]);

  return null;
}
