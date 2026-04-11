import Avatar from "@/components/Avatar";

interface Props {
  name: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
  emailVerified?: boolean;
  isGoogleAccount?: boolean;
}

export default function ProfileHeader({ name, email, bio, avatar, createdAt, emailVerified, isGoogleAccount }: Props) {
  const joinDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showVerifyBanner = !isGoogleAccount && !emailVerified;

  return (
    <div className="mb-10">
      {showVerifyBanner && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Please check your inbox and verify your email address to secure your account.
          </p>
        </div>
      )}
      <div className="flex items-start gap-6">
        <Avatar name={name} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
          {bio && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{bio}</p>}
          <p className="mt-1 text-xs text-zinc-400">Joined {joinDate}</p>
        </div>
      </div>
    </div>
  );
}
