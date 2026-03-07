const MINUTE_MS = 60_000;

// Allow a tiny buffer so the browser's auto-submit is not rejected for normal network delay.
export const EXAM_SUBMIT_GRACE_MS = 5_000;

export function getAttemptDeadlineMs(startedAt: string, durationMinutes: number): number | null {
  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs)) return null;

  return startedMs + durationMinutes * MINUTE_MS;
}

export function hasAttemptExpired(
  startedAt: string,
  durationMinutes: number,
  nowMs = Date.now(),
  graceMs = 0
): boolean {
  const deadlineMs = getAttemptDeadlineMs(startedAt, durationMinutes);
  if (deadlineMs == null) return false;

  return nowMs > deadlineMs + graceMs;
}

export function getOriginalChoiceIndex(
  displayedIndex: number,
  choiceOrder?: number[] | null
): number | null {
  if (!Number.isInteger(displayedIndex) || displayedIndex < 0) return null;

  if (Array.isArray(choiceOrder) && choiceOrder.length > 0) {
    const originalIndex = choiceOrder[displayedIndex];
    return Number.isInteger(originalIndex) ? originalIndex : null;
  }

  return displayedIndex;
}

export function isDisplayedAnswerCorrect(
  correctIndex: number,
  displayedIndex: number | undefined,
  choiceOrder?: number[] | null
): boolean {
  if (!Number.isInteger(correctIndex) || displayedIndex == null) return false;

  return getOriginalChoiceIndex(displayedIndex, choiceOrder) === correctIndex;
}
