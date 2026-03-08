import type { Metadata } from "next";
import Link from "next/link";
import { getAllPracticeProblems } from "@/lib/practice/problems";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { DIFFICULTY_BADGE } from "@/lib/practice/types";
import { MAX_FREE_PROBLEMS } from "@/lib/plans";
import { getLangIcon, PRACTICE_TAGLINES } from "@/lib/languages/icons";
import { LangCard } from "@/components/home";
import { Card, Eyebrow, GradientText, TextLink } from "@/components/ui";
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
      "LeetCode-style coding problems across 6 languages. Write real code in the browser and get instant feedback.",
    type: "website",
    url: absoluteUrl("/practice"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Interview Prep | uByte",
    description:
      "Ace your coding interview. Practice classic problems in Go, Python, C++, JavaScript, Java, and Rust.",
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
    name: "Interview prep — coding problems",
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
      { "@type": "ListItem", position: 2, name: "Interview Prep", item: absoluteUrl("/practice") },
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

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[500px] w-[500px] -translate-y-1/3 rounded-full bg-indigo-200/40 blur-[120px] dark:bg-indigo-500/10" />
          <div className="absolute -top-20 right-0 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-violet-200/30 blur-[100px] dark:bg-violet-500/8" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-10 sm:pb-16 sm:pt-16">
          <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Ace your coding{" "}
            <GradientText>
              interview
            </GradientText>
          </h1>
          <p className="mb-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Classic problems you&apos;ll see at top tech companies — Two Sum, LRU Cache, Merge Intervals and more.
            Write real code, run tests instantly, and track your progress across 6 languages.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <DifficultyPills easy={easy} medium={medium} hard={hard} />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {problems.length} problems · {MAX_FREE_PROBLEMS} free to start
            </span>
          </div>

          <Link
            href="/practice/go"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            Start solving
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Choose language ───────────────────────────────────────────── */}
      <section aria-labelledby="lang-heading" className="border-t border-zinc-100 bg-surface-card dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
          <Eyebrow id="lang-heading" className="mb-1">
            Pick your language
          </Eyebrow>
          <p className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Same problems, your favorite language
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
                  cta="Start practicing"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured problems ─────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 dark:border-zinc-800" aria-labelledby="preview-heading">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
          <Eyebrow id="preview-heading" className="mb-1">
            Start here
          </Eyebrow>
          <p className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Popular interview questions
          </p>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Available in:{" "}
            {langSlugs.map((slug, i) => (
              <span key={slug}>
                {i > 0 && " · "}
                <TextLink href={`/practice/${slug}`}>
                  {LANGUAGES[slug]?.name ?? slug}
                </TextLink>
              </span>
            ))}
          </p>

          <Card className="overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-700">
              {featured.map((p, i) => (
                <li key={p.slug}>
                  <Link
                    href={`/practice/go/${p.slug}`}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white dark:hover:bg-zinc-800/50"
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
            <div className="border-t border-zinc-100 bg-white/80 px-6 py-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <TextLink
                href="/practice/go"
                className="inline-flex items-center gap-2 text-sm"
              >
                View all {problems.length} problems
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </TextLink>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Why uByte ─────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-100 bg-surface-card dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Why developers choose uByte
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: "⚡", title: "Instant feedback", desc: "Run your code against real test cases right in the browser. No setup needed." },
              { icon: "🌐", title: "6 languages", desc: "Solve every problem in Go, Python, JavaScript, Java, Rust, or C++. Switch anytime." },
              { icon: "📈", title: "Track progress", desc: "See which problems you've solved, filter by difficulty, and pick up where you left off." },
            ].map((item) => (
              <Card key={item.title} className="p-6">
                <span className="mb-3 block text-2xl">{item.icon}</span>
                <h3 className="mb-1 text-base font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </Card>
            ))}
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
