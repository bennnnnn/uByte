"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// HeroIDE is only shown on lg+ screens. We gate the dynamic import behind a
// media-query check so mobile devices never download or execute the chunk.
const HeroIDE = dynamic(() => import("./HeroIDE"), { ssr: false, loading: () => null });

export default function HeroIDEDeferred() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) setIsDesktop(true);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!isDesktop) return null;
  return <HeroIDE />;
}
