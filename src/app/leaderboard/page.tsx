import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coding Leaderboard — uByte",
    description:
      "See top uByte learners ranked by XP, tutorial completions, and problems solved.",
    url: absoluteUrl("/leaderboard"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LeaderboardClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only" aria-hidden="true">
        <h1>uByte Coding Leaderboard</h1>
        <p>
          See the top learners on uByte ranked by XP. Earn experience points by
          completing tutorials, solving interview prep problems, and maintaining
          daily streaks across Go, Python, JavaScript, Java, C++, Rust, and C#.
        </p>

        <section>
          <h2>How XP Works</h2>
          <ul>
            <li>Complete a tutorial step to earn XP</li>
            <li>Solve an interview prep problem to earn XP</li>
            <li>Maintain a daily streak for bonus XP</li>
            <li>Take the daily coding challenge for extra XP</li>
          </ul>
        </section>

        <section>
          <h2>Leaderboard Periods</h2>
          <p>
            View the all-time leaderboard to see cumulative rankings, or switch
            to the weekly view to see who&apos;s been most active this week.
          </p>
        </section>

        <nav>
          <h2>Start Earning XP</h2>
          <ul>
            <li><Link href="/tutorial/go">Go Tutorials</Link></li>
            <li><Link href="/tutorial/python">Python Tutorials</Link></li>
            <li><Link href="/practice">Interview Prep</Link></li>
            <li><Link href="/daily">Daily Challenge</Link></li>
            <li><Link href="/certifications">Certifications</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
