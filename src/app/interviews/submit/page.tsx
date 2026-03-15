import Link from "next/link";
import SubmitClient from "./SubmitClient";

export default function SubmitInterviewPage() {
  return (
    <>
      <SubmitClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
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
