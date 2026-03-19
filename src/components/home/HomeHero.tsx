"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface Props {
  totalLessons: number;
  problemCount: number;
  certCount: number;
}

export default function HomeHero({ totalLessons, problemCount, certCount }: Props) {
  const { user } = useAuth();

  const isLoggedIn = !!user;
  const firstName = (user as { name?: string } | null)?.name?.split(" ")[0];

  return (
    <section className="border-b border-zinc-100 bg-white py-16 sm:py-20 lg:py-24 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">

        {/* Badge */}
        {isLoggedIn && firstName ? (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-800">
            👋 Welcome back, {firstName}
          </p>
        ) : (
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-800">
            ✨ Free tutorials · Interview prep · Certifications
          </p>
        )}

        {/* Headline */}
        {isLoggedIn && firstName ? (
          <>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-100">
              Keep the{" "}
              <span className="text-indigo-600 dark:text-indigo-400">momentum</span>{" "}
              going.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              Pick up where you left off, tackle a new challenge, or take a certification exam — all free.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-100">
              The best way to{" "}
              <span className="text-indigo-600 dark:text-indigo-400">master coding</span>{" "}
              and get hired.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              Interactive tutorials, 114+ practice problems, and free certification exams — all in one place.
              Write and run code directly in your browser. Zero setup.
            </p>
          </>
        )}

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/tutorial/go"
                className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
              >
                Continue learning
              </Link>
              <Link
                href="/certifications"
                className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-sm font-bold text-zinc-700 transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Take a certification exam
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
              >
                Start for free
              </Link>
              <Link
                href="/tutorial/go"
                className="rounded-xl border border-zinc-200 bg-white px-7 py-3 text-sm font-bold text-zinc-700 transition-all hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Browse tutorials
              </Link>
            </>
          )}
        </div>

        {/* Quick language links */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-zinc-400">Popular:</span>
          {[
            { label: "Go", href: "/tutorial/go" },
            { label: "Python", href: "/tutorial/python" },
            { label: "TypeScript", href: "/tutorial/typescript" },
            { label: "SQL", href: "/tutorial/sql" },
            { label: "Interview Prep", href: "/practice" },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 border-t border-zinc-100 pt-8 dark:border-zinc-800">
          {[
            { value: "9",               label: "Languages" },
            { value: `${totalLessons}+`,label: "Lessons" },
            { value: `${problemCount}+`,label: "Practice problems" },
            { value: `${certCount}`,    label: "Free certifications" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
