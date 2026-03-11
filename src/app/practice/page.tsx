import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems, getPracticeCategories, getCategoryLabel } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { DIFFICULTY_BADGE } from "@/lib/practice/types";
import { MAX_FREE_PROBLEMS } from "@/lib/plans";
import { getLangIcon } from "@/lib/languages/icons";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Interview Prep — Ace Your Coding Interview",
  description:
    "Practice coding interview problems in Go, Python, C++, JavaScript, Java, and Rust. LeetCode-style challenges with an in-browser editor and instant test feedback.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding interview questions",
    "leetcode alternative",
    "hackerrank alternative",
    "data structures and algorithms",
    "interview prep",
    "coding challenges",
  ],
  alternates: { canonical: absoluteUrl("/practice") },
  openGraph: {
    title: "Interview Prep — Ace Your Coding Interview | uByte",
    description:
      "LeetCode-style coding problems across 7 languages. Write real code in the browser and get instant feedback.",
    type: "website",
    url: absoluteUrl("/practice"),
  },
};

export default async function PracticePage() {
  const problems = getAllPracticeProblems();
  const categories = getPracticeCategories();
  const easy   = problems.filter((p) => p.difficulty === "easy").length;
  const medium = problems.filter((p) => p.difficulty === "medium").length;
  const hard   = problems.filter((p) => p.difficulty === "hard").length;
  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Interview Prep",
    url: absoluteUrl("/practice"),
    hasPart: problems.slice(0, 8).map((p) => ({
      "@type": "CreativeWork",
      name: p.title,
      url: absoluteUrl(`/practice/go/${p.slug}`),
    })),
  };

  return (
    <div className="min-h-full bg-surface-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Interview Prep
          </p>
          <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Ace your coding interview
          </h1>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
            {problems.length} classic problems you'll face at top tech companies — write real code, run tests instantly, track your progress.
          </p>

          {/* Stats row */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              {easy} Easy
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              {medium} Medium
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400">
              {hard} Hard
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {MAX_FREE_PROBLEMS} free to start
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              7 languages
            </span>
          </div>

          {/* Language pills */}
          <div className="flex flex-wrap items-center gap-2">
            {langSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/practice/${slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
              >
                <span>{getLangIcon(slug)}</span>
                {LANGUAGES[slug]?.name ?? slug}
              </Link>
            ))}
            <Link
              href="/practice/go"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-indigo-500"
            >
              Start solving →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Problem table ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* Category breakdown */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const count = problems.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                href={`/practice/go?category=${cat}`}
                className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-800"
              >
                <p className="text-sm font-bold text-zinc-800 group-hover:text-indigo-700 dark:text-zinc-200 dark:group-hover:text-indigo-400">
                  {getCategoryLabel(cat)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{count} problem{count !== 1 ? "s" : ""}</p>
              </Link>
            );
          })}
        </div>

        {/* Problem list */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              All problems ({problems.length})
            </p>
          </div>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {problems.map((p, i) => (
              <li key={p.slug}>
                <Link
                  href={`/practice/go/${p.slug}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="w-7 shrink-0 text-right text-xs tabular-nums text-zinc-300 dark:text-zinc-600">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="truncate text-sm font-semibold text-zinc-800 group-hover:text-indigo-700 dark:text-zinc-200 dark:group-hover:text-indigo-400">
                      {p.title}
                    </span>
                  </span>
                  {p.category && (
                    <span className="hidden shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-500 sm:inline dark:bg-zinc-800 dark:text-zinc-400">
                      {getCategoryLabel(p.category)}
                    </span>
                  )}
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${DIFFICULTY_BADGE[p.difficulty]}`}>
                    {p.difficulty}
                  </span>
                  <svg className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-600 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-center text-white shadow-lg shadow-indigo-500/20 dark:border-indigo-700/50">
          <p className="mb-1 text-lg font-bold">Ready to start?</p>
          <p className="mb-5 text-sm text-indigo-200">
            Pick your language and start solving. First {MAX_FREE_PROBLEMS} problems are free.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {langSlugs.slice(0, 4).map((slug) => (
              <Link
                key={slug}
                href={`/practice/${slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25"
              >
                <span>{getLangIcon(slug)}</span>
                {LANGUAGES[slug]?.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
