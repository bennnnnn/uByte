"use client";

import { useState, useEffect } from "react";

/** Renders children only after the main thread is idle (or after a short timeout). Reduces main-thread contention during LCP. */
export default function DeferUntilIdle({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 1);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
