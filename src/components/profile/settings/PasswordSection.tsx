"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import type { Profile } from "../types";
import { MIN_PASSWORD_LENGTH, PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/password-policy";

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "", color: "", width: "0%" };
  if (pw.length < MIN_PASSWORD_LENGTH) return { label: "Too short", color: "bg-red-500", width: "20%" };
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const score = [hasLower, hasUpper, hasNum, pw.length >= 10].filter(Boolean).length;
  if (!isValidPassword(pw)) return { label: "Weak", color: "bg-amber-500", width: "33%" };
  if (score <= 2) return { label: "Fair", color: "bg-yellow-500", width: "60%" };
  if (score === 3) return { label: "Good", color: "bg-indigo-500", width: "80%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

type ToastType = "success" | "error" | "info";

interface Props {
  profile: Profile;
  onChangePassword: (currentPw: string, newPw: string) => Promise<string | null>;
  onToast: (msg: string, type?: ToastType) => void;
}

export default function PasswordSection({ profile, onChangePassword, onToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changing, setChanging] = useState(false);

  const strength = passwordStrength(newPw);

  /** Email/password users always have a local password; Google users may or may not. */
  const hasLocalPassword = !profile.is_google || profile.has_password_login === true;

  async function handleChange() {
    if (!hasLocalPassword) {
      if (newPw !== confirmPw) {
        onToast("New passwords do not match.", "error");
        return;
      }
    }

    setChanging(true);
    try {
      const err = await onChangePassword(hasLocalPassword ? currentPw : "", newPw);
      if (err === null) {
        onToast(hasLocalPassword ? "Password changed!" : "Password saved — you can sign in with email and password too.");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setShowForm(false);
      } else {
        onToast(err, "error");
      }
    } finally {
      setChanging(false);
    }
  }

  // Google-only: no local password yet — offer to add one (still signed in with Google).
  if (profile.is_google && !hasLocalPassword) {
    return (
      <section>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              You sign in with Google. Add a password if you want to sign in with email as well, or use &quot;Forgot password&quot; later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setNewPw("");
              setConfirmPw("");
            }}
            className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {showForm ? "Cancel" : "Add password"}
          </button>
        </div>
        {showForm && (
          <div className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
            <div>
              <label htmlFor="google-new-password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                New password
              </label>
              <Input
                id="google-new-password"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-describedby={newPw.length > 0 ? "google-pw-strength" : undefined}
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{PASSWORD_POLICY_MESSAGE}</p>
              {newPw.length > 0 && (
                <div className="mt-1.5" id="google-pw-strength">
                  <div
                    role="meter"
                    aria-label="Password strength"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={parseInt(strength.width)}
                    aria-valuetext={strength.label}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                  >
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="mt-1 text-xs text-zinc-500" aria-hidden>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="google-confirm-password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm password
              </label>
              <Input
                id="google-confirm-password"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleChange()}
              disabled={
                !newPw ||
                newPw !== confirmPw ||
                newPw.length < MIN_PASSWORD_LENGTH ||
                !isValidPassword(newPw) ||
                changing
              }
              className="rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {changing ? "Saving…" : "Save password"}
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
          {profile.is_google && hasLocalPassword && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              You can sign in with Google or email and password.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
          }}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {showForm ? "Cancel" : "Change Password"}
        </button>
      </div>
      {showForm && (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              aria-describedby={newPw.length > 0 ? "pw-strength" : undefined}
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{PASSWORD_POLICY_MESSAGE}</p>
            {newPw.length > 0 && (
              <div className="mt-1.5" id="pw-strength">
                <div
                  role="meter"
                  aria-label="Password strength"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={parseInt(strength.width)}
                  aria-valuetext={strength.label}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                >
                  <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="mt-1 text-xs text-zinc-500" aria-hidden>
                  {strength.label}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleChange()}
            disabled={!currentPw || newPw.length < MIN_PASSWORD_LENGTH || !isValidPassword(newPw) || changing}
            className="rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {changing ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </section>
  );
}
