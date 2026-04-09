import Link from "next/link";
import type { LanguageConfig } from "@/lib/languages/types";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  config: LanguageConfig;
  firstSlug: string | null;
  topicCount: number;
  lessonCount: number;
  estimatedHours: number;
  bestFor: string;
  intro: string;
}

export default function TutorialLangHero({
  config,
  firstSlug,
  topicCount,
  lessonCount,
  estimatedHours,
  bestFor,
  intro,
}: Props) {
  return (
    <section className="mb-14 rounded-[32px] border border-zinc-200 bg-gradient-to-br from-white via-indigo-50/50 to-zinc-50 p-7 shadow-sm dark:border-zinc-800 dark:from-zinc-950 dark:via-indigo-950/20 dark:to-zinc-900">
      <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-800 dark:bg-zinc-900/80 dark:text-indigo-300">
        {bestFor}
      </p>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
        Learn {config.name}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
        {intro}
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {topicCount} topics
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {lessonCount} lessons
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1.5 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          Estimated {estimatedHours}h
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          Free lessons
        </span>
      </div>

      {firstSlug && (
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={tutorialUrl(config.id, firstSlug)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Start with lesson 1 →
          </Link>
          <a
            href="#curriculum"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            View curriculum
          </a>
        </div>
      )}
    </section>
  );
}
