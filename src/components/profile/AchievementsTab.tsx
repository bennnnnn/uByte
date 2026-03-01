import type { Badge, Achievement } from "./types";

interface Props {
  badges: Badge[];
  achievements: Achievement[];
}

export default function AchievementsTab({ badges, achievements }: Props) {
  const unlockedKeys = new Set(achievements.map((a) => a.badge_key));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {badges.map((badge) => {
        const unlocked = unlockedKeys.has(badge.key);
        return (
          <div
            key={badge.key}
            className={`rounded-xl border p-4 transition-colors ${
              unlocked
                ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30"
                : "border-zinc-200 opacity-50 dark:border-zinc-800"
            }`}
          >
            <div className="mb-2 flex items-center gap-3">
              <span className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{badge.icon}</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{badge.name}</p>
                <p className="text-xs text-zinc-500">{badge.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-600 dark:text-indigo-400">+{badge.xpReward} XP</span>
              {unlocked && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Unlocked ✓</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
