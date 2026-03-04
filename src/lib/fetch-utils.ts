/**
 * Helpers for fetch + JSON in client components. Centralizes error message extraction.
 */

export interface ApiErrorPayload {
  error?: string;
  code?: string;
}

const DEFAULT_ERROR = "Something went wrong. Please try again.";

/**
 * Parse JSON with a fallback. Use when you need to read error.message from response body.
 */
export async function parseJson<T = unknown>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}

/**
 * Get a user-facing error message from a response and parsed body.
 * Use with setError in client components.
 */
export function getApiErrorMessage(
  res: Response,
  data: ApiErrorPayload | unknown,
  fallback = DEFAULT_ERROR
): string {
  const payload = data as ApiErrorPayload | undefined;
  if (payload?.error && typeof payload.error === "string") return payload.error;
  if (res.status === 401) return "Please sign in to continue.";
  if (res.status === 403) return "You don't have access to this.";
  if (res.status === 404) return "Not found.";
  return fallback;
}
