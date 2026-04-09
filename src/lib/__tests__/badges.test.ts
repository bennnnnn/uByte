import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB functions before importing badges
vi.mock("../db", () => ({
  getProgressCount: vi.fn(async () => 0),
  getAchievements: vi.fn(async () => []),
  unlockAchievement: vi.fn(async () => true),
  getBookmarkTotal: vi.fn(async () => 0),
}));

vi.mock("../tutorials", () => ({
  getAllTutorials: vi.fn(() => [
    { slug: "a" },
    { slug: "b" },
    { slug: "c" },
    { slug: "d" },
    { slug: "e" },
  ]),
}));

import { checkBadges, BADGES, BADGE_MAP } from "../badges";
import * as db from "../db";

const mockGetProgressCount = vi.mocked(db.getProgressCount);
const mockGetAchievements = vi.mocked(db.getAchievements);
const mockGetBookmarkTotal = vi.mocked(db.getBookmarkTotal);
const mockUnlockAchievement = vi.mocked(db.unlockAchievement);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAchievements.mockResolvedValue([]);
  mockGetProgressCount.mockResolvedValue(0);
  mockGetBookmarkTotal.mockResolvedValue(0);
  mockUnlockAchievement.mockResolvedValue(true);
});

describe("BADGES", () => {
  it("has 8 badge definitions", () => {
    expect(BADGES).toHaveLength(15); // 8 base + 7 language master badges
  });

  it("BADGE_MAP indexes by key", () => {
    expect(BADGE_MAP["first_tutorial"]).toBeDefined();
    expect(BADGE_MAP["first_tutorial"].name).toBe("First Steps");
  });
});

describe("checkBadges", () => {
  it("unlocks first_tutorial when 1 completed", async () => {
    mockGetProgressCount.mockResolvedValue(1);
    const unlocked = await checkBadges(1, { justCompletedSlug: "a" });
    expect(unlocked).toContain("first_tutorial");
  });

  it("unlocks three_done when 3 completed", async () => {
    mockGetProgressCount.mockResolvedValue(3);
    const unlocked = await checkBadges(1);
    expect(unlocked).toContain("first_tutorial");
    expect(unlocked).toContain("three_done");
  });

  it("unlocks all_done when all tutorials completed", async () => {
    // getAllTutorials mock returns 5 items per language call.
    // ALL_LANGUAGE_KEYS has 9 languages, so total = 9 * 5 = 45.
    mockGetProgressCount.mockResolvedValue(45);
    const unlocked = await checkBadges(1);
    expect(unlocked).toContain("all_done");
  });

  it("does not re-unlock already earned badges", async () => {
    mockGetProgressCount.mockResolvedValue(3);
    mockGetAchievements.mockResolvedValue([
      { badge_key: "first_tutorial", unlocked_at: "2024-01-01" },
    ]);
    const unlocked = await checkBadges(1);
    expect(unlocked).not.toContain("first_tutorial");
    expect(unlocked).toContain("three_done");
  });

  it("unlocks streak badges based on context.streakDays", async () => {
    const unlocked = await checkBadges(1, { streakDays: 7 });
    expect(unlocked).toContain("streak_3");
    expect(unlocked).toContain("streak_7");
    expect(unlocked).not.toContain("streak_30");
  });

  it("unlocks bookworm when 5+ bookmarks", async () => {
    mockGetBookmarkTotal.mockResolvedValue(5);
    const unlocked = await checkBadges(1);
    expect(unlocked).toContain("bookworm");
  });

  it("unlocks speedster when context.speedster is true", async () => {
    const unlocked = await checkBadges(1, { speedster: true });
    expect(unlocked).toContain("speedster");
  });

  it("does not unlock speedster when flag is false", async () => {
    const unlocked = await checkBadges(1, { speedster: false });
    expect(unlocked).not.toContain("speedster");
  });

  it("returns empty array when nothing new to unlock", async () => {
    mockGetAchievements.mockResolvedValue(
      BADGES.map((b) => ({ badge_key: b.key, unlocked_at: "2024-01-01" }))
    );
    mockGetProgressCount.mockResolvedValue(5);
    mockGetBookmarkTotal.mockResolvedValue(10);
    const unlocked = await checkBadges(1, { streakDays: 30, speedster: true });
    expect(unlocked).toEqual([]);
  });
});
