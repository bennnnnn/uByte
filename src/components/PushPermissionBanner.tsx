"use client";

/**
 * Asks logged-in users to enable streak reminder push notifications.
 * Shown once (after dismissal stores flag in localStorage).
 * Only rendered after a meaningful engagement (streak ≥ 1 day or ≥ 3 completed steps).
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api-client";

const DISMISSED_KEY = "ubyte_push_dismissed";
// NEXT_PUBLIC_VAPID_PUBLIC_KEY must match VAPID_PUBLIC_KEY in server env
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const bytes = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

export default function PushPermissionBanner() {
  const { user, profile } = useAuth();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  useEffect(() => {
    if (!user || !VAPID_PUBLIC_KEY) return;
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return; // already decided
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Show only when user has some engagement (streak ≥ 1 or profile loaded)
    if (profile && (profile.streak_days >= 1 || profile.xp >= 10)) {
      // Small delay so it doesn't pop up on first page load
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }
  }, [user, profile]);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  };

  const enable = async () => {
    if (!VAPID_PUBLIC_KEY) { dismiss(); return; }
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("denied"); dismiss(); return; }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      await apiFetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, keys }),
      });
      setStatus("granted");
      setTimeout(dismiss, 2000);
    } catch {
      setStatus("denied");
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-slide-up rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:bottom-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl dark:bg-indigo-950">
          🔥
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Don&apos;t lose your streak!
          </p>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Get a reminder before your daily streak resets.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        {status === "granted" ? (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Notifications enabled!</p>
        ) : (
          <>
            <button
              type="button"
              onClick={enable}
              disabled={status === "loading"}
              className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {status === "loading" ? "Enabling…" : "Enable reminders"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Not now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
