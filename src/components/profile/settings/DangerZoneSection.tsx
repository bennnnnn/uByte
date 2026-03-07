"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import SettingsSectionHeader from "./SettingsSectionHeader";

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
        <SettingsSectionHeader
          title="Your Data"
          description="Download a copy of all your data — profile, progress, badges, bookmarks, and activity."
        />
        <Button variant="secondary" size="lg" onClick={handleExport} disabled={exporting}>
          {exporting ? "Preparing…" : "Download My Data"}
        </Button>
      </section>

      {/* Security */}
      <section>
        <SettingsSectionHeader
          title="Security"
          description="Instantly invalidate all active sessions on every device. You will be logged out here too."
        />
        <Button variant="secondary" size="lg" onClick={handleLogoutAll} disabled={loggingOutAll}>
          {loggingOutAll ? "Logging out…" : "Log Out All Devices"}
        </Button>
      </section>

      {/* Danger zone */}
      <section>
        <SettingsSectionHeader title="Danger Zone" titleClassName="text-red-600" />
        <div className="space-y-3">
          {!resetConfirm ? (
            <button onClick={() => setResetConfirm(true)} className="rounded-lg border border-orange-300 px-6 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950">
              Reset All Progress
            </button>
          ) : (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
              <p className="mb-3 text-sm text-orange-700 dark:text-orange-400">This will permanently delete all your tutorial progress, badges, XP, and streaks. This cannot be undone.</p>
              <div className="flex gap-3">
                <Button variant="danger" onClick={handleResetProgress} disabled={resetting}>
                  {resetting ? "Resetting…" : "Yes, Reset Everything"}
                </Button>
                <Button variant="ghost" onClick={() => setResetConfirm(false)} disabled={resetting}>Cancel</Button>
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
                <Button variant="danger" onClick={() => { setDeleting(true); onDeleteAccount(); }} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes, Delete My Account"}
                </Button>
                <Button variant="ghost" onClick={() => setDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
