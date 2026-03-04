import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllTutorials } from "@/lib/tutorials";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { BASE_URL } from "@/lib/constants";
import {
  LanguageCard,
  HeroSection,
  PracticeSection,
  PracticeExamsSection,
  StepsSection,
} from "@/components/home";
import ContinueBanner from "@/components/ContinueBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";

export const metadata: Metadata = {
  title: "uByte — Learn to Code with Interactive Tutorials",
  description:
    "Learn to code with uByte. Interactive lessons in Go, Python, C++, JavaScript, Java, and Rust. Prepare for interviews with practice problems. Write and run real code in your browser.",
  keywords: [
    "learn programming",
    "interactive coding tutorials",
    "Learn Go",
    "Learn Python",
    "Learn C++",
    "interview practice",
    "coding practice",
    "uByte",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "uByte — Learn to Code with Interactive Tutorials",
    description:
      "Interactive lessons in Go, Python, C++, JavaScript, Java, and Rust. Prepare for interviews. Write and run real code in your browser.",
    type: "website",
  },
};

const LANGUAGE_ICONS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
  javascript: "🟨",
  java: "☕",
  rust: "🦀",
};

export default function Home() {
  const goTutorials = getAllTutorials("go");
  const tutorialList = goTutorials.map(({ slug, title }) => ({ slug, title }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "uByte",
    description: "Learn to code with interactive tutorials and interview practice.",
    url: BASE_URL,
    publisher: { "@type": "Organization", name: "uByte", url: BASE_URL },
  };

  const languageEntries = getAllLanguageSlugs()
    .map((slug) => ({ slug, config: LANGUAGES[slug as keyof typeof LANGUAGES] }))
    .filter((e): e is { slug: string; config: (typeof LANGUAGES)["go"] } => !!e.config);

  return (
    <div id="main-content" className="min-h-0 flex-1 overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      {/* ── 1. Hero — full bleed, dark ───────────────────────────────── */}
      <HeroSection />

      {/* ── 2-N. Sections — constrained ─────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

        {/* Continue banner (logged-in users only) */}
        <ContinueBanner lang="go" tutorials={tutorialList} />

        {/* How it works */}
        <StepsSection />

        {/* Languages */}
        <section aria-labelledby="languages-heading">
          <div className="mb-8 text-center">
            <h2
              id="languages-heading"
              className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl"
            >
              Pick your language
            </h2>
            <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">
              Same concepts, same structure — start in seconds with no setup.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {languageEntries.map(({ slug, config }) => (
              <LanguageCard
                key={slug}
                slug={slug}
                name={config.name}
                description={config.seo.defaultDescription}
                icon={LANGUAGE_ICONS[slug] ?? "📝"}
                tutorialCount={19}
              />
            ))}
          </div>
        </section>

        {/* Interview practice */}
        <PracticeSection />

        {/* Practice exams */}
        <PracticeExamsSection />

        {/* Quick-nav footer */}
        <nav
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zinc-100 pt-8 text-sm dark:border-zinc-800"
          aria-label="Quick links"
        >
          {languageEntries.map(({ slug, config }) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="font-medium text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400"
            >
              {config.name} tutorials
            </Link>
          ))}
          <Link
            href="/practice"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Interview practice →
          </Link>
          <Link
            href="/practice-exams"
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Practice exams →
          </Link>
        </nav>
      </div>
    </div>
  );
}
