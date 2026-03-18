import { describe, it, expect } from "vitest";
import {
  getAttemptDeadlineMs,
  hasAttemptExpired,
  getOriginalChoiceIndex,
  isDisplayedAnswerCorrect,
  EXAM_SUBMIT_GRACE_MS,
} from "../exams/attempt-utils";

const NOW = 1_700_000_000_000; // fixed timestamp for determinism

describe("EXAM_SUBMIT_GRACE_MS", () => {
  it("is 5 seconds", () => {
    expect(EXAM_SUBMIT_GRACE_MS).toBe(5_000);
  });
});

describe("getAttemptDeadlineMs", () => {
  it("computes deadline as start + duration", () => {
    const start = new Date(NOW).toISOString();
    const deadline = getAttemptDeadlineMs(start, 60);
    expect(deadline).toBe(NOW + 60 * 60_000);
  });

  it("returns null for invalid date", () => {
    expect(getAttemptDeadlineMs("not-a-date", 60)).toBeNull();
  });

  it("handles zero duration", () => {
    const start = new Date(NOW).toISOString();
    expect(getAttemptDeadlineMs(start, 0)).toBe(NOW);
  });
});

describe("hasAttemptExpired", () => {
  it("returns false when within the time window", () => {
    const start = new Date(NOW - 10 * 60_000).toISOString(); // started 10 min ago
    expect(hasAttemptExpired(start, 60, NOW)).toBe(false);
  });

  it("returns true when past deadline", () => {
    const start = new Date(NOW - 61 * 60_000).toISOString(); // started 61 min ago
    expect(hasAttemptExpired(start, 60, NOW)).toBe(true);
  });

  it("returns false when exactly at deadline", () => {
    const start = new Date(NOW - 60 * 60_000).toISOString();
    expect(hasAttemptExpired(start, 60, NOW)).toBe(false);
  });

  it("respects grace period", () => {
    const start = new Date(NOW - 60 * 60_000 - 3_000).toISOString(); // 3s over
    expect(hasAttemptExpired(start, 60, NOW, 5_000)).toBe(false); // within 5s grace
    expect(hasAttemptExpired(start, 60, NOW, 2_000)).toBe(true);  // outside 2s grace
  });

  it("returns false for invalid start date", () => {
    expect(hasAttemptExpired("invalid", 60, NOW)).toBe(false);
  });
});

describe("getOriginalChoiceIndex", () => {
  it("maps displayed index through choice order", () => {
    // choiceOrder = [2, 0, 3, 1] — displayed choice 0 is actually original index 2
    expect(getOriginalChoiceIndex(0, [2, 0, 3, 1])).toBe(2);
    expect(getOriginalChoiceIndex(1, [2, 0, 3, 1])).toBe(0);
  });

  it("returns displayed index when no choiceOrder", () => {
    expect(getOriginalChoiceIndex(1, null)).toBe(1);
    expect(getOriginalChoiceIndex(2, undefined)).toBe(2);
    expect(getOriginalChoiceIndex(0, [])).toBe(0);
  });

  it("returns null for negative displayed index", () => {
    expect(getOriginalChoiceIndex(-1, null)).toBeNull();
  });

  it("returns null for non-integer displayed index", () => {
    expect(getOriginalChoiceIndex(1.5, null)).toBeNull();
  });
});

describe("isDisplayedAnswerCorrect", () => {
  it("returns true when correct without shuffle", () => {
    expect(isDisplayedAnswerCorrect(2, 2, null)).toBe(true);
  });

  it("returns false when wrong without shuffle", () => {
    expect(isDisplayedAnswerCorrect(2, 1, null)).toBe(false);
  });

  it("returns true when displayed answer maps to correct original index", () => {
    // choiceOrder [3, 1, 0, 2]: displayed 1 → original 1 == correctIndex 1 ✓
    expect(isDisplayedAnswerCorrect(1, 1, [3, 1, 0, 2])).toBe(true);
  });

  it("returns false when displayed answer maps to wrong original index", () => {
    // choiceOrder [3, 1, 0, 2]: displayed 0 → original 3, correctIndex is 1 ✗
    expect(isDisplayedAnswerCorrect(1, 0, [3, 1, 0, 2])).toBe(false);
  });

  it("returns false when displayedIndex is undefined", () => {
    expect(isDisplayedAnswerCorrect(0, undefined, null)).toBe(false);
  });

  it("returns false when correctIndex is not an integer", () => {
    expect(isDisplayedAnswerCorrect(NaN, 0, null)).toBe(false);
  });
});
