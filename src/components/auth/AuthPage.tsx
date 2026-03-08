"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Input from "@/components/ui/Input";
import FormError from "@/components/ui/FormError";
import GoogleIcon from "@/components/auth/GoogleIcon";
import GoogleOAuthError from "@/components/GoogleOAuthError";
import { requestPasswordReset, submitEmailAuth } from "@/lib/auth-client";
import { MIN_PASSWORD_LENGTH, PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/password-policy";
import {
  buildAuthPageHref,
  buildGoogleAuthHref,
  getSafeNextPath,
  type AuthPageMode,
} from "@/lib/auth-redirect";

type Mode = "login" | "signup" | "forgot";

const VALUE_POINTS = [
  "Interactive tutorials across Go, Python, JavaScript, Java, Rust, and C++",
  "Interview prep problems with real coding workflows",
  "Timed certification exams with pass thresholds and shareable certificates",
];

export default function AuthPage({ variant }: { variant: AuthPageMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>(variant === "signup" ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const nextPath = getSafeNextPath(searchParams.get("next"));
  const loginHref = buildAuthPageHref("login", nextPath);
  const signupHref = buildAuthPageHref("signup", nextPath);
  const googleHref = buildGoogleAuthHref(variant, nextPath);
  const isSignupPage = variant === "signup";

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (!user) return;
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
    resetFields();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "forgot") {
      const result = await requestPasswordReset(email);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForgotDone(true);
      return;
    }

    if (mode === "signup" && !isValidPassword(password)) {
      setSubmitting(false);
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    const authError = await submitEmailAuth(mode, { name, email, password }, { login, signup });
    setSubmitting(false);

    if (authError) {
      setError(authError);
      return;
    }

    router.replace(nextPath);
  }

  if (user) return null;

  return (
    <div className="min-h-[100svh] text-zinc-950 dark:text-zinc-50">
      <div className="mx-auto grid min-h-[100svh] max-w-5xl gap-10 px-5 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
        <section className="px-1 py-3 sm:px-2">
          <div className="flex h-full flex-col">
            <div className="max-w-xl">
              <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
                {isSignupPage
                  ? "Build skill with guided tutorials, interview prep, and certifications."
                  : "Pick up your tutorials, interview prep, and certifications where you left off."}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
                Learn by doing with short lessons, real coding practice, and exam-style runs that show measurable progress.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {VALUE_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3 px-1 py-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    +
                  </span>
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[30px] bg-surface-card p-7 shadow-[0_24px_70px_rgba(15,23,42,0.10)] xl:p-9 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
                {mode === "forgot" ? "Password reset" : isSignupPage ? "Create account" : "Welcome back"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>

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
                <a
                  href={googleHref}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-surface-card px-4 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-700"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  Continue with Google
                </a>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

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
                          Forgot?
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
                      placeholder="6+ chars, Aa1"
                      className="rounded-2xl border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Please wait…" : isSignupPage ? "Create account" : "Sign in"}
                  </button>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {isSignupPage ? "Already have an account? " : "Need an account? "}
                    <Link
                      href={isSignupPage ? loginHref : signupHref}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      {isSignupPage ? "Sign in" : "Create one"}
                    </Link>
                  </p>
                </form>
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
