import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";
import { APP_NAME, BASE_URL } from "@/lib/constants";
import LeaderboardClient from "./LeaderboardClient";

export const metadata: Metadata = {
  title: "Coding Leaderboard — Top Learners",
  description:
    "See the top uByte learners ranked by XP. Earn experience points by completing lessons, building streaks, and staying consistent with tutorials.",
  keywords: [...SITE_KEYWORDS, "coding leaderboard", "programming xp", "learn to code ranking"],
  alternates: { canonical: absoluteUrl("/leaderboard") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/leaderboard"),
    title: "uByte Coding Leaderboard",
    description: "See the top learners ranked by XP. Complete tutorials, keep your streak alive, and climb the leaderboard.",
    siteName: APP_NAME,
    images: [{ url: absoluteUrl("/api/og?title=Leaderboard&description=Top+uByte+learners+ranked+by+XP+and+lesson+progress"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "uByte Coding Leaderboard",
    description: "See the top learners ranked by XP. Complete tutorials and build steady progress to climb the board.",
    images: [absoluteUrl("/api/og?title=Leaderboard&description=Top+uByte+learners+ranked+by+XP+and+lesson+progress")],
  },
};

export default function LeaderboardPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Coding Leaderboard — uByte",
    description:
      "See top uByte learners ranked by XP, tutorial completions, and steady learning progress.",
    url: absoluteUrl("/leaderboard"),
    isPartOf: { "@type": "WebSite", name: APP_NAME, url: BASE_URL },
  };

  return (
    <>
      <script async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <LeaderboardClient />

      {/* Server-rendered content for search engine crawlers */}
      <article className="sr-only">
        <h1>uByte Coding Leaderboard</h1>
        <p>
          See the top learners on uByte ranked by XP. Earn experience points by
          completing tutorials and maintaining learning streaks across Go,
          Python, JavaScript, Java, C++, Rust, C#, TypeScript, and SQL.
        </p>

        <section>
          <h2>How XP Works</h2>
          <ul>
            <li>Complete a tutorial step to earn XP</li>
            <li>Finish lessons to build momentum and unlock more progress</li>
            <li>Maintain a daily streak for bonus XP</li>
            <li>Keep learning consistently to move up the board</li>
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
            <li><Link href="/tutorial/typescript">TypeScript Tutorials</Link></li>
            <li><Link href="/pricing">Hint Pricing</Link></li>
          </ul>
        </nav>
      </article>
    </>
  );
}
