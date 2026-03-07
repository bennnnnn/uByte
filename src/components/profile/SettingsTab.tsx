"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import Button from "@/components/ui/Button";
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
      <DangerZoneSection onDeleteAccount={onDeleteAccount} onResetProgress={onResetProgress} onLogoutAll={onLogoutAll} onToast={toast} />
    </div>
  );
}
