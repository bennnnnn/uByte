import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "uByte is an interactive coding platform for developers who want to learn Go, Python, JavaScript, C++, Java, and Rust — in their browser, at their own pace.",
  keywords: [...SITE_KEYWORDS, "about uByte", "coding education platform"],
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    title: "About uByte",
    description: "Learn why we built uByte and what we believe about learning to code.",
    url: absoluteUrl("/about"),
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
    title: "Depth over breadth",
    body: "Six languages, done properly. Structured tutorials, realistic interview problems, and timed certification exams — not a shallow tour of every syntax feature.",
  },
  {
    title: "Proof that travels",
    body: "A certificate you can't prove means nothing. Our certificates have unique IDs, are publicly verifiable, and link directly to LinkedIn — so your work actually shows up on your résumé.",
  },
];

const LANGUAGES = [
  { name: "Go", emoji: "🐹" },
  { name: "Python", emoji: "🐍" },
  { name: "JavaScript", emoji: "🟨" },
  { name: "C++", emoji: "⚡" },
  { name: "Java", emoji: "☕" },
  { name: "Rust", emoji: "🦀" },
];

export default function AboutPage() {
  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-14">

        {/* Hero */}
        <section className="mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            About uByte
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            A coding platform built for{" "}
            <span className="text-indigo-600 dark:text-indigo-400">developers who ship.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            uByte is an interactive learning platform for Go, Python, JavaScript, C++, Java, and Rust.
            Every lesson runs in your browser. Every certificate is verifiable. No fluff.
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
          <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Six languages, done right</h2>
          <p className="mb-6 text-base text-zinc-600 dark:text-zinc-400">
            Each language has a full tutorial track, curated interview prep problems, and a timed certification exam.
          </p>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <span
                key={lang.name}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <span>{lang.emoji}</span>
                {lang.name}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-indigo-600 p-8 text-center dark:bg-indigo-700">
          <h2 className="mb-2 text-2xl font-black text-white">Ready to start?</h2>
          <p className="mb-6 text-indigo-200">
            Free to try. No credit card. Pick a language and write your first line of code in 30 seconds.
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
              href="/pricing"
              className="rounded-xl border border-indigo-400 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
            >
              View pricing
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
