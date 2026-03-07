import { describe, expect, it } from "vitest";
import {
  EXAM_SUBMIT_GRACE_MS,
  getAttemptDeadlineMs,
  getOriginalChoiceIndex,
  hasAttemptExpired,
  isDisplayedAnswerCorrect,
} from "../exams/attempt-utils";

describe("exam attempt timing", () => {
  it("computes a deadline from the attempt start time", () => {
    const startedAt = "2026-03-06T20:00:00.000Z";
    expect(getAttemptDeadlineMs(startedAt, 45)).toBe(Date.parse(startedAt) + 45 * 60_000);
  });

  it("treats invalid timestamps as non-expired", () => {
    expect(hasAttemptExpired("not-a-date", 45, Date.now())).toBe(false);
  });

  it("supports a small grace window for submit requests", () => {
    const startedAt = "2026-03-06T20:00:00.000Z";
    const deadlineMs = Date.parse(startedAt) + 45 * 60_000;

    expect(hasAttemptExpired(startedAt, 45, deadlineMs + EXAM_SUBMIT_GRACE_MS - 1, EXAM_SUBMIT_GRACE_MS)).toBe(false);
    expect(hasAttemptExpired(startedAt, 45, deadlineMs + EXAM_SUBMIT_GRACE_MS + 1, EXAM_SUBMIT_GRACE_MS)).toBe(true);
  });
});

describe("exam answer grading", () => {
  it("maps a displayed answer index back to the original choice index", () => {
    expect(getOriginalChoiceIndex(0, [2, 0, 3, 1])).toBe(2);
    expect(getOriginalChoiceIndex(3, [2, 0, 3, 1])).toBe(1);
  });

  it("falls back to the displayed index when there is no shuffle order", () => {
    expect(getOriginalChoiceIndex(2)).toBe(2);
  });

  it("grades against the original correct index after shuffling", () => {
    expect(isDisplayedAnswerCorrect(2, 0, [2, 0, 3, 1])).toBe(true);
    expect(isDisplayedAnswerCorrect(2, 1, [2, 0, 3, 1])).toBe(false);
  });
});
