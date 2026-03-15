"use client";

import { useEffect } from "react";

/** Scrolls the window to the top on mount. Use on pages where browser
 *  scroll-restoration would otherwise restore a previous scroll position. */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}
