import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { DIFFICULTY_BADGE } from "@/lib/practice/types";
import { FREE_PRACTICE_LIMIT } from "@/lib/plans";
import { getLangIcon, PRACTICE_TAGLINES } from "@/lib/languages/icons";
import { LangCard } from "@/components/home";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coding Interview Practice Problems",
  description:
    "Solve coding interview problems in Go, Python, C++, JavaScript, Java, and Rust. Practice LeetCode-style challenges with an in-browser code runner and instant feedback.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding interview questions",
    "leetcode practice",
    "data structures and algorithms practice",
  ],
  alternates: { canonical: absoluteUrl("/practice") },
  openGraph: {
    title: "Coding Interview Practice Problems | uByte",
    description:
      "Practice interview-ready coding problems across 6 languages with instant feedback.",
    type: "website",
    url: absoluteUrl("/practice"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Practice | uByte",
    description:
      "Solve classic coding interview problems in Go, Python, C++, JavaScript, Java, and Rust.",
  },
};

export default async function PracticePage() {
  const problems = getAllPracticeProblems();
  const easy   = problems.filter((p) => p.difficulty === "easy").length;
  const medium = problems.filter((p) => p.difficulty === "medium").length;
  const hard   = problems.filter((p) => p.difficulty === "hard").length;

  const langSlugs = getAllLanguageSlugs() as SupportedLanguage[];
  const featured = problems.slice(0, 5);
  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Coding interview practice problems",
    url: absoluteUrl("/practice"),
    about: "Coding interview preparation and algorithm practice",
    hasPart: featured.map((problem) => ({
      "@type": "CreativeWork",
      name: problem.title,
      url: absoluteUrl(`/practice/go/${problem.slug}`),
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Interview Practice", item: absoluteUrl("/practice") },
    ],
  };

  return (
    <div className="min-h-full overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([listJsonLd, breadcrumbJsonLd]),
        }}
      />
      {/* ── Hero section ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[600px] w-[600px] -translate-y-1/3 rounded-full bg-indigo-200/50 blur-[140px] dark:bg-indigo-500/15" />
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] translate-x-1/4 rounded-full bg-violet-200/40 blur-[120px] dark:bg-violet-500/10" />
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan-200/25 blur-[100px] dark:bg-cyan-500/10" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-dot-grid-24 opacity-[0.35] dark:opacity-[0.2]" />

        <div className="relative mx-auto max-w-5xl px-6 pt-14 pb-16 sm:pt-20 sm:pb-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
            <span className="text-base">🎯</span>
            LeetCode-style · Run in browser
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Coding Interview{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">
              Practice
            </span>
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Sharpen your skills with classic problems — Two Sum, LRU Cache, Merge Intervals and more.
            Pick a language, write real code in the browser, get instant feedback. First{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{FREE_PRACTICE_LIMIT} problems free</span>{" "}
            per language; upgrade for full access.
          </p>

          <DifficultyPills easy={easy} medium={medium} hard={hard} />
        </div>
      </section>

      {/* ── Choose language ───────────────────────────────────────────── */}
      <section
        aria-labelledby="lang-heading"
        className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30"
      >
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <h2 id="lang-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Pick your language
          </h2>
          <p className="mb-10 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Choose your language
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {langSlugs.map((slug) => {
              const config = LANGUAGES[slug];
              if (!config) return null;
              return (
                <LangCard
                  key={slug}
                  href={`/practice/${slug}`}
                  icon={getLangIcon(slug)}
                  name={config.name}
                  badge={`${problems.length} problems`}
                  description={PRACTICE_TAGLINES[slug] ?? `Solve problems in ${config.name}`}
                  cta="View problems"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured problems ─────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800" aria-labelledby="preview-heading">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
          <h2 id="preview-heading" className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Try these first
          </h2>
          <p className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Featured problems
          </p>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            View in:{" "}
            {langSlugs.map((slug, i) => (
              <span key={slug}>
                {i > 0 && " · "}
                <Link href={`/practice/${slug}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {LANGUAGES[slug]?.name ?? slug}
                </Link>
              </span>
            ))}
          </p>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {featured.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice/go/${p.slug}`}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="w-8 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-300 group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400">
                      {i + 1}
                    </span>
                    <span className="flex-1 font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                      {p.title}
                    </span>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${DIFFICULTY_BADGE[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                    <svg className="h-5 w-5 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-500 dark:text-zinc-500 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-100 bg-zinc-50/80 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <Link
                href="/practice/go"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all {problems.length} problems in Go
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DifficultyPills({ easy, medium, hard }: { easy: number; medium: number; hard: number }) {
  const pills = [
    { count: easy, label: "Easy", cls: DIFFICULTY_BADGE.easy },
    { count: medium, label: "Medium", cls: DIFFICULTY_BADGE.medium },
    { count: hard, label: "Hard", cls: DIFFICULTY_BADGE.hard },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((p) => (
        <span key={p.label} className={`rounded-full px-4 py-2 text-sm font-semibold ${p.cls}`}>
          {p.count} {p.label}
        </span>
      ))}
    </div>
  );
}
