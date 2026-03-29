import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, buildFaqJsonLd, SITE_KEYWORDS } from "@/lib/seo";

const FAQ_ITEMS = [
  // ── Getting started ───────────────────────────────────────────────────────
  {
    question: "Do I need to install anything to use uByte?",
    answer:
      "No. Everything runs in your browser — tutorials, interview prep problems, and certification exams. Code is compiled and executed in the cloud, so there is nothing to download, install, or configure.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "uByte currently supports Go, Python, JavaScript, TypeScript, Java, C++, Rust, C#, and SQL. Each language has its own tutorial track, interview prep problems, and certification exam.",
  },
  {
    question: "Is uByte really free?",
    answer:
      "Yes. All tutorials, all interview prep problems, and all certification exams are free for every signed-in user — no time limit. Pro is an optional upgrade that gives you on-demand hints when you're stuck, detailed code feedback on practice submissions, and a personalized performance debrief after the interview simulator.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "You can browse tutorials and try the daily challenge without an account. To save your progress, solve interview prep problems, and earn certifications you need a free account. Signing up takes under 30 seconds.",
  },
  // ── Tutorials ─────────────────────────────────────────────────────────────
  {
    question: "How do tutorials work?",
    answer:
      "Each tutorial is a hands-on lesson with a description on the left and a live code editor on the right. You write real code, run it, and get instant feedback. Complete all steps in a topic to mark it done and move to the next. There are no videos — just you and the code.",
  },
  {
    question: "Can I save my progress across devices?",
    answer:
      "Yes. Create a free account and your tutorial progress, completed steps, and notes are synced automatically. You can pick up on your phone, laptop, or any browser right where you left off.",
  },
  {
    question: "What are the Notes for?",
    answer:
      "Each tutorial and practice problem has a personal Notes panel — click the Notes button in the toolbar (top right of the editor). Use it to jot down key concepts, write your own summary, or bookmark things to revisit. Notes are saved to your account and persist across sessions.",
  },
  {
    question: "What does the Reset button do?",
    answer:
      "Reset restores the starter code for the current step — useful if you've made a mess and want a clean slate. Your notes are not affected by resetting.",
  },
  // ── Interview Prep ────────────────────────────────────────────────────────
  {
    question: "What is Interview Prep?",
    answer:
      "Interview Prep contains curated coding challenges modelled on real technical interviews — arrays, strings, trees, graphs, dynamic programming, sliding window, and more. You write and run code directly in the browser. All problems are free for signed-in users.",
  },
  {
    question: "How is the Daily Challenge different from Interview Prep?",
    answer:
      "The Daily Challenge is a single problem that rotates every day and is free without an account. Interview Prep is a full library of problems you can filter by language, category, and difficulty at any time.",
  },
  {
    question: "What does code feedback do?",
    answer:
      "After you submit a solution, Pro users get a detailed code review that explains what you did well, points out edge cases you may have missed, and suggests a more optimal approach if one exists. It's specific to your actual code — not a generic solution walkthrough.",
  },
  // ── Certifications ────────────────────────────────────────────────────────
  {
    question: "How do certifications work?",
    answer:
      "Each language has a timed certification exam. Pass it and you earn a certificate with a unique public ID that anyone can verify. You can add it to LinkedIn, your résumé, or your portfolio. Certifications are free for all signed-in users.",
  },
  {
    question: "Can I retake a certification exam?",
    answer:
      "Yes. If you don't pass on your first attempt you can retake the exam. There is a short cooldown period between attempts to give you time to review the material.",
  },
  {
    question: "How does someone verify my certificate?",
    answer:
      "Every certificate has a unique URL. Anyone who visits that link can see your name, the language, the date, and the score — no login required. You can share the link directly or add it to LinkedIn using the share button on your certificate page.",
  },
  // ── Billing ───────────────────────────────────────────────────────────────
  {
    question: "What does Pro include?",
    answer:
      "Pro adds on-demand hints when you're stuck on a tutorial step, detailed code feedback on every practice submission, the ability to ask follow-up questions after a hint, and a personalized performance debrief after the interview simulator. All content — tutorials, problems, certifications — remains free for everyone.",
  },
  {
    question: "What happens when I cancel Pro?",
    answer:
      "You keep full Pro access until the end of your current billing period. After that your account reverts to the free plan. Your progress, notes, and certificates are never deleted.",
  },
  {
    question: "Can I switch between monthly and yearly billing?",
    answer:
      "Yes. Go to your profile → Plan and choose the billing cycle that works for you. Upgrading to yearly saves you two months compared to monthly billing.",
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
      "After signing up you'll receive a verification email. Click the link inside to verify. If it didn't arrive, check your spam folder or use the 'Resend verification email' option shown when you're logged in.",
  },
  {
    question: "Can I sign in with Google?",
    answer:
      "Yes. Click 'Sign in with Google' on the login page. If you're not signed in, a Google One Tap prompt may also appear automatically.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to your profile → Settings → Danger Zone and click Delete Account. All your data is permanently removed immediately. If you need help, email support@ubyte.dev.",
  },
];

export const metadata: Metadata = {
  title: "Help Center",
  description:
    "Answers to common questions about uByte — free tutorials, interview prep, certifications, AI features, Pro billing, refunds, and account settings.",
  keywords: [
    ...SITE_KEYWORDS,
    "uByte help",
    "uByte faq",
    "coding tutorials faq",
    "free coding tutorials questions",
    "programming certification help",
    "interview prep faq",
    "uByte pro billing",
    "uByte refund policy",
    "uByte account support",
    "how to verify certificate",
    "coding platform help center",
  ],
  alternates: { canonical: absoluteUrl("/help") },
  openGraph: {
    type: "website",
    title: "uByte Help Center",
    description: "Support articles and answers for tutorials, interview prep, and certification exams.",
    url: absoluteUrl("/help"),
    images: [{ url: absoluteUrl("/api/og?title=Help+Center&description=FAQs+for+tutorials+interview+prep+and+certifications"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Help Center",
    description: "Support articles and answers for tutorials, interview prep, and certification exams.",
  },
};

export default function HelpPage() {
  const faqJsonLd = buildFaqJsonLd(FAQ_ITEMS);

  return (
    <div className="min-h-full overflow-y-auto">
      <script async
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
            { href: "/tutorial", label: "Tutorials", hint: "Free lessons in 9 languages" },
            { href: "/practice", label: "Interview Prep", hint: "All problems free" },
            { href: "/certifications", label: "Certifications", hint: "Free verifiable certificates" },
            { href: "/pricing", label: "Pro & AI features", hint: "What Pro adds on top" },
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
