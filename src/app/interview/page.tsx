import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import InterviewClient from "./InterviewClient";

export const metadata: Metadata = {
  title: "Coding Interview Simulator — Practice Mock Interviews",
  description:
    "Simulate a real technical interview with a timed coding session in 9 languages. Get a personalized performance debrief on time complexity, code style, and improvement areas.",
  keywords: [
    ...SITE_KEYWORDS,
    "mock coding interview",
    "technical interview simulator",
    "coding interview practice",
    "timed coding challenge",
    "interview feedback",
    "interview prep simulator",
  ],
  alternates: { canonical: absoluteUrl("/interview") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/interview"),
    title: "Coding Interview Simulator",
    description:
      "Timed mock technical interviews in 9 languages. Solve a random problem under pressure, then get a personalized debrief on complexity, style, and what to improve.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Interview+Simulator&description=Timed+mock+technical+interviews+with+personalized+feedback"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Interview Simulator",
    description: "Timed mock technical interviews in 9 languages with a personalized performance debrief.",
    images: [absoluteUrl("/api/og?title=Interview+Simulator&description=Timed+mock+technical+interviews+with+personalized+feedback")],
  },
};

export default function InterviewSimulatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coding Interview Simulator",
    description:
      "Simulate a real coding interview with timed mock sessions in 9 languages.",
    url: absoluteUrl("/interview"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
  };

  return (
    <>
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <InterviewClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>Coding Interview Simulator — Practice Mock Technical Interviews</h1>
        <p>
          Simulate a real coding interview on uByte. Pick your programming
          language, choose a difficulty level, set a time limit, and solve a
          random problem under pressure — just like a real technical interview.
          After you submit, get a personalized performance debrief covering time complexity,
          code style, and specific areas for improvement.
        </p>

        <section>
          <h2>How It Works</h2>
          <ol>
            <li>Choose your language: Go, Python, JavaScript, TypeScript, Java, C++, Rust, C#, or SQL</li>
            <li>Pick a difficulty: Easy, Medium, or Hard</li>
            <li>Set a time limit: 20, 45, or 60 minutes</li>
            <li>Solve a randomly selected problem with a visible countdown timer</li>
            <li>Submit your solution and receive a personalized performance debrief</li>
          </ol>
        </section>

        <section>
          <h2>What Makes This Different</h2>
          <ul>
            <li>Real countdown timer that simulates interview pressure</li>
            <li>Random problem selection — you never know what you will get</li>
            <li>Personalized debrief after submission: complexity analysis, style review, and improvement tips</li>
            <li>Practice in 9 programming languages with instant test feedback</li>
          </ul>
        </section>

        <section>
          <h2>Supported Languages</h2>
          <ul>
            <li><Link href="/practice/go">Go</Link></li>
            <li><Link href="/practice/python">Python</Link></li>
            <li><Link href="/practice/javascript">JavaScript</Link></li>
            <li><Link href="/practice/java">Java</Link></li>
            <li><Link href="/practice/cpp">C++</Link></li>
            <li><Link href="/practice/rust">Rust</Link></li>
            <li><Link href="/practice/csharp">C#</Link></li>
          </ul>
        </section>

        <nav>
          <h2>More Interview Prep</h2>
          <ul>
            <li><Link href="/practice">All Interview Prep Problems</Link></li>
            <li><Link href="/interviews">Real Interview Experiences</Link></li>
            <li><Link href="/daily">Daily Coding Challenge</Link></li>
            <li><Link href="/certifications">Programming Certifications</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
