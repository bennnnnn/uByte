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
  "Track progress across tutorials and practice",
  "Unlock full interview prep and mock exams",
  "Save bookmarks, snapshots, and certificates",
];

const QUICK_STATS = [
  { value: "6", label: "languages" },
  { value: "19+", label: "guided topics" },
  { value: "Real", label: "practice flow" },
];

function AccentGrid() {
  return (
    <div
      className="absolute inset-0 opacity-70"
      aria-hidden
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
      }}
    />
  );
}

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
    <div className="relative min-h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#f4efe4_0%,#efe7da_45%,#f8f5ef_100%)] text-zinc-950 dark:bg-[linear-gradient(180deg,#18181b_0%,#101827_50%,#0b1120_100%)] dark:text-zinc-50">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(213,147,52,0.25),transparent_40%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.16),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl gap-10 px-5 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[#10233d] px-6 py-7 text-white shadow-[0_30px_80px_rgba(16,35,61,0.24)] sm:px-8 sm:py-9 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-[0_30px_80px_rgba(2,6,23,0.55)]">
          <AccentGrid />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.32),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.22),transparent_36%)]" />
          <div className="relative flex h-full flex-col">
            <Link href="/" className="inline-flex items-center gap-3 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f59e0b] font-black text-[#10233d]">
                U
              </span>
              <span>uByte</span>
            </Link>

            <div className="mt-12 max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-200/90">
                Dedicated auth pages
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                {isSignupPage ? "Create your account without leaving the page flow." : "Sign in on a real page, not a popup."}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/72 sm:text-lg">
                {isSignupPage
                  ? "Start with a focused signup flow, then continue straight back to the lesson, pricing page, or exam you came from."
                  : "A full-page auth flow makes the state clearer, works better on mobile, and preserves the path you were on before sign-in."}
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {QUICK_STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm">
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/55">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-3">
              {VALUE_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/90 text-[11px] font-black text-[#10233d]">
                    OK
                  </span>
                  <p className="text-sm leading-6 text-white/78">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-xl rounded-[30px] border border-zinc-200/70 bg-white/92 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur xl:p-8 dark:border-white/10 dark:bg-zinc-950/82 dark:shadow-[0_24px_70px_rgba(2,6,23,0.5)]">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400">
                  {mode === "forgot" ? "Password reset" : isSignupPage ? "Create account" : "Welcome back"}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {mode === "forgot" ? "Get back into your account" : isSignupPage ? "Start free, upgrade when ready" : "Continue where you left off"}
                </h2>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                <Link
                  href={loginHref}
                  className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    !isSignupPage && mode !== "forgot"
                      ? "bg-[#10233d] text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href={signupHref}
                  className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    isSignupPage
                      ? "bg-[#10233d] text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  Sign up
                </Link>
              </div>
            </div>

            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {mode === "forgot"
                ? "Enter the email on your account and we’ll send a reset link."
                : isSignupPage
                  ? "You’ll get the full account flow in-page, then go right back to what you were doing."
                  : "Use email or Google sign-in. We’ll return you to the page you came from."}
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
                    className="w-full rounded-2xl bg-[#10233d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#183458] disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
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
                    className="w-full rounded-2xl bg-[#10233d] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#183458] disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    {submitting ? "Please wait…" : isSignupPage ? "Create account" : "Sign in"}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-[#faf6ef] px-4 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  No popup
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Mobile friendly
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Redirect aware
                </span>
              </div>
              <p className="mt-3 leading-6">
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
