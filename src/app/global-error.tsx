"use client";

// Global error boundary — catches errors thrown in the root layout or root template.
// Renders OUTSIDE the normal Next.js layout tree, so Tailwind CSS and custom fonts
// are NOT available here. Use inline styles only.
// Note: NextError (next/error) is deprecated in Next.js 15+ — do not import it.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sentry SDK is loaded via next.config instrumentation; access via window as a safe fallback.
    // Cannot import @sentry/nextjs directly here because this component may render before
    // Sentry's instrumentation hook initialises the full SDK.
    const w = window as unknown as { Sentry?: { captureException: (e: unknown) => void } };
    if (typeof window !== "undefined" && w.Sentry) {
      w.Sentry.captureException(error);
    } else {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#fafafa",
            color: "#18181b",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            {/* SVG icon — no emoji so it renders consistently across OS/browser */}
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: "#fee2e2", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"
                stroke="#dc2626" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Something went wrong
            </h1>
            <p style={{ color: "#71717a", marginBottom: 8, lineHeight: 1.6, fontSize: 14 }}>
              An unexpected error occurred. Our team has been notified.
            </p>

            {/* Digest lets support correlate this with server logs / Sentry */}
            {error.digest && (
              <p style={{ color: "#a1a1aa", fontSize: 12, marginBottom: 24 }}>
                Reference:{" "}
                <code style={{
                  background: "#f4f4f5", padding: "2px 6px",
                  borderRadius: 4, fontFamily: "monospace",
                }}>
                  {error.digest}
                </code>
              </p>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "10px 22px", background: "#4f46e5", color: "#fff",
                  border: "none", borderRadius: 10, fontWeight: 600,
                  cursor: "pointer", fontSize: 14,
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "10px 22px", background: "#fff", color: "#3f3f46",
                  border: "1px solid #e4e4e7", borderRadius: 10, fontWeight: 600,
                  textDecoration: "none", fontSize: 14,
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
