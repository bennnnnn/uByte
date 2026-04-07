"use client";

import { forwardRef, useState, useEffect } from "react";
import { Button } from "@/components/ui";
import Input from "@/components/ui/Input";
import GoogleIcon from "@/components/auth/GoogleIcon";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-policy";

export interface AuthFormFieldsProps {
  mode: "login" | "signup";
  name: string;
  email: string;
  password: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSwitchMode: (mode: "login" | "signup") => void;
  onForgot?: () => void;
  /** Custom class for inputs (different border radius per context) */
  inputClassName?: string;
  /** Custom class for the submit button */
  buttonClassName?: string;
  /** Override submit button text */
  submitLabel?: string;
  /** Ref for the first focusable input */
  firstInputRef?: React.Ref<HTMLInputElement>;
  /** Use visible labels (true) or sr-only labels (false). Default: true */
  visibleLabels?: boolean;
  /** Google button href. Default: "/api/auth/google" */
  googleHref?: string;
}

const AuthFormFields = forwardRef<HTMLFormElement, AuthFormFieldsProps>(function AuthFormFields(
  {
    mode,
    name,
    email,
    password,
    onNameChange,
    onEmailChange,
    onPasswordChange,
    error,
    submitting,
    onSubmit,
    onSwitchMode,
    onForgot,
    inputClassName = "",
    buttonClassName,
    submitLabel,
    firstInputRef,
    visibleLabels = true,
    googleHref = "/api/auth/google",
  },
  ref
) {
  const [emailOpen, setEmailOpen] = useState(false);

  // Collapse email form when switching modes (login ↔ signup)
  useEffect(() => {
    setEmailOpen(false);
  }, [mode]);

  const labelClass = visibleLabels
    ? "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
    : "sr-only";

  return (
    <>
      {/* Google — primary CTA */}
      <a
        href={googleHref}
        aria-label="Continue with Google"
        className={`flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-surface-page px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-surface-page dark:text-zinc-200 dark:hover:bg-zinc-800 ${
          submitting ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <GoogleIcon className="h-5 w-5 shrink-0" />
        Continue with Google
      </a>

      {/* OR divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs font-medium text-zinc-400">OR</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Email — secondary CTA, reveals form on click */}
      {!emailOpen ? (
        <button
          type="button"
          onClick={() => setEmailOpen(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-surface-page px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700 dark:bg-surface-page dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Continue with Email
        </button>
      ) : (
        <>
          <div role="alert" aria-live="assertive" aria-atomic="true">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
                {error}
              </div>
            )}
          </div>

          <form ref={ref} onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-name" className={labelClass}>Name</label>
                <Input
                  ref={mode === "signup" ? firstInputRef as React.Ref<HTMLInputElement> : undefined}
                  id="auth-name"
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
                  placeholder="Your name"
                  className={inputClassName}
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className={labelClass}>Email</label>
              <Input
                ref={mode === "login" ? firstInputRef as React.Ref<HTMLInputElement> : undefined}
                id="auth-email"
                type="email"
                autoFocus={mode === "login"}
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
                placeholder="you@example.com"
                className={inputClassName}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="auth-password" className={visibleLabels ? "text-sm font-medium text-zinc-700 dark:text-zinc-300" : "sr-only"}>
                  Password
                </label>
                {mode === "login" && onForgot && (
                  <button
                    type="button"
                    onClick={onForgot}
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
                minLength={MIN_PASSWORD_LENGTH}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value)}
                placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters`}
                className={inputClassName}
              />
            </div>
            <Button type="submit" disabled={submitting} size="lg" className={buttonClassName || "w-full"}>
              {submitLabel ?? (submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account")}
            </Button>
          </form>
        </>
      )}

      <p className="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => onSwitchMode("signup")}
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
              onClick={() => onSwitchMode("login")}
              className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </>
  );
});

export default AuthFormFields;
