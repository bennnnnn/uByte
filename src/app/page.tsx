import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllTutorials } from "@/lib/tutorials";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { BASE_URL } from "@/lib/constants";
import {
  LanguageCard,
  HomePopularSidebar,
  HeroSection,
  PracticeSection,
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
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Suspense>
          <GoogleOAuthError />
        </Suspense>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          {/* ── Main column ─────────────────────────────────── */}
          <div className="min-w-0 space-y-10">

            {/* 1. Hero */}
            <HeroSection />

            {/* 2. Continue banner (logged-in users only) */}
            <ContinueBanner lang="go" tutorials={tutorialList} />

            {/* 3. How it works */}
            <StepsSection />

            {/* 4. Languages */}
            <section aria-labelledby="languages-heading">
              <h2
                id="languages-heading"
                className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100"
              >
                Programming languages
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

            {/* 5. Interview practice */}
            <PracticeSection />

            {/* 6. Footer links */}
            <nav
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-zinc-100 pt-6 text-sm dark:border-zinc-800"
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
            </nav>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <HomePopularSidebar />
        </div>
      </div>
    </div>
  );
}
