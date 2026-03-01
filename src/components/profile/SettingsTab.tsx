"use client";

import { useState } from "react";
import Avatar, { AVATAR_KEYS } from "@/components/Avatar";
import { useToast } from "@/components/Toast";
import { applyTheme } from "@/components/ThemeToggle";
import type { Profile } from "./types";

interface Props {
  profile: Profile;
  onSave: (data: { name: string; bio: string; avatar: string; theme: string }) => Promise<boolean>;
  onChangePassword: (currentPw: string, newPw: string) => Promise<string | null>;
  onDeleteAccount: () => Promise<void>;
  onResetProgress: () => Promise<void>;
  onLogoutAll: () => Promise<void>;
}

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

export default function SettingsTab({ profile, onSave, onChangePassword, onDeleteAccount, onResetProgress, onLogoutAll }: Props) {
  const { toast } = useToast();
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editTheme, setEditTheme] = useState(profile.theme || "dark");

  const [saving, setSaving] = useState(false);

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const strength = passwordStrength(newPw);

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await onSave({ name: editName, bio: editBio, avatar: editAvatar, theme: editTheme });
      if (ok) toast("Profile saved!");
      else toast("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChangingPw(true);
    try {
      const err = await onChangePassword(currentPw, newPw);
      if (err === null) {
        toast("Password changed!");
        setCurrentPw("");
        setNewPw("");
        setShowPwForm(false);
      } else {
        toast(err, "error");
      }
    } finally {
      setChangingPw(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDeleteAccount();
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await onLogoutAll();
    } catch {
      toast("Failed to log out all devices.", "error");
      setLoggingOutAll(false);
    }
  };

  const handleResetProgress = async () => {
    setResetting(true);
    try {
      await onResetProgress();
      setResetConfirm(false);
      toast("Progress reset successfully.", "success");
    } catch {
      toast("Failed to reset progress.", "error");
    } finally {
      setResetting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/profile/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "go-tutorials-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast("Failed to export data.", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile settings */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={200}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Tell us about yourself..."
            />
            <p className="mt-1 text-xs text-zinc-400">{editBio.length}/200</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Avatar</label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setEditAvatar(key)}
                  aria-label={`Select ${key} avatar`}
                  aria-pressed={editAvatar === key}
                  className={`rounded-full ring-2 ring-offset-2 transition-all ${
                    editAvatar === key
                      ? "ring-cyan-500"
                      : "ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600"
                  }`}
                >
                  <Avatar avatarKey={key} size="md" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme</label>
            <div className="flex gap-2">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setEditTheme(t); applyTheme(t); }}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    editTheme === t
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  {t === "light" ? "☀️" : "🌙"} {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-cyan-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* Password — hidden for Google users */}
      {profile.is_google ? (
        <section>
          <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
          <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
            <svg className="h-5 w-5 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You signed in with Google. Manage your password through your Google account.
            </p>
          </div>
        </section>
      ) : (
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Password</h3>
            <button
              onClick={() => { setShowPwForm(!showPwForm); setCurrentPw(""); setNewPw(""); }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {showPwForm ? "Cancel" : "Change Password"}
            </button>
          </div>
          {showPwForm && (
            <div className="mt-4 space-y-3">
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <div>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="New password"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                {newPw.length > 0 && (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{strength.label}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleChangePassword}
                disabled={!currentPw || newPw.length < 6 || changingPw}
                className="rounded-lg bg-zinc-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {changingPw ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Data export */}
      <section>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Data</h3>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Download a copy of all your data — profile, progress, badges, bookmarks, and activity.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {exporting ? "Preparing…" : "Download My Data"}
        </button>
      </section>

      {/* Security */}
      <section>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Security</h3>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Instantly invalidate all active sessions on every device. You will be logged out here too.
        </p>
        <button
          onClick={handleLogoutAll}
          disabled={loggingOutAll}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {loggingOutAll ? "Logging out…" : "Log Out All Devices"}
        </button>
      </section>

      {/* Danger zone */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-red-600">Danger Zone</h3>
        <div className="space-y-3">
          {/* Reset progress */}
          {!resetConfirm ? (
            <button
              onClick={() => setResetConfirm(true)}
              className="rounded-lg border border-orange-300 px-6 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
            >
              Reset All Progress
            </button>
          ) : (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
              <p className="mb-3 text-sm text-orange-700 dark:text-orange-400">
                This will permanently delete all your tutorial progress, badges, XP, and streaks. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetProgress}
                  disabled={resetting}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {resetting ? "Resetting…" : "Yes, Reset Everything"}
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  disabled={resetting}
                  className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Delete account */}
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="rounded-lg border border-red-300 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
            >
              Delete Account
            </button>
          ) : (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="mb-3 text-sm text-red-700 dark:text-red-400">
                This will permanently delete your account and all data. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, Delete My Account"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleting}
                  className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
