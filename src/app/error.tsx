"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4 p-8"
      role="alert"
      aria-live="assertive"
    >
      <span className="text-5xl" aria-hidden>
        😵
      </span>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="max-w-md text-center text-sm text-zinc-500">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-zinc-400">Error ID: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-indigo-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-800"
        aria-label="Try again to reload the page"
      >
        Try Again
      </button>
    </div>
  );
}
