/**
 * Encode/decode helpers for the ?share= URL param used by both IDEs.
 * Encoding: btoa(encodeURIComponent(code)) — URL-safe base64.
 */

export function encodeShareCode(code: string): string {
  return btoa(encodeURIComponent(code));
}

export function tryDecodeShareCode(encoded: string): string | undefined {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return undefined;
  }
}
