import { getProgressCount, getAchievements, unlockAchievement, getBookmarkCount } from "./db";
import { getAllTutorials } from "./tutorials";
import type { SupportedLanguage } from "./languages/types";
import { ALL_LANGUAGE_KEYS } from "./languages/registry";

export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string; // emoji
  xpReward: number;
  /** If set, this badge is language-specific and only unlocked for that language. */
  language?: SupportedLanguage;
}

const LANG_MASTER_BADGES: BadgeDef[] = [
  { key: "go_master",         name: "Go Master",         description: "Complete all Go tutorials",         icon: "🐹", xpReward: 100, language: "go" },
  { key: "python_master",     name: "Python Master",     description: "Complete all Python tutorials",     icon: "🐍", xpReward: 100, language: "python" },
  { key: "javascript_master", name: "JavaScript Master", description: "Complete all JavaScript tutorials", icon: "🌐", xpReward: 100, language: "javascript" },
  { key: "java_master",       name: "Java Master",       description: "Complete all Java tutorials",       icon: "☕", xpReward: 100, language: "java" },
  { key: "cpp_master",        name: "C++ Master",        description: "Complete all C++ tutorials",        icon: "⚡", xpReward: 100, language: "cpp" },
  { key: "rust_master",       name: "Rust Master",       description: "Complete all Rust tutorials",       icon: "🦀", xpReward: 100, language: "rust" },
  { key: "csharp_master",     name: "C# Master",         description: "Complete all C# tutorials",         icon: "🔷", xpReward: 100, language: "csharp" },
];

export const BADGES: BadgeDef[] = [
  { key: "first_tutorial", name: "First Steps",   description: "Complete your first tutorial",                              icon: "🎯", xpReward: 20 },
  { key: "three_done",     name: "Getting Serious", description: "Complete 3 tutorials",                                   icon: "🚀", xpReward: 30 },
  { key: "all_done",       name: "Polyglot",      description: "Complete all tutorials in every language",                  icon: "🏆", xpReward: 500 },
  { key: "streak_3",       name: "On Fire",       description: "Maintain a 3-day streak",                                  icon: "🔥", xpReward: 25 },
  { key: "streak_7",       name: "Unstoppable",   description: "Maintain a 7-day streak",                                  icon: "⚡", xpReward: 50 },
  { key: "streak_30",      name: "Legendary",     description: "Maintain a 30-day streak",                                 icon: "👑", xpReward: 200 },
  { key: "bookworm",       name: "Bookworm",      description: "Save 5 code bookmarks",                                    icon: "📚", xpReward: 25 },
  { key: "speedster",      name: "Speedster",     description: "Complete a tutorial the same day you start",               icon: "⏱️", xpReward: 15 },
  ...LANG_MASTER_BADGES,
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.key, b]));

function getTotalTutorialsForLang(lang: SupportedLanguage): number {
  try {
    return getAllTutorials(lang).length;
  } catch {
    return 5;
  }
}

function getTotalTutorialsAllLangs(): number {
  try {
    return ALL_LANGUAGE_KEYS.reduce((sum, lang) => sum + getAllTutorials(lang).length, 0);
  } catch {
    return 35;
  }
}

/**
 * Check all badges for a user and unlock any newly earned ones.
 * Pass `language` when checking after a tutorial completion so per-language
 * master badges are evaluated correctly.
 * Returns list of newly unlocked badge keys.
 */
export async function checkBadges(
  userId: number,
  context: {
    streakDays?: number;
    justCompletedSlug?: string;
    speedster?: boolean;
    language?: SupportedLanguage;
  } = {}
): Promise<string[]> {
  const [existingArr, totalCompletedCount, bookmarkCount] = await Promise.all([
    getAchievements(userId),
    getProgressCount(userId),
    getBookmarkCount(userId),
  ]);

  const existing = new Set(existingArr.map((a) => a.badge_key));
  const newlyUnlocked: string[] = [];

  const tryUnlock = async (key: string) => {
    if (existing.has(key)) return;
    if (await unlockAchievement(userId, key)) {
      newlyUnlocked.push(key);
    }
  };

  const unlockPromises: Promise<void>[] = [];

  // Progress badges (total across all languages)
  if (totalCompletedCount >= 1) unlockPromises.push(tryUnlock("first_tutorial"));
  if (totalCompletedCount >= 3) unlockPromises.push(tryUnlock("three_done"));

  // Per-language master badge — only check if we know which language was just used
  const lang = context.language;
  if (lang) {
    const masterKey = `${lang}_master`;
    if (!existing.has(masterKey)) {
      const langCount = await getProgressCount(userId, lang);
      const totalForLang = getTotalTutorialsForLang(lang);
      if (totalForLang > 0 && langCount >= totalForLang) {
        unlockPromises.push(tryUnlock(masterKey));
      }
    }
  }

  // "Polyglot" — completed every tutorial in every language
  if (!existing.has("all_done")) {
    const totalAcrossAll = getTotalTutorialsAllLangs();
    if (totalAcrossAll > 0 && totalCompletedCount >= totalAcrossAll) {
      unlockPromises.push(tryUnlock("all_done"));
    }
  }

  // Streak badges
  const streak = context.streakDays ?? 0;
  if (streak >= 3)  unlockPromises.push(tryUnlock("streak_3"));
  if (streak >= 7)  unlockPromises.push(tryUnlock("streak_7"));
  if (streak >= 30) unlockPromises.push(tryUnlock("streak_30"));

  // Bookmark badge
  if (bookmarkCount >= 5) unlockPromises.push(tryUnlock("bookworm"));

  // Speedster
  if (context.speedster) unlockPromises.push(tryUnlock("speedster"));

  await Promise.all(unlockPromises);
  return newlyUnlocked;
}
