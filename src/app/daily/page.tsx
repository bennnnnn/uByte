import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import { getAllPracticeProblems, getPracticeCategories } from "@/lib/practice/problems";
import DailyChallengePage from "./DailyChallengePage";

function getTodaysProblem() {
  const all = getAllPracticeProblems();
  if (all.length === 0) return null;
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return all[epochDay % all.length];
}

export const metadata: Metadata = {
  title: "Daily Coding Challenge — Free Problem Every Day | uByte",
  description:
    "Solve a new coding challenge every day on uByte — completely free, no account required. Pick your language (Go, Python, JavaScript, Java, C++, Rust, C#), solve the problem in-browser, earn XP, and climb the leaderboard. Build a daily coding streak.",
  keywords: [
    ...SITE_KEYWORDS,
    "daily coding challenge",
    "daily programming problem",
    "daily algorithm challenge",
    "daily coding problem",
    "coding streak",
    "daily leetcode",
    "free daily coding challenge",
    "daily coding practice",
    "problem of the day",
    "coding problem of the day",
    "daily programming exercise",
    "daily code challenge free",
    "coding streak tracker",
    "daily algorithm practice",
  ],
  alternates: { canonical: absoluteUrl("/daily") },
  openGraph: {
    type: "website",
    title: "Daily Coding Challenge — Free Problem Every Day | uByte",
    description:
      "A new coding problem every day — free for everyone. Solve it in Go, Python, JavaScript, Java, C++, Rust, or C#.",
    url: absoluteUrl("/daily"),
    images: [
      {
        url: absoluteUrl(
          "/api/og?title=Daily+Coding+Challenge&description=A+new+free+problem+every+day+in+7+languages"
        ),
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Coding Challenge — Free Problem Every Day | uByte",
    description:
      "A new coding problem every day — free for everyone. Solve it in Go, Python, JavaScript, Java, C++, Rust, or C#.",
  },
};

export default function DailyPage() {
  const todaysProblem = getTodaysProblem();
  const categories = getPracticeCategories();
  const totalProblems = getAllPracticeProblems().length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Daily Coding Challenge",
    description:
      "A new coding problem every day — free for everyone on uByte.",
    url: absoluteUrl("/daily"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
            Loading…
          </div>
        }
      >
        <DailyChallengePage />
      </Suspense>

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>Daily Coding Challenge — uByte</h1>
        <p>
          Solve a brand-new coding challenge every day on uByte. The daily
          challenge is completely free for all users — no account required. Pick
          your language, write your solution, and get instant feedback from
          automated test cases.
        </p>

        {todaysProblem && (
          <section>
            <h2>Today&apos;s Problem: {todaysProblem.title}</h2>
            <p>Difficulty: {todaysProblem.difficulty}</p>
            <p>Category: {todaysProblem.category}</p>
            <p>{todaysProblem.description.slice(0, 300)}</p>
          </section>
        )}

        <section>
          <h2>How It Works</h2>
          <ol>
            <li>A new problem is selected each day from a pool of {totalProblems}+ challenges.</li>
            <li>Choose your language: Go, Python, JavaScript, Java, C++, Rust, or C#.</li>
            <li>Write and run your solution in the browser with instant test feedback.</li>
            <li>Earn XP and compete on the <Link href="/leaderboard">leaderboard</Link>.</li>
          </ol>
        </section>

        <section>
          <h2>Problem Categories</h2>
          <ul>
            {categories.map((cat) => (
              <li key={cat}>
                <Link href={`/practice/go?category=${cat}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav>
          <h2>Explore More</h2>
          <ul>
            <li><Link href="/practice">All Interview Prep Problems</Link></li>
            <li><Link href="/leaderboard">Leaderboard</Link></li>
            <li><Link href="/interview">Interview Simulator</Link></li>
            <li><Link href="/certifications">Certifications</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
