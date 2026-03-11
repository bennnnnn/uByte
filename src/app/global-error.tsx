"use client";

import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry if available, otherwise console
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
            fontFamily: "sans-serif",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ maxWidth: 480 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#18181b",
                marginBottom: 8,
              }}
            >
              Something went wrong
            </h1>
            <p style={{ color: "#71717a", marginBottom: 24, lineHeight: 1.6 }}>
              An unexpected error occurred. Our team has been notified.
              {error.digest && (
                <>
                  {" "}
                  Reference:{" "}
                  <code
                    style={{
                      background: "#f4f4f5",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    {error.digest}
                  </code>
                </>
              )}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "10px 20px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#3f3f46",
                  border: "1px solid #e4e4e7",
                  borderRadius: 8,
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
        {/* Fallback for Next.js error display internals */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
