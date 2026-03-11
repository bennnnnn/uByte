"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import { getAllLanguageSlugs, LANGUAGES } from "@/lib/languages/registry";
import type { LeaderboardEntry } from "@/lib/db/types";

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", javascript: "🟨", java: "☕", rust: "🦀", cpp: "⚙️", csharp: "💜",
};

function getPreferredLanguage(): string {
  if (typeof window === "undefined") return "go";
  return localStorage.getItem("preferred_lang") ?? "go";
}

function savePreferredLanguage(lang: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("preferred_lang", lang);
  }
}

interface DailyData {
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  solvedToday: number;
  userSolvedToday: boolean;
  date: string;
}

const DIFFICULTY_COLOR = {
  easy: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800",
  medium: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800",
  hard: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800",
};

export default function DailyChallengePage() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<DailyData | null>(null);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState("go");

  const languageSlugs = getAllLanguageSlugs();

  // Initialise preferred language from localStorage (client-only)
  useEffect(() => {
    setSelectedLang(getPreferredLanguage());
  }, []);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/daily-challenge").then((r) => r.json()),
      apiFetch("/api/leaderboard?period=week").then((r) => r.json()),
    ])    .then(([d, l]) => {
      setDaily(d?.slug ? d : null);
      setLeaders(Array.isArray(l) ? l.slice(0, 10) : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handleLangChange(lang: string) {
    setSelectedLang(lang);
    savePreferredLanguage(lang);
  }

  const todayFormatted = daily?.date
    ? new Date(daily.date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
    : "";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="animate-pulse text-zinc-400">Loading today&apos;s challenge…</span>
      </div>
    );
  }

  if (!daily) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Could not load today&apos;s challenge. Try again later.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Daily Challenge</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{todayFormatted}</p>
      </div>

      {/* Challenge card */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-5 dark:border-zinc-800 dark:from-indigo-950/30 dark:to-violet-950/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {daily.category?.replace(/-/g, " ")}
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{daily.title}</h2>
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLOR[daily.difficulty]}`}>
              {daily.difficulty}
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span>👥</span>
              <span><strong className="text-zinc-800 dark:text-zinc-200">{daily.solvedToday}</strong> solved today</span>
            </div>
            {daily.userSolvedToday && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span>✅</span>
                <span className="font-medium">You solved it!</span>
              </div>
            )}
          </div>

          {/* Language selector */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {languageSlugs.map((slug) => {
              const config = LANGUAGES[slug as keyof typeof LANGUAGES];
              if (!config) return null;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => handleLangChange(slug)}
                  title={config.name}
                  className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                    selectedLang === slug
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  <span>{LANG_ICONS[slug] ?? ""}</span>
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-3">
            <Link
              href={`/practice/${selectedLang}/${daily.slug}${daily.userSolvedToday ? "" : "?daily=1"}`}
              className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              {daily.userSolvedToday ? "Solve again →" : "Solve challenge →"}
            </Link>
            {!user && (
              <Link
                href="/signup"
                className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Sign up to track progress
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Weekly leaderboard */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">This week&apos;s leaderboard</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Top developers by XP earned this week</p>
        </div>
        {leaders.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-zinc-400">No data yet — be the first!</div>
        ) : (
          <ol className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {leaders.map((entry, i) => (
              <li key={entry.id} className="flex items-center gap-3 px-6 py-3">
                <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-amber-500" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-zinc-400 dark:text-zinc-500"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <Avatar avatarKey={entry.avatar ?? "gopher"} size="sm" />
                <Link href={`/u/${entry.id}`} className="flex-1 truncate text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-indigo-400">
                  {entry.name}
                </Link>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{entry.xp.toLocaleString()} XP</span>
              </li>
            ))}
          </ol>
        )}
        <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
          <Link href="/leaderboard" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Full leaderboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
