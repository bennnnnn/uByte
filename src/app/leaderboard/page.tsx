"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak_days: number;
  completed_count: number;
  problems_solved: number;
}

// Rank medal colours
function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="w-7 text-center text-sm font-mono text-zinc-400">{rank}</span>;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data.users ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse px-6 py-12">
        <div className="mb-6 h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-500">{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError("");
              setLoading(true);
              fetch("/api/leaderboard", { credentials: "same-origin" })
                .then(async (res) => {
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  const data = await res.json();
                  setUsers(data.users ?? []);
                })
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Leaderboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Top 20 learners by XP · earn XP completing tutorials and solving practice problems
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {users.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-zinc-400">No users yet — be the first!</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u, i) => (
              <li
                key={u.id}
                className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  i < 3 ? "bg-white dark:bg-zinc-950" : "bg-white dark:bg-zinc-950"
                }`}
              >
                <div className="flex w-7 items-center justify-center">
                  <Medal rank={i + 1} />
                </div>

                <Avatar avatarKey={u.avatar || "gopher"} size="sm" />

                <div className="flex-1 min-w-0">
                  <Link href={`/u/${u.id}`} className="truncate font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400">{u.name}</Link>
                  <p className="text-xs text-zinc-400">
                    {u.completed_count} tutorial{u.completed_count !== 1 ? "s" : ""} ·{" "}
                    {u.problems_solved ?? 0} problem{(u.problems_solved ?? 0) !== 1 ? "s" : ""} solved ·{" "}
                    {u.streak_days}d streak
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {u.xp.toLocaleString()} XP
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
