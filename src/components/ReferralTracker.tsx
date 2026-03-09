"use client";

/**
 * Reads `?ref=CODE` from the URL and persists it to localStorage.
 * Runs silently in the root layout — no visible output.
 * The referral code is picked up by AuthModal during signup.
 */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "ubyte_ref";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CODE_RE = /^[a-z0-9]{6,16}$/i;

export default function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && CODE_RE.test(ref)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ code: ref, expires: Date.now() + TTL_MS })
      );
    }
  }, [searchParams]);

  return null;
}

/** Read and validate the stored referral code. Returns null if expired or absent. */
export function readStoredReferralCode(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { code, expires } = JSON.parse(raw) as { code: string; expires: number };
    if (Date.now() > expires) { localStorage.removeItem(STORAGE_KEY); return null; }
    return CODE_RE.test(code) ? code : null;
  } catch {
    return null;
  }
}

/** Clear after a successful signup so it can't be reused. */
export function clearStoredReferralCode(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
}
