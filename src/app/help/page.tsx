import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";

const FAQ_ITEMS = [
  {
    question: "Do I need to install anything to use uByte?",
    answer: "No. Tutorials, interview practice, and exams all run in your browser.",
  },
  {
    question: "Which programming languages are available?",
    answer: "uByte supports Go, Python, C++, JavaScript, Java, and Rust.",
  },
  {
    question: "Are there free lessons?",
    answer: "Yes. You can begin with free tutorials and free interview prep problems in each language.",
  },
  {
    question: "How do certificates work?",
    answer: "Pass a timed certification exam for a language to unlock a shareable certificate for that language.",
  },
];

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers about tutorials, interview prep, certifications, certificates, billing, and account support on uByte.",
  keywords: [
    ...SITE_KEYWORDS,
    "uByte help",
    "coding tutorials faq",
    "certification support",
  ],
  alternates: { canonical: absoluteUrl("/help") },
  openGraph: {
    type: "website",
    title: "uByte Help Center",
    description: "Support articles and answers for tutorials, interview prep, and certification exams.",
    url: absoluteUrl("/help"),
  },
};

export default function HelpPage() {
  const faqJsonLd = buildFaqJsonLd(FAQ_ITEMS);

  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <section className="mb-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Help Center
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Answers for learners and teams.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Quick guidance for tutorials, interview practice, certification exams, and account settings.
          </p>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/tutorial/go", label: "Tutorials", hint: "Browse language tracks" },
            { href: "/practice", label: "Interview Prep", hint: "Solve coding problems" },
            { href: "/certifications", label: "Certifications", hint: "Take timed assessments" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
            >
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{item.label}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.hint}</p>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((faq) => (
              <details key={faq.question} className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <summary className="cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
