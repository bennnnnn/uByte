"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import type { Profile } from "./types";
import ProfileSection from "./settings/ProfileSection";
import PasswordSection from "./settings/PasswordSection";
import DangerZoneSection from "./settings/DangerZoneSection";

interface Props {
  profile: Profile;
  plan?: string;
  onSave: (data: { name: string; bio: string }) => Promise<boolean>;
  onChangePassword: (currentPw: string, newPw: string) => Promise<string | null>;
  onDeleteAccount: () => Promise<void>;
  onResetProgress: () => Promise<void>;
  onLogoutAll: () => Promise<void>;
  /** When true, DangerZone section is omitted so the parent page can render it in a different position. Default: true */
  renderDangerZone?: boolean;
}

export default function SettingsTab({ profile, onSave, onChangePassword, onDeleteAccount, onResetProgress, onLogoutAll, renderDangerZone = true }: Props) {
  const { toast } = useToast();
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const ok = await onSave({ name: editName, bio: editBio });
    setSaving(false);
    if (ok) toast("Profile saved.");
    else toast("Failed to save profile.", "error");
  };

  const handleEmailMarketingToggle = async (enabled: boolean) => {
    setEmailSaving(true);
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_marketing: enabled }),
      });
      setEmailMarketing(enabled);
      toast(enabled ? "Marketing emails enabled." : "You've been unsubscribed from marketing emails.");
    } catch {
      toast("Failed to update email preferences.", "error");
    } finally {
      setEmailSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <ProfileSection
        editName={editName}
        editBio={editBio}
        onChangeName={setEditName}
        onChangeBio={setEditBio}
      />
      <PasswordSection profile={profile} onChangePassword={onChangePassword} onToast={toast} />

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {saving && <span className="text-sm text-zinc-400">Saving your profile...</span>}
      </div>

      {/* Email preferences */}
      <div className="rounded-2xl border border-zinc-200 bg-surface-card p-6 dark:border-zinc-800">
        <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-zinc-100">Email preferences</h3>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Control which emails you receive from uByte. Transactional emails (password resets, security alerts) are always sent.
        </p>
        <label className="flex cursor-pointer items-start gap-3">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              id="email-marketing-opt-in"
              name="email_marketing"
              type="checkbox"
              checked={emailMarketing}
              disabled={emailSaving}
              onChange={(e) => handleEmailMarketingToggle(e.target.checked)}
              className="sr-only"
            />
            <div className={`h-5 w-9 rounded-full transition-colors ${emailMarketing ? "bg-indigo-600" : "bg-zinc-300"}`}>
              <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${emailMarketing ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Marketing emails</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Tips, new tutorials, and product updates</span>
          </div>
        </label>
      </div>

      {renderDangerZone && (
        <DangerZoneSection
          onDeleteAccount={onDeleteAccount}
          onResetProgress={onResetProgress}
          onLogoutAll={onLogoutAll}
          onToast={toast}
        />
      )}
    </div>
  );
}
