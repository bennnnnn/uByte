import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllTutorials } from "@/lib/tutorials";
import { LANGUAGES, getAllLanguageSlugs } from "@/lib/languages/registry";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl } from "@/lib/urls";
import { LanguageCard, InterviewCtaCard } from "@/components/home";
import ContinueBanner from "@/components/ContinueBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";

export const metadata: Metadata = {
  title: "uByte — Learn to Code with Interactive Tutorials",
  description:
    "Learn to code with uByte. Interactive lessons in Go, Python, and C++. Prepare for interviews with practice problems. Write and run real code in your browser.",
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
      "Interactive lessons in Go, Python, C++. Prepare for interviews. Write and run real code in your browser.",
    type: "website",
  },
};

const HOW_IT_WORKS = [
  { icon: "📖", label: "Read", desc: "Short, focused lessons" },
  { icon: "✏️", label: "Code", desc: "Edit real code in the browser" },
  { icon: "✓", label: "Check", desc: "Instant feedback on your answer" },
  { icon: "🏆", label: "Earn XP", desc: "Track streaks & achievements" },
];

const LANGUAGE_ICONS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  cpp: "⚙️",
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
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      {/* Hero — language-agnostic */}
      <div className="mb-14">
        <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          Free &amp; interactive coding tutorials
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Learn to code with uByte
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Interactive lessons in Go, Python, and C++. Same concepts across languages — pick one and start. Prepare for interviews with practice problems.
        </p>
      </div>

      {/* Programming languages — cards */}
      <section className="mb-14" aria-labelledby="languages-heading">
        <h2 id="languages-heading" className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Programming languages
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {languageEntries.map(({ slug, config }) => (
            <LanguageCard
              key={slug}
              slug={slug}
              name={config.name}
              description={config.seo.defaultDescription}
              icon={LANGUAGE_ICONS[slug] ?? "📝"}
            />
          ))}
        </div>
      </section>

      {/* Prepare for your interview / Ace your interview */}
      <section className="mb-14" aria-labelledby="interview-heading">
        <h2 id="interview-heading" className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Ace your interview
        </h2>
        <InterviewCtaCard
          title="Prepare for your interview"
          description="Practice coding problems like Two Sum, Three Sum, and more. Solve in Go, Python, or C++ and run your code in the browser."
          href="/practice"
        />
      </section>

      {/* How it works */}
      <div className="mb-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HOW_IT_WORKS.map(({ icon, label, desc }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-2 text-3xl">{icon}</div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{desc}</p>
          </div>
        ))}
      </div>

      {/* Continue learning — from progress (Go for now) */}
      <ContinueBanner lang="go" tutorials={tutorialList} />

      {/* Footer links for languages + practice */}
      <nav className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400" aria-label="Quick links">
        {languageEntries.map(({ slug, config }) => (
          <Link key={slug} href={`/${slug}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            {config.name} tutorials
          </Link>
        ))}
        <Link href="/practice" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Interview practice
        </Link>
      </nav>
    </div>
    </div>
  );
}
