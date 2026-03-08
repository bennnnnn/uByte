"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/components/AuthProvider";

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak_days: number;
  completed_count: number;
  problems_solved: number;
}

type Period = "all" | "week";

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="w-7 text-center text-sm font-mono text-zinc-400">{rank}</span>;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => { if (!cancelled) setLoading(true); });
    const url = period === "week" ? "/api/leaderboard?period=week" : "/api/leaderboard";
    fetch(url, { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setUsers(data.users ?? []);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

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
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setError("");
              setLoading(true);
              const u = period === "week" ? "/api/leaderboard?period=week" : "/api/leaderboard";
            fetch(u, { credentials: "same-origin" })
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Leaderboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Top 20 learners by XP · earn XP completing tutorials and solving interview prep problems
          </p>
        </div>
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => setPeriod("all")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "all" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            All time
          </button>
          <button
            type="button"
            onClick={() => setPeriod("week")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === "week" ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100" : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            This week
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-6 w-7 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-32 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="h-5 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-zinc-400">
            {period === "week" ? "No one active this week yet — get learning!" : "No users yet — be the first!"}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u, i) => {
              const isYou = user && u.id === user.id;
              return (
                <li
                  key={u.id}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                    isYou ? "bg-indigo-50/80 dark:bg-indigo-950/30 ring-inset ring-1 ring-indigo-200 dark:ring-indigo-800" : ""
                  }`}
                >
                  <div className="flex w-7 items-center justify-center">
                    <Medal rank={i + 1} />
                  </div>

                  <Avatar avatarKey={u.avatar || "gopher"} size="sm" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/u/${u.id}`} className="truncate font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400" title={u.name}>{u.name}</Link>
                      {isYou && (
                        <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          You
                        </span>
                      )}
                    </div>
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
