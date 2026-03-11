"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { getAllLanguageSlugs, LANGUAGES } from "@/lib/languages/registry";
import type { Difficulty } from "@/lib/practice/types";

const DURATIONS = [
  { value: 20, label: "20 min", desc: "Quick warm-up" },
  { value: 45, label: "45 min", desc: "Real interview length" },
  { value: 60, label: "60 min", desc: "Extended practice" },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string; selectedColor: string }[] = [
  {
    value: "easy",
    label: "Easy",
    color: "border-emerald-200 hover:border-emerald-400 dark:border-emerald-800 dark:hover:border-emerald-500",
    selectedColor: "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30",
  },
  {
    value: "medium",
    label: "Medium",
    color: "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-500",
    selectedColor: "border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-950/30",
  },
  {
    value: "hard",
    label: "Hard",
    color: "border-red-200 hover:border-red-400 dark:border-red-800 dark:hover:border-red-500",
    selectedColor: "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/30",
  },
];

const LANG_ICONS: Record<string, string> = {
  go: "🐹", python: "🐍", javascript: "🟨", java: "☕", rust: "🦀", cpp: "⚙️", csharp: "💜",
};

export default function InterviewSimulatorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [duration, setDuration] = useState(45);
  const [language, setLanguage] = useState("go");
  const [starting, setStarting] = useState(false);

  const languageSlugs = getAllLanguageSlugs();

  function startInterview() {
    setStarting(true);
    const problems = getAllPracticeProblems().filter((p) => p.difficulty === difficulty && p.testCases?.length);
    if (problems.length === 0) {
      setStarting(false);
      return;
    }
    // Pick a random problem
    const problem = problems[Math.floor(Math.random() * problems.length)];
    const deadline = Date.now() + duration * 60 * 1000;
    router.push(`/practice/${language}/${problem.slug}?mode=interview&deadline=${deadline}`);
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-4xl">🎤</span>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white">Interview Simulator</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Sign in to start a mock technical interview.</p>
        <Link href="/signup" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500">
          Sign up free →
        </Link>
        <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Already have an account? Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <span className="mb-3 block text-4xl">🎤</span>
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Interview Simulator</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Simulate a real technical interview. You&apos;ll get a random problem, a countdown timer,
          and an AI debrief after you submit.
        </p>
      </div>

      {/* What to expect */}
      <div className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">What to expect</p>
        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="flex items-start gap-2"><span className="mt-0.5 text-indigo-400">•</span> A random coding problem matching your chosen difficulty</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-indigo-400">•</span> A visible countdown timer — just like a real interview</li>
          <li className="flex items-start gap-2"><span className="mt-0.5 text-indigo-400">•</span> Full AI debrief after you submit: complexity, style, improvements</li>
        </ul>
      </div>

      {/* Language */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Language</p>
        <div className="flex flex-wrap gap-2">
          {languageSlugs.map((slug) => {
            const config = LANGUAGES[slug as keyof typeof LANGUAGES];
            if (!config) return null;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => setLanguage(slug)}
                className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                  language === slug
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500"
                }`}
              >
                <span>{LANG_ICONS[slug] ?? ""}</span>
                {config.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Difficulty</p>
        <div className="grid grid-cols-3 gap-3">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`rounded-xl border-2 py-3 text-sm font-bold transition-all capitalize ${
                difficulty === d.value ? d.selectedColor : d.color + " bg-white dark:bg-zinc-900"
              } text-zinc-800 dark:text-zinc-200`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Time limit</p>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDuration(d.value)}
              className={`rounded-xl border-2 py-3 text-center transition-all ${
                duration === d.value
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30"
                  : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
              }`}
            >
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{d.label}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={startInterview}
        disabled={starting}
        className="w-full rounded-xl bg-indigo-600 py-4 text-base font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
      >
        {starting ? "Loading problem…" : "Start interview →"}
      </button>

      <p className="mt-4 text-center text-xs text-zinc-400">
        Problems are randomly selected — you won&apos;t know which one until you start.
      </p>
    </div>
  );
}
