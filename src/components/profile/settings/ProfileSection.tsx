"use client";

import Avatar, { AVATAR_KEYS } from "@/components/Avatar";
import type { Profile } from "../types";

interface Props {
  profile: Profile;
  editName: string;
  editBio: string;
  editAvatar: string;
  saving: boolean;
  onChangeName: (v: string) => void;
  onChangeBio: (v: string) => void;
  onChangeAvatar: (v: string) => void;
  onSave: () => void;
}

export default function ProfileSection({
  editName,
  editBio,
  editAvatar,
  saving,
  onChangeName,
  onChangeBio,
  onChangeAvatar,
  onSave,
}: Props) {
  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input value={editName} onChange={(e) => onChangeName(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
          <textarea value={editBio} onChange={(e) => onChangeBio(e.target.value)} maxLength={200} rows={2} className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" placeholder="Tell us about yourself..." />
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
        <button onClick={onSave} disabled={saving} className="rounded-lg bg-indigo-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
