"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface Props {
  experienceId: number;
  initialScore: number;
}

export default function VoteButton({ experienceId, initialScore }: Props) {
  const [score,  setScore]  = useState(initialScore);
  const [voted,  setVoted]  = useState(false);   // true after this session voted
  const [busy,   setBusy]   = useState(false);

  const handleVote = async (vote: 1 | -1) => {
    if (busy) return;

    // Optimistic toggle: clicking the same direction again un-votes
    const next = voted ? 0 : vote;
    setScore(initialScore + next);
    setVoted(next !== 0);
    setBusy(true);

    try {
      await apiFetch(`/api/interview-experiences/${experienceId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: next === 0 ? -1 : vote }),  // send actual direction
      });
    } catch {
      // roll back on error
      setScore(initialScore);
      setVoted(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        type="button"
        onClick={() => void handleVote(1)}
        disabled={busy}
        aria-label="Mark as helpful"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
          voted
            ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
            : "border-zinc-200 bg-white text-zinc-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
        }`}
      >
        <svg
          className="h-3.5 w-3.5"
          fill={voted ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
        </svg>
        Helpful
        {score !== 0 && (
          <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
            voted ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          }`}>
            {score > 0 ? `+${score}` : score}
          </span>
        )}
      </button>
    </div>
  );
}
