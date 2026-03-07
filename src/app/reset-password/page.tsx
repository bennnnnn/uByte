"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { MIN_PASSWORD_LENGTH, PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/password-policy";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-4 text-5xl">🔗</div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Invalid link</h1>
        <p className="text-zinc-500 dark:text-zinc-400">This password reset link is missing or invalid.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Password updated!</h1>
        <p className="mb-6 text-zinc-500 dark:text-zinc-400">You can now log in with your new password.</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg bg-indigo-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-800"
        >
          Go to homepage
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!isValidPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <div className="mb-3 text-5xl">🔐</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Set a new password</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{PASSWORD_POLICY_MESSAGE}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">New password</label>
          <Input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm password</label>
          <Input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
        >
          {submitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
