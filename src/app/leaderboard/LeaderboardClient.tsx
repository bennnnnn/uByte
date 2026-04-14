"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/AuthProvider";

interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak_days: number;
  completed_count: number;
  country: string | null;
}

type Period = "all" | "week";

/** Convert an ISO-3166-1 alpha-2 code to an emoji flag (works on macOS/iOS/Android; Windows 11+). */
function countryFlag(code: string | null): string {
  if (!code || code.length !== 2) return "";
  const offset = 0x1F1E6 - 65; // regional indicator A starts at U+1F1E6
  return String.fromCodePoint(code.charCodeAt(0) + offset, code.charCodeAt(1) + offset);
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl leading-none">🥇</span>;
  if (rank === 2) return <span className="text-xl leading-none">🥈</span>;
  if (rank === 3) return <span className="text-xl leading-none">🥉</span>;
  return <span className="w-6 text-center text-sm font-mono text-zinc-400">{rank}</span>;
}

export default function LeaderboardClient({
  initialUsers,
}: {
  initialUsers: LeaderboardEntry[];
}) {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardEntry[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState<Period>("all");

  const fetchLeaderboard = useCallback((p: Period) => {
    if (users.length === 0) setLoading(true);
    else setRefreshing(true);
    setError("");
    const url = p === "week" ? "/api/leaderboard?period=week" : "/api/leaderboard";
    fetch(url, { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data.users ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [users.length]);

  const handlePeriodChange = (nextPeriod: Period) => {
    if (nextPeriod === period) return;
    setError("");
    setPeriod(nextPeriod);

    if (nextPeriod === "all") {
      setRefreshing(false);
      setUsers(initialUsers);
      return;
    }

    fetchLeaderboard(nextPeriod);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl animate-pulse px-4 py-10 sm:px-6">
        <div className="mb-6 h-7 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-900" />
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
          <Button type="button" size="lg" onClick={() => fetchLeaderboard(period)}>
            Retry
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-8 sm:px-6 sm:py-12">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-100">Leaderboard</h1>
          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
            {period === "week" ? "Top learners by progress this week" : "Top learners by XP"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {refreshing && (
            <span className="inline-flex items-center gap-2 text-xs text-zinc-400 sm:text-sm">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-500" />
              Updating
            </span>
          )}
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
            {(["all", "week"] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  period === p
                    ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {p === "all" ? "All time" : "This week"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {users.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-zinc-400">
            {period === "week" ? "No one active this week yet — get learning!" : "No users yet — be the first!"}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u, i) => {
              const isYou = user && u.id === user.id;
              const flag = countryFlag(u.country);
              return (
                <li
                  key={u.id}
                  className={`flex items-center gap-2 px-3 py-3 transition-colors hover:bg-zinc-50 sm:gap-4 sm:px-4 dark:hover:bg-zinc-900/60 ${
                    isYou ? "bg-indigo-50/80 ring-inset ring-1 ring-indigo-200 dark:bg-indigo-950/30 dark:ring-indigo-800" : ""
                  }`}
                >
                  {/* Rank */}
                  <div className="flex w-6 shrink-0 items-center justify-center sm:w-7">
                    <Medal rank={i + 1} />
                  </div>

                  {/* Avatar */}
                  <div className="shrink-0">
                    <Avatar name={u.name} size="sm" />
                  </div>

                  {/* Name + stats */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <Link
                        href={`/u/${u.id}`}
                        className="truncate font-medium text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                        title={u.name}
                      >
                        {u.name}
                      </Link>
                      {flag && (
                        <span className="text-base leading-none" title={u.country ?? undefined} aria-label={`From ${u.country}`}>
                          {flag}
                        </span>
                      )}
                      {isYou && (
                        <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          You
                        </span>
                      )}
                    </div>
                    {/* Stats — abbreviated on mobile */}
                    <p className="mt-0.5 text-[11px] text-zinc-400 sm:text-xs">
                      <span className="sm:hidden">
                        {u.completed_count}t · {u.streak_days}d
                      </span>
                      <span className="hidden sm:inline">
                        {u.completed_count} tutorial{u.completed_count !== 1 ? "s" : ""} ·{" "}
                        {u.streak_days}d streak
                      </span>
                    </p>
                  </div>

                  {/* XP */}
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-indigo-600 sm:text-base dark:text-indigo-400">
                      {u.xp.toLocaleString()}
                      <span className="ml-0.5 text-[10px] font-normal text-zinc-400 sm:text-xs">
                        {period === "week" ? " pts" : " XP"}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Not on the list nudge */}
      {user && users.length > 0 && !users.some((u) => u.id === user.id) && (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-200 px-4 py-4 text-center dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            You&apos;re not on the leaderboard yet.
          </p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            Complete tutorials to earn XP and appear here.
          </p>
          <Link
            href="/tutorial/go"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Start earning XP →
          </Link>
        </div>
      )}
    </div>
  );
}
