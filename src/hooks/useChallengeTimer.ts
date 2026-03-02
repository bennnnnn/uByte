"use client";

import { useState, useRef, useCallback } from "react";

export interface ChallengeTimerState {
  elapsed: number;
  display: string;
  running: boolean;
  start: () => void;
  stop: () => number;
  reset: () => void;
}

function formatDisplay(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

export function useChallengeTimer(): ChallengeTimerState {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (running) return;
    startTimeRef.current = Date.now() - elapsed;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Date.now() - (startTimeRef.current ?? Date.now()));
    }, 100);
  }, [running, elapsed]);

  const stop = useCallback((): number => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    return elapsed;
  }, [elapsed]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setElapsed(0);
    startTimeRef.current = null;
  }, []);

  return {
    elapsed,
    display: formatDisplay(elapsed),
    running,
    start,
    stop,
    reset,
  };
}
