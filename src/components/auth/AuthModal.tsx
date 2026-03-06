"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/AuthProvider";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/auth/GoogleIcon";

const GSI_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SCRIPT = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentListener?: (n: { getDismissedReason: () => string } | null) => void) => void;
        };
      };
    };
  }
}

type ModalMode = "login" | "signup" | "forgot";

interface Props {
  onClose: () => void;
  /** When true, open in signup mode (e.g. from banner link /?signup=1). */
  initialMode?: "login" | "signup";
}

export default function AuthModal({ onClose, initialMode }: Props) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<ModalMode>(initialMode ?? "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const gsiInitialized = useRef(false);
  const credentialHandlerRef = useRef<(credential: string) => Promise<void>>(async () => {});
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    credentialHandlerRef.current = async (credential: string) => {
      setError("");
      setSubmitting(true);
      const err = await loginWithGoogle(credential);
      setSubmitting(false);
      if (err) setError(err);
      else onClose();
    };
  }, [loginWithGoogle, onClose]);

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

  useEffect(() => {
    if (!GSI_CLIENT_ID || mode === "forgot") return;
    if (gsiInitialized.current) return;

    function init() {
      if (!window.google?.accounts?.id || gsiInitialized.current) return;
      gsiInitialized.current = true;
      window.google.accounts.id.initialize({
        client_id: GSI_CLIENT_ID,
        callback: (res) => {
          void credentialHandlerRef.current(res.credential);
        },
        cancel_on_tap_outside: false,
      });
      window.google.accounts.id.prompt();
    }

    if (window.google?.accounts?.id) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.src = GSI_SCRIPT;
    script.async = true;
    script.onload = () => {
      if (window.google?.accounts?.id) init();
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [mode]);

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
                    ? "Free tutorials, interview prep, and practice exams."
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
                  <div role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
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
              {/* Use <a> so redirect always happens, even if client routing ignores API redirects. */}
              <a
                href="/api/auth/google"
                className={`flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/80 ${
                  submitting ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <GoogleIcon className="h-5 w-5 shrink-0" />
                Continue with Google
              </a>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs font-medium text-zinc-400">or</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {error && (
                <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
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
                      ref={mode === "signup" ? firstInputRef : undefined}
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
                    ref={mode === "login" ? firstInputRef : undefined}
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
                You’ll stay signed in for 30 days.
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
