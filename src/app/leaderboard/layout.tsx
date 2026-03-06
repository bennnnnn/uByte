import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "uByte Coding Leaderboard - XP, Streaks, and Practice Progress",
  description:
    "See top uByte learners ranked by XP, tutorial completions, interview practice progress, and streaks.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding leaderboard",
    "programming challenge leaderboard",
    "developer learning leaderboard",
  ],
  alternates: { canonical: absoluteUrl("/leaderboard") },
  openGraph: {
    type: "website",
    title: "Leaderboard | uByte",
    description:
      "See the top learners on uByte. Compete by earning XP through tutorials and practice.",
    url: absoluteUrl("/leaderboard"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard | uByte",
    description:
      "See the top learners on uByte. Compete by earning XP through tutorials and practice.",
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
