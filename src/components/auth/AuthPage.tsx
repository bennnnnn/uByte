"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/auth/GoogleIcon";
import GoogleOAuthError from "@/components/GoogleOAuthError";
import { requestPasswordReset, submitEmailAuth } from "@/lib/auth-client";
import {
  buildAuthPageHref,
  buildGoogleAuthHref,
  getSafeNextPath,
  type AuthPageMode,
} from "@/lib/auth-redirect";

type Mode = "login" | "signup" | "forgot";

const VALUE_POINTS = [
  "Interactive tutorials across Go, Python, JavaScript, Java, Rust, and C++",
  "Interview-style practice problems with real coding workflows",
  "Timed practice exams with pass thresholds and shareable certificates",
];

const QUICK_STATS = [
  { value: "6", label: "languages" },
  { value: "19+", label: "guided topics" },
  { value: "Timed", label: "practice exams" },
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
    <div className="min-h-[100svh] bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto grid min-h-[100svh] max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_0.92fr] lg:px-8 lg:py-10">
        <section className="rounded-[32px] border border-indigo-100 bg-white px-6 py-7 shadow-[0_20px_60px_rgba(79,70,229,0.08)] sm:px-8 sm:py-9 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="flex h-full flex-col">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
                uByte
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
                {isSignupPage
                  ? "Build skill with guided tutorials, interview prep, and real practice exams."
                  : "Pick up your tutorials, interview prep, and practice exams where you left off."}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
                Learn by doing with short lessons, real coding practice, and exam-style runs that show measurable progress.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {QUICK_STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="text-2xl font-black text-zinc-950 dark:text-white">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-3">
              {VALUE_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">
                    +
                  </span>
                  <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{point}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
              <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                Account features
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Save progress, keep bookmarks and snapshots, track exam results, and continue across devices.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[30px] border-2 border-indigo-200 bg-white p-7 shadow-[0_30px_90px_rgba(79,70,229,0.14)] xl:p-9 dark:border-indigo-900/40 dark:bg-zinc-900 dark:shadow-[0_24px_70px_rgba(2,6,23,0.45)]">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
                {mode === "forgot" ? "Password reset" : isSignupPage ? "Create account" : "Welcome back"}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                {mode === "forgot" ? "Reset your password" : isSignupPage ? "Create your uByte account" : "Sign in to uByte"}
              </h2>
            </div>

            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {mode === "forgot"
                ? "Enter the email on your account and we’ll send a reset link."
                : isSignupPage
                  ? "Start free and save your learning progress."
                  : "Use email or Google to continue."}
            </p>

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
                  {error && (
                    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                      {error}
                    </div>
                  )}

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
                      className="rounded-2xl border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
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
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-700"
                >
                  <GoogleIcon className="h-5 w-5 shrink-0" />
                  Continue with Google
                </a>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    or use email
                  </span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                      {error}
                    </div>
                  )}

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
                        className="rounded-2xl border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
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
                      className="rounded-2xl border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
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
                          className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <Input
                      id="auth-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Minimum 8 characters"
                      className="rounded-2xl border-zinc-200 bg-zinc-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Please wait…" : isSignupPage ? "Create account" : "Sign in"}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
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
              {mode !== "forgot" && (
                <p className="mt-4 text-sm">
                  {isSignupPage ? "Already have an account? " : "Need an account? "}
                  <Link
                    href={isSignupPage ? loginHref : signupHref}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {isSignupPage ? "Sign in" : "Create one"}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
