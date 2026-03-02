"use client";

import { useState } from "react";

type ToastType = "success" | "error" | "info";

interface Props {
  onDeleteAccount: () => Promise<void>;
  onResetProgress: () => Promise<void>;
  onLogoutAll: () => Promise<void>;
  onToast: (msg: string, type?: ToastType) => void;
}

export default function DangerZoneSection({ onDeleteAccount, onResetProgress, onLogoutAll, onToast }: Props) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  async function handleExport() {
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
      onToast("Failed to export data.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleLogoutAll() {
    setLoggingOutAll(true);
    try {
      await onLogoutAll();
    } catch {
      onToast("Failed to log out all devices.", "error");
      setLoggingOutAll(false);
    }
  }

  async function handleResetProgress() {
    setResetting(true);
    try {
      await onResetProgress();
      setResetConfirm(false);
      onToast("Progress reset successfully.", "success");
    } catch {
      onToast("Failed to reset progress.", "error");
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      {/* Your Data */}
      <section>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Your Data</h3>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">Download a copy of all your data — profile, progress, badges, bookmarks, and activity.</p>
        <button onClick={handleExport} disabled={exporting} className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {exporting ? "Preparing…" : "Download My Data"}
        </button>
      </section>

      {/* Security */}
      <section>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Security</h3>
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">Instantly invalidate all active sessions on every device. You will be logged out here too.</p>
        <button onClick={handleLogoutAll} disabled={loggingOutAll} className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
          {loggingOutAll ? "Logging out…" : "Log Out All Devices"}
        </button>
      </section>

      {/* Danger zone */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-red-600">Danger Zone</h3>
        <div className="space-y-3">
          {!resetConfirm ? (
            <button onClick={() => setResetConfirm(true)} className="rounded-lg border border-orange-300 px-6 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
              Reset All Progress
            </button>
          ) : (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
              <p className="mb-3 text-sm text-orange-700 dark:text-orange-400">This will permanently delete all your tutorial progress, badges, XP, and streaks. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={handleResetProgress} disabled={resetting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50">{resetting ? "Resetting…" : "Yes, Reset Everything"}</button>
                <button onClick={() => setResetConfirm(false)} disabled={resetting} className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
              </div>
            </div>
          )}

          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} className="rounded-lg border border-red-300 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
              Delete Account
            </button>
          ) : (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="mb-3 text-sm text-red-700 dark:text-red-400">This will permanently delete your account and all data. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => { setDeleting(true); onDeleteAccount(); }} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{deleting ? "Deleting..." : "Yes, Delete My Account"}</button>
                <button onClick={() => setDeleteConfirm(false)} disabled={deleting} className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
