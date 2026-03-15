/**
 * Client-side analytics — Vercel Analytics + PostHog.
 *
 * PostHog is initialised lazily on first call so it never runs server-side.
 * Vercel Analytics fires via the existing window.va shim.
 *
 * PostHog env vars (set in Vercel / .env.local):
 *   NEXT_PUBLIC_POSTHOG_KEY   — project API key from posthog.com
 *   NEXT_PUBLIC_POSTHOG_HOST  — optional, defaults to https://us.i.posthog.com
 *
 * Keep events minimal — only the core conversion funnel:
 *   signup, login, viewed_pricing, clicked_upgrade,
 *   checkout_completed, started_tutorial, completed_tutorial,
 *   problem_solved, exam_passed
 */

import type { PostHog } from "posthog-js";
// PostHogInterface is what the loaded callback receives; it's compatible with PostHog for our usage.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PostHogLoaded = any;

export type ConversionEvent =
  | "viewed_pricing"
  | "clicked_upgrade"
  | "checkout_completed"
  | "started_tutorial"
  | "completed_tutorial"
  | "signup"
  | "login"
  | "problem_solved"
  | "exam_passed";

declare global {
  interface Window {
    va?: (event: string, payload?: Record<string, string | number | boolean>) => void;
  }
}

let _ph: PostHog | null = null;
let _initStarted = false;

/**
 * Returns the PostHog singleton, initialising it on first call.
 * Returns null when running server-side or when the API key isn't set.
 */
export function getPostHog(): PostHog | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (_ph) return _ph;
  if (_initStarted) return null;

  _initStarted = true;
  import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,  // we fire $pageview manually in PostHogProvider
        capture_pageleave: true,
        autocapture: false,       // keep it lean — only capture what we explicitly call
        persistence: "localStorage+cookie",
        loaded: (ph: PostHogLoaded) => {
          _ph = ph as PostHog;
        },
      });
    })
    .catch(() => {
      _initStarted = false;
    });

  return null;
}

export function trackConversion(
  event: ConversionEvent,
  payload?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    // Vercel Analytics
    if (window.va) window.va("event", { name: event, ...payload });

    // PostHog
    const ph = getPostHog();
    if (ph) ph.capture(event, payload);

  } catch {
    // never let analytics crash the app
  }
}
