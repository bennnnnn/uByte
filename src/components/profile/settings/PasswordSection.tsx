"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import type { Profile } from "../types";

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: "", color: "", width: "0%" };
  if (pw.length < 6) return { label: "Too short", color: "bg-red-500", width: "20%" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNum, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { label: "Weak", color: "bg-orange-500", width: "33%" };
  if (score <= 2) return { label: "Fair", color: "bg-yellow-500", width: "60%" };
  if (score === 3) return { label: "Good", color: "bg-blue-500", width: "80%" };
  return { label: "Strong", color: "bg-green-500", width: "100%" };
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
  const [changing, setChanging] = useState(false);

  const strength = passwordStrength(newPw);

  async function handleChange() {
    setChanging(true);
    try {
      const err = await onChangePassword(currentPw, newPw);
      if (err === null) {
        onToast("Password changed!");
        setCurrentPw("");
        setNewPw("");
        setShowForm(false);
      } else {
        onToast(err, "error");
      }
    } finally {
      setChanging(false);
    }
  }

  if (profile.is_google) {
    return (
      <section>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">You signed in with Google. Manage your password through your Google account.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
        <button onClick={() => { setShowForm(!showForm); setCurrentPw(""); setNewPw(""); }} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {showForm ? "Cancel" : "Change Password"}
        </button>
      </div>
      {showForm && (
        <div className="mt-4 space-y-3">
          <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="Current password" />
          <div>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password" />
            {newPw.length > 0 && (
              <div className="mt-1.5">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{strength.label}</p>
              </div>
            )}
          </div>
          <button onClick={handleChange} disabled={!currentPw || newPw.length < 6 || changing} className="rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300">
            {changing ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
    </section>
  );
}
