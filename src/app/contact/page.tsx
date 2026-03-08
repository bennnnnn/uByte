import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact uByte",
  description:
    "Get in touch with uByte for support, billing questions, privacy requests, or product feedback.",
  keywords: [
    ...SITE_KEYWORDS,
    "uByte contact",
    "coding platform support",
    "developer learning support",
  ],
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    type: "website",
    title: "Contact uByte",
    description: "Support, billing, privacy, and product feedback channels for uByte.",
    url: absoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-full overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <section className="mb-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            Contact
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            We&apos;re here to help.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            Reach out for account help, billing support, privacy requests, or product feedback.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:support@ubyte.dev"
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
          >
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">General Support</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Help with your account, tutorials, interview prep, and exams.
            </p>
            <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">support@ubyte.dev</p>
          </a>

          <a
            href="mailto:privacy@ubyte.dev"
            className="rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
          >
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Privacy & Data</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Data export, data deletion, or privacy-specific inquiries.
            </p>
            <p className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">privacy@ubyte.dev</p>
          </a>
        </section>
      </div>
    </div>
  );
}
