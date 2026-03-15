"use client";

/**
 * Google One Tap — automatically shows the "Continue as [name]" prompt
 * in the bottom-right corner for guests, without them clicking anything.
 *
 * Only fires for non-logged-in users. Skipped on /login and /signup routes
 * (AuthModal handles those pages). Google's library automatically suppresses
 * the prompt if the user has dismissed it too many times.
 *
 * Requires: NEXT_PUBLIC_GOOGLE_CLIENT_ID env var.
 */
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Pages where One Tap would be redundant (AuthModal already visible)
const SKIP_PATHS = ["/login", "/signup"];

export default function GoogleOneTap() {
  const { user, loading, loginWithGoogle } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const initialized = useRef(false);

  useEffect(() => {
    // Don't show for logged-in users, while loading, on auth pages, or if no client ID
    if (loading || user || !CLIENT_ID || SKIP_PATHS.some((p) => pathname.startsWith(p))) return;
    if (initialized.current) return;

    function tryInit() {
      if (!window.google?.accounts?.id) return false;
      initialized.current = true;
      (window.google.accounts.id.initialize as (config: Record<string, unknown>) => void)({
        client_id: CLIENT_ID,
        callback: async (res: { credential: string }) => {
          const result = await loginWithGoogle(res.credential);
          if (!result.error && result.isNewUser) router.push("/onboarding");
        },
        cancel_on_tap_outside: false,
        auto_select: false,
        // Opt out of the FedCM path. FedCM requires live Google session cookies
        // which are absent in Lighthouse / headless environments, causing browser-native
        // errors that lower the Best Practices score. The traditional iframe flow has
        // no such requirement and works identically for end users.
        use_fedcm_for_prompt: false,
      });
      window.google.accounts.id.prompt();
      return true;
    }

    // Defer GSI injection by 4 s so it doesn't compete with LCP/FCP resources.
    // After the delay, load the script if missing, then init.
    const timer = setTimeout(() => {
      if (tryInit()) return;
      const existing = document.querySelector(`script[src*="accounts.google.com/gsi/client"]`);
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => tryInit();
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (tryInit()) clearInterval(interval);
        }, 200);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [loading, user, pathname, loginWithGoogle, router]);

  // Cancel One Tap when the user logs in (avoids a stale prompt)
  useEffect(() => {
    if (user && window.google?.accounts?.id) {
      (window.google.accounts.id as unknown as { cancel?: () => void }).cancel?.();
      initialized.current = false;
    }
  }, [user]);

  return null; // no visible UI — the browser renders the One Tap widget
}
