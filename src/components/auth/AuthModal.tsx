"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import Input from "@/components/ui/Input";

type ModalMode = "login" | "signup" | "forgot";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<ModalMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setForgotDone(false);
  }
  function switchMode(m: ModalMode) {
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
    } else {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-[400px] rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        {/* Accent bar */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-violet-500" />

        <div className="p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2
                id="auth-modal-title"
                className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                {mode === "login"
                  ? "Welcome back"
                  : mode === "signup"
                    ? "Create account"
                    : "Reset password"}
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "forgot"
                  ? "We’ll email you a link to reset your password."
                  : mode === "signup"
                    ? "Start learning Go with a free account."
                    : "Sign in to continue to uByte."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {mode === "forgot" ? (
            forgotDone ? (
              <div className="rounded-xl bg-emerald-50 p-5 text-center dark:bg-emerald-950/30">
                <div className="mb-3 text-3xl">✉️</div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  If that email has an account, you’ll receive a reset link shortly. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Email
                    </label>
                    <Input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
              <Link
                href="/api/auth/google"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Link>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-medium text-zinc-400">or</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Name
                    </label>
                    <Input
                      id="auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <Input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="auth-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Password
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/80"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                You’ll stay signed in on this device until you log out.
              </p>

              <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {mode === "login" ? (
                  <>
                    No account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
