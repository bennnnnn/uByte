/** Base URL for canonical links and Open Graph */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.ubyte.dev";

/** App name used in metadata and UI */
export const APP_NAME = "uByte";

/** XP awarded on first solve of a practice problem, keyed by difficulty. */
export const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 40,
};

/** Responsive breakpoint (px) used for mobile detection. */
export const MOBILE_BREAKPOINT = 768;
