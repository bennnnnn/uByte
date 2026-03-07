import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See top uByte learners ranked by XP, tutorial completions, coding practice progress, and streaks.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding leaderboard",
    "programming challenge leaderboard",
    "developer learning leaderboard",
  ],
  alternates: { canonical: absoluteUrl("/leaderboard") },
  openGraph: {
    type: "website",
    title: "uByte Leaderboard",
    description: "Top learners by XP, tutorials completed, and interview practice progress.",
    url: absoluteUrl("/leaderboard"),
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
