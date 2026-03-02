import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getAllTutorials } from "@/lib/tutorials";
import { BASE_URL } from "@/lib/constants";
import { tutorialUrl } from "@/lib/urls";
import TutorialGrid from "@/components/TutorialGrid";
import ContinueBanner from "@/components/ContinueBanner";
import GoogleOAuthError from "@/components/GoogleOAuthError";

export const metadata: Metadata = {
  title: "uByte — Learn Go Programming for Free",
  description:
    "Learn Go programming for free with uByte. Interactive Golang tutorials for beginners — write and run real Go code in your browser. Start today.",
  keywords: [
    "learn Go programming", "Golang tutorial for beginners", "free Go course",
    "interactive Golang", "Go coding practice", "uByte", "Go syntax examples",
    "online Go compiler", "Go language tutorial", "learn Golang 2025",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "uByte — Learn Go Programming for Free",
    description:
      "Interactive Golang tutorials for beginners. Write and run real Go code in your browser. Free forever.",
    type: "website",
  },
};

const HOW_IT_WORKS = [
  { icon: "📖", label: "Read", desc: "Short, focused lessons" },
  { icon: "✏️", label: "Code", desc: "Edit real Go in the browser" },
  { icon: "✓", label: "Check", desc: "Instant feedback on your answer" },
  { icon: "🏆", label: "Earn XP", desc: "Track streaks & achievements" },
];

export default function Home() {
  const tutorials = getAllTutorials("go");
  const tutorialList = tutorials.map(({ slug, title }) => ({ slug, title }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "uByte — Learn Go for Free",
    description:
      "Free, beginner-friendly Go tutorials with interactive code examples. Learn Go from scratch — variables, functions, goroutines, and more.",
    url: BASE_URL,
    provider: { "@type": "Organization", name: "uByte", url: BASE_URL },
    hasCourseInstance: tutorials.map((t) => ({
      "@type": "CourseInstance",
      name: t.title,
      url: `${BASE_URL}${tutorialUrl("go", t.slug)}`,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <GoogleOAuthError />
      </Suspense>

      {/* Hero */}
      <div className="mb-14">
        <div className="mb-5 inline-flex items-center justify-center rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
          🐹 Free &amp; interactive Go tutorials
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Learn Go with uByte
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Beginner-friendly lessons with real code you can edit and run in the browser.
          From &ldquo;Hello, World!&rdquo; to goroutines &mdash; learn by doing.
        </p>
        {tutorials.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={tutorialUrl("go", tutorials[0].slug)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-800 hover:shadow-md"
            >
              Start Learning →
            </Link>
          </div>
        )}
      </div>

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

      {/* Continue banner */}
      <ContinueBanner lang="go" tutorials={tutorialList} />

      {/* Tutorial grid */}
      <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        All Tutorials
      </h2>
      <TutorialGrid lang="go" tutorials={tutorials} />
    </div>
  );
}
