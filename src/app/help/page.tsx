import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";

const FAQ_ITEMS = [
  {
    question: "Do I need to install anything to use uByte?",
    answer:
      "No. Tutorials run directly in your browser, so there is nothing to download, install, or configure.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "uByte currently supports Go, Python, JavaScript, TypeScript, Java, C++, Rust, C#, and SQL. Each language has its own tutorial track.",
  },
  {
    question: "Is uByte free?",
    answer:
      "Yes. Tutorials are free to use. Pro is an optional upgrade for extra help such as in-context hints and faster support.",
  },
  {
    question: "Do I need an account?",
    answer:
      "You can browse tutorials without an account. Create one if you want saved progress, bookmarks, streaks, and synced history across devices.",
  },
  {
    question: "How do tutorials work?",
    answer:
      "Each tutorial is broken into small interactive steps with a live code editor. You edit the code, run it, and get immediate feedback as you move through the lesson.",
  },
  {
    question: "Can I save my progress across devices?",
    answer:
      "Yes. Signed-in users automatically sync completed steps, bookmarks, and active progress across devices.",
  },
  {
    question: "What are bookmarks for?",
    answer:
      "Bookmarks let you save useful snippets and notes from a tutorial so you can revisit them later from your dashboard.",
  },
  {
    question: "What does the Reset button do?",
    answer:
      "Reset restores the starter code for the current step. It does not delete your saved bookmarks or account progress.",
  },
  {
    question: "What does Pro include?",
    answer:
      "Pro adds optional help on top of the free tutorials, including hints when you're stuck and account-level support benefits.",
  },
  {
    question: "What happens when I cancel Pro?",
    answer:
      "You keep Pro access until the end of your billing period. After that your account returns to the free plan and your progress stays intact.",
  },
  {
    question: "How do I verify my email?",
    answer:
      "After signing up you'll receive a verification email. Click the link inside it to verify your account. If it doesn't arrive, check spam or resend it from your account.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to your dashboard settings and use the Delete Account option in the danger zone. If you need help, contact support.",
  },
];

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Answers to common questions about uByte tutorials, accounts, billing, and progress tracking.",
  keywords: [
    ...SITE_KEYWORDS,
    "uByte help",
    "uByte faq",
    "coding tutorials faq",
    "learn to code help center",
    "uByte pro billing",
    "uByte account support",
  ],
  alternates: { canonical: absoluteUrl("/help") },
  openGraph: {
    type: "website",
    title: "uByte Help Center",
    description: "Support articles and answers for tutorials, accounts, and billing.",
    url: absoluteUrl("/help"),
    images: [{ url: absoluteUrl("/api/og?title=Help+Center&description=FAQs+for+tutorials+accounts+and+billing"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Help Center",
    description: "Support articles and answers for tutorials, accounts, and billing.",
    images: [absoluteUrl("/api/og?title=Help+Center&description=FAQs+for+tutorials+accounts+and+billing")],
  },
};

export default function HelpPage() {
  const faqJsonLd = buildFaqJsonLd(FAQ_ITEMS);

  return (
    <div className="min-h-full overflow-y-auto">
      <script
        async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <section className="mb-10 rounded-3xl border border-zinc-200 bg-surface-card p-8 shadow-sm dark:border-zinc-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Help Center
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Answers for learners.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Quick guidance for tutorials, saved progress, account setup, and billing.
          </p>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/tutorial", label: "Tutorials", hint: "Interactive lessons in 9 languages" },
            { href: "/dashboard", label: "Dashboard", hint: "Progress, bookmarks, and streaks" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-zinc-200 bg-surface-card p-5 shadow-sm transition-colors hover:border-indigo-300 dark:border-zinc-700 dark:hover:border-indigo-700"
            >
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{item.label}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.hint}</p>
            </Link>
          ))}
        </section>

        <section className="mb-6 rounded-3xl border border-zinc-200 bg-surface-card p-6 dark:border-zinc-800">
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

        <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
          <h2 className="mb-1 text-base font-bold text-zinc-900 dark:text-zinc-100">Still have a question?</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Can&apos;t find what you&apos;re looking for? Our support team usually replies within one business day.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
          >
            Contact support
          </Link>
        </section>
      </div>
    </div>
  );
}
