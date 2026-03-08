"use client";

import { useState, useEffect } from "react";
import { MOBILE_BREAKPOINT } from "@/lib/constants";

/** Reactive mobile detection based on viewport width. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
