"use client";

import Avatar, { AVATAR_KEYS } from "@/components/Avatar";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import type { Profile } from "../types";

interface Props {
  profile: Profile;
  editName: string;
  editBio: string;
  editAvatar: string;
  onChangeName: (v: string) => void;
  onChangeBio: (v: string) => void;
  onChangeAvatar: (v: string) => void;
}

export default function ProfileSection({
  editName,
  editBio,
  editAvatar,
  onChangeName,
  onChangeBio,
  onChangeAvatar,
}: Props) {
  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <Input value={editName} onChange={(e) => onChangeName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
          <Textarea value={editBio} onChange={(e) => onChangeBio(e.target.value)} maxLength={200} rows={2} placeholder="Tell us about yourself..." />
          <p className="mt-1 text-xs text-zinc-400">{editBio.length}/200</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Avatar</label>
          <div className="flex flex-wrap gap-3">
            {AVATAR_KEYS.map((key) => (
              <button key={key} onClick={() => onChangeAvatar(key)} aria-label={`Select ${key} avatar`} aria-pressed={editAvatar === key} className={`rounded-full ring-2 ring-offset-2 transition-all ${editAvatar === key ? "ring-indigo-500" : "ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600"}`}>
                <Avatar avatarKey={key} size="md" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
