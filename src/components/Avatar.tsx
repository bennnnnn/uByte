const AVATARS: Record<string, { emoji: string; bg: string }> = {
  gopher:  { emoji: "🐹", bg: "bg-indigo-100 dark:bg-indigo-950" },
  cool:    { emoji: "😎", bg: "bg-yellow-100 dark:bg-yellow-950" },
  ninja:   { emoji: "🥷", bg: "bg-zinc-200 dark:bg-zinc-800" },
  party:   { emoji: "🥳", bg: "bg-pink-100 dark:bg-pink-950" },
  robot:   { emoji: "🤖", bg: "bg-blue-100 dark:bg-blue-950" },
  wizard:  { emoji: "🧙", bg: "bg-purple-100 dark:bg-purple-950" },
  astro:   { emoji: "🧑‍🚀", bg: "bg-indigo-100 dark:bg-indigo-950" },
  pirate:  { emoji: "🏴‍☠️", bg: "bg-red-100 dark:bg-red-950" },
};

export const AVATAR_KEYS = Object.keys(AVATARS);

export default function Avatar({ avatarKey, size = "md" }: { avatarKey: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const a = AVATARS[avatarKey] ?? AVATARS.gopher;
  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-16 w-16 text-3xl",
    xl: "h-24 w-24 text-5xl",
  };
  return (
    <div className={`flex items-center justify-center rounded-full ${a.bg} ${sizeClasses[size]}`}>
      {a.emoji}
    </div>
  );
}
