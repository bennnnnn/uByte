"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import GoogleIcon from "@/components/auth/GoogleIcon";
import GoogleOAuthError from "@/components/GoogleOAuthError";
import { requestPasswordReset, submitEmailAuth } from "@/lib/auth-client";
import { MIN_PASSWORD_LENGTH, PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/password-policy";
import {
  buildGoogleAuthHref,
  getSafeNextPath,
  type AuthPageMode,
} from "@/lib/auth-redirect";
import { readStoredReferralCode } from "@/components/ReferralTracker";

type Mode = "login" | "signup" | "forgot";

const SIGNUP_VALUE_POINTS = [
  "Interactive tutorials across 9 languages",
  "Live code execution right in your browser",
  "Saved progress, bookmarks, and streaks",
];

const LOGIN_VALUE_POINTS = [
  "Your XP, streaks, and completed lessons are waiting",
  "Pick up your next tutorial exactly where you left off",
  "One login away from your next lesson",
];

export default function AuthPage({ variant }: { variant: AuthPageMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>(variant === "signup" ? "signup" : "login");
  const [emailOpen, setEmailOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  // Prevents the "already logged in" useEffect redirect from firing mid-submission.
  // Once the form is submitted, handleSubmit owns all navigation.
  const handlingSubmitRef = useRef(false);

  const nextPath = getSafeNextPath(searchParams.get("next"));
  // Read referral code from localStorage so it survives the OAuth redirect
  const storedRef = typeof window !== "undefined" ? readStoredReferralCode() : null;
  const googleHref = buildGoogleAuthHref(mode === "signup" ? "signup" : "login", nextPath, storedRef);
  const isSignupPage = mode === "signup";

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (!user || handlingSubmitRef.current) return;
    router.replace(nextPath);
  }, [nextPath, router, user]);

  function resetFields() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setForgotDone(false);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setEmailOpen(false);
    resetFields();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    handlingSubmitRef.current = true;

    if (mode === "forgot") {
      const result = await requestPasswordReset(email);
      setSubmitting(false);
      if (!result.ok) {
        handlingSubmitRef.current = false; // allow cross-tab redirect on failure
        setError(result.error);
        return;
      }
      setForgotDone(true);
      handlingSubmitRef.current = false;
      return;
    }

    if (mode === "signup" && !isValidPassword(password)) {
      setSubmitting(false);
      handlingSubmitRef.current = false;
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    const authError = await submitEmailAuth(mode, { name, email, password }, { login, signup });
    setSubmitting(false);

    if (authError) {
      handlingSubmitRef.current = false; // allow cross-tab redirect on failure
      setError(authError);
      return;
    }

    // Success — keep handlingSubmitRef.current = true so the "already logged in"
    // effect doesn't race with our intentional router.replace() below.
    if (mode === "signup") {
      const onboardingDest = nextPath && nextPath !== "/" ? `/onboarding?next=${encodeURIComponent(nextPath)}` : "/onboarding";
      router.replace(onboardingDest);
    } else {
      router.replace(nextPath);
    }
  }

  if (user) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" role="status" aria-label="Redirecting…" />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] text-zinc-950 dark:text-zinc-50">
      <div className="mx-auto grid min-h-[100svh] max-w-5xl gap-10 px-5 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-10">
        <section className="px-1 py-3 sm:px-2">
          <div className="flex h-full flex-col">
            <div className="max-w-xl">
              <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
                {isSignupPage
                  ? "Learn to code by writing real code."
                  : "Good to have you back."}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
                {isSignupPage
                  ? "Short, interactive lessons with a real code editor — no setup needed."
                  : "Sign in to continue where you left off, track your streak, and keep moving through your tutorials."}
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {(isSignupPage ? SIGNUP_VALUE_POINTS : LOGIN_VALUE_POINTS).map((point) => (
                <div key={point} className="flex items-start gap-3 px-1 py-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    ✓
                  </span>
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-start justify-center pt-2">
          <div className="w-full max-w-xl rounded-[30px] bg-surface-card p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] xl:p-9 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
            <div className="mb-6">
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                {mode === "forgot" ? "Reset your password" : isSignupPage ? "Sign up" : "Sign in"}
              </h2>
            </div>

            {mode === "forgot" && (
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Enter the email on your account and we’ll send a reset link.
              </p>
            )}

            <div className="mt-6">
              <Suspense>
                <GoogleOAuthError />
              </Suspense>
            </div>

            {mode === "forgot" ? (
              forgotDone ? (
                <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-6 text-center dark:border-emerald-900/50 dark:bg-emerald-950/30">
                  <div className="text-4xl">✉️</div>
                  <h3 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">Check your inbox</h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    If that email matches an account, a reset link is on the way.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="mt-5 inline-flex rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {error && <FormError>{error}</FormError>}

                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <Input
                      ref={firstInputRef}
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="rounded-2xl border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="w-full"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full text-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Back to sign in
                  </button>
                </form>
              )
            ) : (
              <>
                {/* Google — primary CTA */}
                <a
                  href={googleHref}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-surface-page px-4 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-surface-page dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  Continue with Google
                </a>

                {/* OR divider */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">OR</span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Email — secondary CTA, expands to form */}
                {!emailOpen ? (
                  <button
                    type="button"
                    onClick={() => setEmailOpen(true)}
                    className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-zinc-200 bg-surface-page px-4 py-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:bg-surface-page dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Continue with Email
                  </button>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && <FormError>{error}</FormError>}

                      {mode === "signup" && (
                        <div>
                          <label htmlFor="auth-name" className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Name
                          </label>
                          <Input
                            ref={firstInputRef}
                            id="auth-name"
                            type="text"
                            autoFocus
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Your name"
                            className="rounded-2xl border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
                          />
                        </div>
                      )}

                      <div>
                        <label htmlFor="auth-email" className="mb-1.5 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                          Email
                        </label>
                        <Input
                          ref={mode === "login" ? firstInputRef : undefined}
                          id="auth-email"
                          type="email"
                          autoFocus={mode === "login"}
                          required
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          className="rounded-2xl border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
                        />
                      </div>

                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label htmlFor="auth-password" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            Password
                          </label>
                          {!isSignupPage && (
                            <button
                              type="button"
                              onClick={() => switchMode("forgot")}
                              className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <Input
                          id="auth-password"
                          type="password"
                          required
                          minLength={MIN_PASSWORD_LENGTH}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder={isSignupPage ? "At least 6 characters" : "Your password"}
                          className="rounded-2xl border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        size="lg"
                        className="w-full"
                      >
                        {submitting ? (isSignupPage ? "Creating account…" : "Signing in…") : isSignupPage ? "Create free account" : "Sign in"}
                      </Button>
                    </form>
                  </>
                )}

                {mode === "login" && !emailOpen && (
                  <div className="mt-3 text-center">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs font-medium text-zinc-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {isSignupPage ? "Already have an account? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => switchMode(isSignupPage ? "login" : "signup")}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {isSignupPage ? "Sign in" : "Sign up free"}
                  </button>
                </p>
              </>
            )}

            <div className="mt-6 px-1 text-sm text-zinc-600 dark:text-zinc-400">
              <p className="leading-6">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="font-semibold text-zinc-800 underline underline-offset-2 dark:text-zinc-200">
                  Terms
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="font-semibold text-zinc-800 underline underline-offset-2 dark:text-zinc-200">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
