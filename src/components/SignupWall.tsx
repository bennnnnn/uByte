"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import AuthFormFields from "./auth/AuthFormFields";
import { submitEmailAuth } from "@/lib/auth-client";
import { PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/password-policy";

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

    if (mode === "signup" && !isValidPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      setSubmitting(false);
      return;
    }

    const err = await submitEmailAuth(mode, { name, email, password }, { login, signup });

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

        <AuthFormFields
          mode={mode}
          name={name}
          email={email}
          password={password}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          error={error}
          submitting={submitting}
          onSubmit={handleSubmit}
          onSwitchMode={(m) => { setMode(m); resetForm(); }}
          visibleLabels={false}
          buttonClassName="w-full rounded-lg bg-indigo-700 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800 disabled:opacity-50"
          submitLabel={submitting ? "Please wait..." : mode === "signup" ? "Sign up \u2014 it\u2019s free" : "Log in"}
        />
      </div>
    </div>
  );
}
