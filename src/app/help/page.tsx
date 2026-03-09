import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";

const FAQ_ITEMS = [
  // ── Getting started ───────────────────────────────────────────────────────
  {
    question: "Do I need to install anything to use uByte?",
    answer:
      "No. Tutorials, interview prep, and exams all run in your browser. Code is compiled and executed in the cloud — nothing to install.",
  },
  {
    question: "Which programming languages are available?",
    answer:
      "uByte currently supports Go, Python, C++, JavaScript, Java, and Rust. More languages are on the roadmap.",
  },
  {
    question: "Are there free lessons?",
    answer:
      "Yes. Every language track includes free tutorial lessons and free interview prep problems so you can try the platform before upgrading.",
  },
  // ── Content ───────────────────────────────────────────────────────────────
  {
    question: "How do certifications work?",
    answer:
      "Each language has a timed certification exam. Pass it to earn a shareable certificate you can add to your LinkedIn profile or résumé. Pro subscribers unlock all certification exams.",
  },
  {
    question: "What is Interview Prep?",
    answer:
      "Interview Prep contains curated coding problems similar to those asked in technical interviews. Problems are grouped by language and topic. A selection is free; Pro unlocks all problems.",
  },
  {
    question: "Can I save my progress?",
    answer:
      "Yes — create a free account and your tutorial progress, code drafts, and exam results are saved automatically so you can pick up where you left off on any device.",
  },
  // ── Billing ───────────────────────────────────────────────────────────────
  {
    question: "What happens when I cancel my Pro subscription?",
    answer:
      "You keep full Pro access until the end of your current billing period. After that your account reverts to the free plan and your progress and certificates are never deleted.",
  },
  {
    question: "Can I switch between monthly and yearly billing?",
    answer:
      "Yes. Go to your profile → Plan tab and choose the billing cycle that works for you. Upgrading to yearly saves you two months compared to monthly billing.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "If you're not satisfied within 7 days of your first payment, email us at support@ubyte.dev and we'll issue a full refund — no questions asked.",
  },
  // ── Account ───────────────────────────────────────────────────────────────
  {
    question: "How do I verify my email?",
    answer:
      "After signing up you'll receive a verification email. Click the link inside to verify. If it didn't arrive, check your spam folder or use the 'Resend verification email' link shown at the top of any page when you're logged in.",
  },
  {
    question: "Can I sign in with Google?",
    answer:
      "Yes. Click 'Sign in with Google' on the login page or use the Google One Tap prompt that appears automatically when you're not logged in.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Email support@ubyte.dev with your account email and we'll permanently delete your data within 30 days, in compliance with GDPR and CCPA.",
  },
];

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Find answers about tutorials, interview prep, certifications, billing, cancellation, refunds, and account support on uByte.",
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
    <div className="min-h-full overflow-y-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-6 py-14">
        <section className="mb-10 rounded-3xl border border-zinc-200 bg-surface-card p-8 shadow-sm dark:border-zinc-800">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Help Center
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Answers for learners and teams.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Quick guidance for tutorials, interview prep, certification exams, and account settings.
          </p>
        </section>

        <section className="mb-10 grid gap-3 sm:grid-cols-4">
          {[
            { href: "/tutorial/go", label: "Tutorials", hint: "Browse language tracks" },
            { href: "/practice", label: "Interview Prep", hint: "Solve coding problems" },
            { href: "/certifications", label: "Certifications", hint: "Take timed assessments" },
            { href: "/pricing", label: "Pricing & Plans", hint: "Compare free vs Pro" },
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
