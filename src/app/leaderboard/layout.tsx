import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "uByte Coding Leaderboard - XP, Streaks, and Practice Progress",
  description:
    "See top uByte learners ranked by XP, tutorial completions, interview prep progress, and streaks.",
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
    images: [{ url: absoluteUrl("/api/og?title=Leaderboard&description=Top+uByte+learners+ranked+by+XP"), width: 1200, height: 630 }],
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
