"use client";

import { useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  oauth_invalid_state: "Sign-in failed: security check failed. Please try again.",
  oauth_no_code: "Sign-in was cancelled.",
  oauth_not_configured: "Google sign-in is not configured yet.",
  oauth_token_failed: "Could not connect to Google. Please try again.",
  oauth_userinfo_failed: "Could not retrieve your Google profile. Please try again.",
  oauth_missing_fields: "Google did not provide your email. Please try again.",
  oauth_email_not_verified: "Your Google account email must be verified before you can sign in.",
  account_locked: "This account is temporarily locked. Please try again later.",
  oauth_failed: "Google sign-in failed. Please try again.",
};

export default function GoogleOAuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error || !MESSAGES[error]) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
      <span className="text-base">⚠️</span>
      <span>{MESSAGES[error]}</span>
    </div>
  );
}
