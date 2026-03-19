"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  totalLessons: number;
  problemCount: number;
  certCount: number;
}

export default function HomeHero({ totalLessons, problemCount, certCount }: Props) {
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const isLoggedIn = !!user;
  const firstName = profile ? (user as { name?: string })?.name?.split(" ")[0] : null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-indigo-950/40 to-zinc-950 py-20 sm:py-28 lg:py-32">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
      {/* Radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        {isLoggedIn && firstName ? (
          // Returning user
          <>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-300">
              👋 Welcome back, {firstName}
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Keep the{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                momentum
              </span>{" "}
              going.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
              You&apos;re making progress. Pick up where you left off, tackle a new challenge, or take a certification exam.
            </p>
          </>
        ) : (
          // Guest
          <>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-300">
              ✨ Learn · Practice · Get Certified
            </p>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              The fastest way to{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                master coding
              </span>{" "}
              and get hired.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-300">
              Interactive tutorials, real interview prep, and industry certifications — all in one place.
              Write and run code directly in your browser. No setup required.
            </p>
          </>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tutorials, topics, languages…"
              className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-400 outline-none backdrop-blur-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Search
          </button>
        </form>

        {/* Quick tags */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {["Go", "Python", "TypeScript", "SQL", "Interview Prep"].map(tag => (
            <Link
              key={tag}
              href={tag === "Interview Prep" ? "/practice" : `/tutorial/${tag.toLowerCase()}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        {!isLoggedIn && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl"
            >
              Start for free
            </Link>
            <Link
              href="/certifications"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:border-white/30 hover:bg-white/10"
            >
              View certifications
            </Link>
          </div>
        )}

        {/* Stats bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "9", label: "Languages" },
            { value: `${totalLessons}+`, label: "Lessons" },
            { value: `${problemCount}+`, label: "Practice problems" },
            { value: `${certCount}`, label: "Free certifications" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
