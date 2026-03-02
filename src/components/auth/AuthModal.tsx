"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/AuthProvider";

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

  function reset() { setName(""); setEmail(""); setPassword(""); setError(""); setForgotDone(false); }
  function switchMode(m: ModalMode) { setMode(m); reset(); }

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

    const err = mode === "signup"
      ? await signup(name, email, password)
      : await login(email, password);

    setSubmitting(false);
    if (err) { setError(err); } else { onClose(); }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {mode === "login" ? "Log in" : mode === "signup" ? "Create an account" : "Reset password"}
            </h2>
            <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {mode === "forgot" ? (
            forgotDone ? (
              <div className="text-center">
                <div className="mb-3 text-4xl">📬</div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">If that email has an account, you&apos;ll receive a reset link shortly. Check your inbox.</p>
                <button onClick={() => switchMode("login")} className="mt-4 text-sm font-medium text-indigo-700 hover:text-indigo-800">Back to log in</button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Enter your email and we&apos;ll send you a reset link.</p>
                {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50">{submitting ? "Sending..." : "Send reset link"}</button>
                </form>
                <button onClick={() => switchMode("login")} className="mt-4 block w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">Back to log in</button>
              </>
            )
          ) : (
            <>
              <a href="/api/auth/google" className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </a>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs text-zinc-400">or</span>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
              </div>
              {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                    {mode === "login" && (
                      <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-indigo-700 hover:text-indigo-800">Forgot password?</button>
                    )}
                  </div>
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50">
                  {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                {mode === "login" ? (
                  <>Don&apos;t have an account?{" "}<button onClick={() => switchMode("signup")} className="font-medium text-indigo-700 hover:text-indigo-800">Sign up</button></>
                ) : (
                  <>Already have an account?{" "}<button onClick={() => switchMode("login")} className="font-medium text-indigo-700 hover:text-indigo-800">Log in</button></>
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
