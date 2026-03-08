"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/** Returns true for Next.js special navigation errors that must not be swallowed. */
function isNextNavigationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { digest?: string; message?: string };
  // notFound() throws NEXT_NOT_FOUND; redirect() throws NEXT_REDIRECT_*
  if (e.digest === "NEXT_NOT_FOUND") return true;
  if (typeof e.digest === "string" && e.digest.startsWith("NEXT_REDIRECT")) return true;
  return false;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): State {
    // Re-throw Next.js navigation errors so the framework handles them correctly
    if (isNextNavigationError(error)) throw error;
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (isNextNavigationError(error)) return;
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8" role="alert" aria-live="assertive">
          <span className="text-4xl" aria-hidden>😵</span>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-500">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
            aria-label="Reload the page"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
