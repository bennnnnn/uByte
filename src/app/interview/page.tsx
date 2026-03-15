import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import InterviewClient from "./InterviewClient";

export default function InterviewSimulatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coding Interview Simulator",
    description:
      "Simulate a real coding interview with timed mock sessions in 7 languages.",
    url: absoluteUrl("/interview"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
  };

  return (
    <>
      <script
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
          After you submit, get an AI-powered debrief covering time complexity,
          code style, and areas for improvement.
        </p>

        <section>
          <h2>How It Works</h2>
          <ol>
            <li>Choose your language: Go, Python, JavaScript, Java, C++, Rust, or C#</li>
            <li>Pick a difficulty: Easy, Medium, or Hard</li>
            <li>Set a time limit: 20, 45, or 60 minutes</li>
            <li>Solve a randomly selected problem with a visible countdown timer</li>
            <li>Submit your solution and receive an AI-powered code review and debrief</li>
          </ol>
        </section>

        <section>
          <h2>What Makes This Different</h2>
          <ul>
            <li>Real countdown timer that simulates interview pressure</li>
            <li>Random problem selection — you never know what you will get</li>
            <li>AI debrief after submission: complexity analysis, style review, and improvement tips</li>
            <li>Practice in 7 programming languages with instant test feedback</li>
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
