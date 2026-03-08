import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About uByte",
  description:
    "Learn how uByte helps developers with interactive programming tutorials, interview prep, and certifications.",
  keywords: [
    ...SITE_KEYWORDS,
    "about uByte",
    "coding platform",
    "interactive programming education",
  ],
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: {
    type: "website",
    title: "About uByte",
    description:
      "Interactive tutorials, interview prep, and certification-style exams built for practical programming skills.",
    url: absoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <section className="mb-12 rounded-3xl border border-zinc-200 bg-surface-card p-8 shadow-sm dark:border-zinc-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            About
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Practical programming education, not passive reading.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            uByte is designed for developers who want to learn by writing code. Every tutorial is interactive, every
            interview prep problem is runnable in the browser, and every certification-style exam is built around practical
            skill checks.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tutorial/go"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              Explore Tutorials
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-surface-card dark:text-zinc-200 dark:hover:border-zinc-500"
            >
              Interview Practice
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Interactive tutorials", body: "Step-by-step lessons with instant feedback in six programming languages." },
            { title: "Interview prep", body: "Coding challenges modeled after real technical interview patterns." },
            { title: "Certifications", body: "Timed certification exams with per-language scoring and shareable certificates." },
          ].map((card) => (
            <Card key={card.title} as="article" className="p-5">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{card.body}</p>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}
