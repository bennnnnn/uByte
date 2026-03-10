import { Suspense } from "react";
import { Metadata } from "next";
import DailyChallengePage from "./DailyChallengePage";

export const metadata: Metadata = {
  title: "Daily Challenge — uByte",
  description: "Solve today's daily coding challenge and climb the leaderboard.",
};

export default function DailyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-zinc-400">Loading…</div>}>
      <DailyChallengePage />
    </Suspense>
  );
}
