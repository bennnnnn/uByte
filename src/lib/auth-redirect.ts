export type AuthPageMode = "login" | "signup";

const DEFAULT_NEXT_PATH = "/";

export function getSafeNextPath(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_NEXT_PATH;

  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_NEXT_PATH;

  return value;
}

export function buildAuthPageHref(
  mode: AuthPageMode,
  nextPath?: string | null
): string {
  const safeNext = getSafeNextPath(nextPath);
  const params = new URLSearchParams();

  if (safeNext !== DEFAULT_NEXT_PATH) {
    params.set("next", safeNext);
  }

  const pathname = mode === "signup" ? "/signup" : "/login";
  return params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
}

export function buildGoogleAuthHref(
  mode: AuthPageMode,
  nextPath?: string | null,
  referralCode?: string | null
): string {
  const params = new URLSearchParams({ mode });
  const safeNext = getSafeNextPath(nextPath);

  if (safeNext !== DEFAULT_NEXT_PATH) {
    params.set("next", safeNext);
  }

  if (referralCode && /^[a-z0-9]{6,16}$/i.test(referralCode)) {
    params.set("ref", referralCode);
  }

  return `/api/auth/google?${params.toString()}`;
}
