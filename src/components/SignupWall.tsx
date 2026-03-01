"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function SignupWall({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { user, loading, limited, recordView, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Record the page view when the page loads
  useEffect(() => {
    if (!loading && !user) {
      recordView(slug);
    }
  }, [slug, pathname, loading, user, recordView]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const err =
      mode === "signup"
        ? await signup(name, email, password)
        : await login(email, password);

    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      resetForm();
    }
  };

  // Don't show wall while loading, for logged-in users, or if not limited
  if (loading || user || !limited) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Gradient overlay that fades from transparent at top to opaque */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/0 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-zinc-950/0" />

      {/* Signup card */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-8 shadow-2xl ring-1 ring-zinc-200 sm:rounded-2xl sm:mb-0 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="mb-2 text-center text-3xl">🐹</div>
        <h2 className="mb-2 text-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
          You&apos;re enjoying the tutorials!
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Create a free account to continue learning and track your progress.
        </p>

        {/* Google sign-in */}
        <a
          href="/api/auth/google"
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
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

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-cyan-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-800 disabled:opacity-50"
          >
            {submitting
              ? "Please wait..."
              : mode === "signup"
                ? "Sign up — it\u2019s free"
                : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  resetForm();
                }}
                className="font-medium text-cyan-700 hover:text-cyan-800"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
                className="font-medium text-cyan-700 hover:text-cyan-800"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
