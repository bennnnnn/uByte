"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export type ConsentChoice = "accepted" | "rejected";

/** Read consent state. Returns null if the user hasn't decided yet. */
export function getConsentChoice(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem("cookie-consent");
  if (val === "accepted" || val === "rejected") return val;
  return null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getConsentChoice()) setVisible(true);
  }, []);

  function choose(choice: ConsentChoice) {
    localStorage.setItem("cookie-consent", choice);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: choice }));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white px-6 py-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We use essential cookies for authentication and optional analytics cookies to improve the site.{" "}
          <Link href="/privacy" className="underline hover:text-indigo-600">
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("rejected")}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Essential only
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
