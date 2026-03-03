/**
 * Client-side conversion analytics. Uses Vercel Analytics when available.
 * Call only from browser (e.g. useEffect or click handlers).
 */

export type ConversionEvent =
  | "viewed_pricing"
  | "clicked_upgrade"
  | "checkout_completed"
  | "started_tutorial"
  | "completed_tutorial";

declare global {
  interface Window {
    va?: (event: string, payload?: Record<string, string | number | boolean>) => void;
  }
}

export function trackConversion(event: ConversionEvent, payload?: Record<string, string | number | boolean>): void {
  if (typeof window === "undefined") return;
  try {
    if (window.va) {
      window.va("event", { name: event, ...payload });
    }
  } catch {
    // ignore
  }
}
