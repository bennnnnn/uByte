"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/auth/GoogleIcon";
import GoogleOAuthError from "@/components/GoogleOAuthError";

type Mode = "login" | "signup" | "forgot";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, signup } = useAuth();

  const initialMode: Mode = searchParams.get("signup") === "1" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setForgotDone(false);
  }

  function switchMode(m: Mode) {
    setMode(m);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "forgot") {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Something went wrong.");
        } else {
          setForgotDone(true);
        }
      } catch {
        setError("Network error. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    const err =
      mode === "signup"
        ? await signup(name, email, password)
        : await login(email, password);

    setSubmitting(false);
    if (err) {
      setError(err);
    }
  }

  if (user) return null;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white">U</span>
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">uByte</span>
        </Link>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />

          <div className="p-8">
            {mode === "forgot" ? (
              forgotDone ? (
                <div className="rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
                  <div className="mb-3 text-4xl">✉️</div>
                  <h1 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Check your inbox</h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    If that email has an account, you&apos;ll receive a reset link shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Reset password
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    We&apos;ll email you a link to reset your password.
                  </p>

                  {error && (
                    <div role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Email
                      </label>
                      <Input
                        ref={firstInputRef}
                        id="forgot-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-xl"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? "Sending…" : "Send reset link"}
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
                  >
                    Back to sign in
                  </button>
                </>
              )
            ) : (
              <>
                <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {mode === "login"
                    ? "Sign in to continue to uByte."
                    : "Free tutorials, interview prep, and practice exams."}
                </p>

                <Suspense>
                  <GoogleOAuthError />
                </Suspense>

                {/* Google — most prominent */}
                <a
                  href="/api/auth/google"
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
                >
                  <GoogleIcon />
                  Continue with Google
                </a>

                <div className="flex items-center gap-3 py-4">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                  <span className="text-xs font-medium text-zinc-400">or use email</span>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                </div>

                {error && (
                  <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "signup" && (
                    <div>
                      <label htmlFor="login-name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Name
                      </label>
                      <Input
                        ref={mode === "signup" ? firstInputRef : undefined}
                        id="login-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <Input
                      ref={mode === "login" ? firstInputRef : undefined}
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="login-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Password
                      </label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                        Sign up free
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button type="button" onClick={() => switchMode("login")} className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
