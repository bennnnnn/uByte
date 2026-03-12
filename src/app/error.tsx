"use client";

// Route-level error boundary — catches unhandled errors thrown within the app layout.
// global-error.tsx handles errors thrown by the root layout itself.

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report every client-side unhandled error to Sentry automatically.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Warning icon — more professional than an emoji */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
        <svg className="h-7 w-7 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h2>
        <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          An unexpected error occurred. If the problem persists, please contact support.
        </p>
        {/* Digest is a hashed error ID Next.js generates — useful for correlating with Sentry */}
        {error.digest && (
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Reference: <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono dark:bg-zinc-800">{error.digest}</code>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Try again
        </button>
        {/* Fallback if retry doesn't help — give the user an escape route */}
        <a
          href="/"
          className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
