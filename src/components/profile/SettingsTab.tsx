"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import type { Profile } from "./types";
import ProfileSection from "./settings/ProfileSection";
import PasswordSection from "./settings/PasswordSection";
import AppearanceSection from "./settings/AppearanceSection";
import DangerZoneSection from "./settings/DangerZoneSection";

interface Props {
  profile: Profile;
  plan?: string;
  onSave: (data: { name: string; bio: string; avatar: string; theme: string }) => Promise<boolean>;
  onChangePassword: (currentPw: string, newPw: string) => Promise<string | null>;
  onDeleteAccount: () => Promise<void>;
  onResetProgress: () => Promise<void>;
  onLogoutAll: () => Promise<void>;
}

export default function SettingsTab({ profile, onSave, onChangePassword, onDeleteAccount, onResetProgress, onLogoutAll }: Props) {
  const { toast } = useToast();
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editTheme, setEditTheme] = useState(profile.theme || "dark");
  const [saving, setSaving] = useState(false);
  const [emailMarketing, setEmailMarketing] = useState(profile.email_marketing !== false);
  const [emailSaving, setEmailSaving] = useState(false);

  async function handleEmailMarketingToggle(enabled: boolean) {
    setEmailMarketing(enabled);
    setEmailSaving(true);
    try {
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_marketing: enabled }),
      });
      if (res.ok) {
        toast(enabled ? "Marketing emails enabled." : "You've been unsubscribed from marketing emails.");
      } else {
        setEmailMarketing(!enabled);
        toast("Failed to update preference.", "error");
      }
    } catch {
      setEmailMarketing(!enabled);
      toast("Failed to update preference.", "error");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await onSave({ name: editName, bio: editBio, avatar: editAvatar, theme: editTheme });
      if (ok) toast("Profile saved!");
      else toast("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <ProfileSection
        profile={profile}
        editName={editName}
        editBio={editBio}
        editAvatar={editAvatar}
        onChangeName={setEditName}
        onChangeBio={setEditBio}
        onChangeAvatar={setEditAvatar}
      />
      <PasswordSection profile={profile} onChangePassword={onChangePassword} onToast={toast} />
      <AppearanceSection editTheme={editTheme} onChangeTheme={setEditTheme} />
      <div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
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
              type="checkbox"
              checked={emailMarketing}
              disabled={emailSaving}
              onChange={(e) => handleEmailMarketingToggle(e.target.checked)}
              className="sr-only"
            />
            <div
              onClick={() => !emailSaving && handleEmailMarketingToggle(!emailMarketing)}
              className={`h-5 w-9 cursor-pointer rounded-full transition-colors ${emailMarketing ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-600"} ${emailSaving ? "opacity-60" : ""}`}
            >
              <div className={`mt-0.5 ml-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${emailMarketing ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Marketing &amp; progress emails</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Weekly digest, streak reminders, onboarding tips, and win-back nudges.
            </p>
          </div>
        </label>
      </div>

      <DangerZoneSection onDeleteAccount={onDeleteAccount} onResetProgress={onResetProgress} onLogoutAll={onLogoutAll} onToast={toast} />
    </div>
  );
}
