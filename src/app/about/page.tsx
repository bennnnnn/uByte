import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { ALL_LANGUAGE_KEYS, LANGUAGES as LANG_REGISTRY } from "@/lib/languages/registry";

export const metadata: Metadata = {
  title: "About",
  description:
    "uByte is a free interactive coding platform — step-by-step tutorials, real interview prep problems, and verifiable certifications, all in your browser. No setup required.",
  keywords: [...SITE_KEYWORDS, "about uByte", "coding education platform", "free coding tutorials"],
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    title: "About uByte",
    description: "Learn why we built uByte and what we believe about learning to code.",
    url: absoluteUrl("/about"),
    images: [{ url: absoluteUrl("/api/og?title=About+uByte&description=Free+interactive+coding+tutorials+and+certifications"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About uByte",
    description: "Learn why we built uByte and what we believe about learning to code.",
    images: [absoluteUrl("/api/og?title=About+uByte&description=Free+interactive+coding+tutorials+and+certifications")],
  },
};

const VALUES = [
  {
    title: "Learn by doing",
    body: "Reading about code doesn't make you a better programmer. Every lesson on uByte has a live editor — you run real code in your browser from the first line.",
  },
  {
    title: "No setup tax",
    body: "Installing compilers, configuring environments, and fighting tooling is a distraction. We handle all of that so you can focus on the language, not the plumbing.",
  },
  {
    title: "Free for everyone",
    body: "All tutorials, all interview prep problems, and all certification exams are free. No paywalls on content. Pro unlocks AI-powered hints and code review for those who want to go further, faster.",
  },
  {
    title: "Proof that travels",
    body: "A certificate you can't prove means nothing. Our certificates have unique IDs, are publicly verifiable, and link directly to LinkedIn — so your work actually shows up on your résumé.",
  },
];

const LANG_EMOJIS: Record<string, string> = {
  go: "🐹",
  python: "🐍",
  javascript: "🟨",
  typescript: "🔷",
  cpp: "⚡",
  java: "☕",
  rust: "🦀",
  csharp: "🟣",
  sql: "🗄️",
};

export default function AboutPage() {
  const languages = ALL_LANGUAGE_KEYS.map((k) => ({
    name: LANG_REGISTRY[k].name,
    slug: LANG_REGISTRY[k].slug,
    emoji: LANG_EMOJIS[k] ?? "💻",
  }));

  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">

        {/* Hero */}
        <section className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            About uByte
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            A free coding platform built for{" "}
            <span className="text-indigo-600 dark:text-indigo-400">developers who ship.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            uByte is a free, interactive learning platform with tutorials, interview prep, and certifications
            across multiple languages. Every lesson runs in your browser. Every certificate is verifiable. No fluff.
          </p>
        </section>

        {/* Story */}
        <section className="mb-14 rounded-3xl border border-zinc-200 bg-surface-card p-8 shadow-sm dark:border-zinc-800">
          <h2 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Why we built this</h2>
          <div className="space-y-4 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              Most coding platforms make you watch someone else type. You sit through a ten-minute video, copy
              the solution into a local editor you spent an hour configuring, and then wonder why none of it stuck.
            </p>
            <p>
              We built uByte around a simple idea: <strong className="text-zinc-800 dark:text-zinc-200">
              the fastest path from zero to productive is hands on, in your browser, with immediate feedback.</strong>
            </p>
            <p>
              That means live code execution, AI feedback on your specific solution, interview problems that actually
              show up in hiring pipelines, and certification exams that produce credentials you can point to on LinkedIn.
              No setup required — open a browser, start writing code.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">What we believe</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-zinc-200 bg-surface-card p-6 shadow-sm dark:border-zinc-800"
              >
                <h3 className="mb-2 font-bold text-zinc-900 dark:text-zinc-100">{v.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section className="mb-14 rounded-3xl border border-zinc-200 bg-surface-card p-8 shadow-sm dark:border-zinc-800">
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Multiple languages, done right</h2>
          <p className="mb-6 text-base text-zinc-600 dark:text-zinc-400">
            Each language has a full tutorial track, curated interview prep problems, and a timed certification exam — all free.
          </p>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <Link
                key={lang.slug}
                href={`/tutorial/${lang.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-950 dark:hover:text-indigo-300"
              >
                <span>{lang.emoji}</span>
                {lang.name}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-indigo-600 p-8 text-center dark:bg-indigo-700">
          <h2 className="mb-2 text-2xl font-black text-white">Ready to start?</h2>
          <p className="mb-6 text-indigo-200">
            Free. Pick a language and write your first line of code in 30 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tutorial/go"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
            >
              Start with Go
            </Link>
            <Link
              href="/tutorial/python"
              className="rounded-xl border border-indigo-400 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Start with Python
            </Link>
            <Link
              href="/tutorial"
              className="rounded-xl border border-indigo-400 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Browse all languages
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
