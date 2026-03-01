"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <span className="text-5xl">😵</span>
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
        onClick={reset}
        className="rounded-lg bg-indigo-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-800"
      >
        Try Again
      </button>
    </div>
  );
}
