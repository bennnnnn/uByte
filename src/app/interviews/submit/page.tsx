import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME } from "@/lib/constants";
import SubmitClient from "./SubmitClient";

export const metadata: Metadata = {
  title: "Share Your Interview Experience",
  description:
    "Help other developers prepare by sharing your tech interview experience anonymously. Tell us about the company, role, difficulty, questions asked, and outcome.",
  alternates: { canonical: absoluteUrl("/interviews/submit") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/interviews/submit"),
    title: "Share Your Tech Interview Experience",
    description: "Share your anonymous interview experience to help other developers prepare. Company, role, difficulty, questions, and outcome.",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary",
    title: "Share Your Tech Interview Experience",
    description: "Help other developers prepare by sharing your anonymous interview experience.",
  },
};

export default function SubmitInterviewPage() {
  return (
    <>
      <SubmitClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>Share Your Tech Interview Experience</h1>
        <p>
          Help other developers prepare by sharing your interview experience
          anonymously. Tell us about the company, the role, the difficulty, the
          questions asked, and whether you received an offer.
        </p>

        <section>
          <h2>What to Include</h2>
          <ul>
            <li>Company name (Google, Meta, Amazon, Microsoft, etc.)</li>
            <li>Role you interviewed for</li>
            <li>Interview difficulty (Easy, Medium, Hard)</li>
            <li>Outcome (Offer, Rejection, Ongoing, Ghosted)</li>
            <li>Description of the interview process and questions</li>
            <li>Tips for other candidates</li>
          </ul>
        </section>

        <nav>
          <Link href="/interviews">← Browse Interview Experiences</Link>
        </nav>
      </article>
    </>
  );
}
