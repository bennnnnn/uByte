"use client";

import Avatar from "@/components/Avatar";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

interface Props {
  editName: string;
  editBio: string;
  onChangeName: (v: string) => void;
  onChangeBio: (v: string) => void;
}

export default function ProfileSection({ editName, editBio, onChangeName, onChangeBio }: Props) {
  return (
    <section>
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Profile</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={editName || "?"} size="lg" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your avatar is generated from your name and updates as you type.
          </p>
        </div>
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <Input id="profile-name" value={editName} onChange={(e) => onChangeName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="profile-bio" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Bio</label>
          <Textarea id="profile-bio" value={editBio} onChange={(e) => onChangeBio(e.target.value)} maxLength={200} rows={2} placeholder="Tell us about yourself..." />
          <p className="mt-1 text-xs text-zinc-400">{editBio.length}/200</p>
        </div>
      </div>
    </section>
  );
}
