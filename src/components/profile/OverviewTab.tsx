"use client";

import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import type { Badge, Achievement, Stats } from "./types";

interface Props {
  stats: Stats;
  badges: Badge[];
  achievements: Achievement[];
  userId?: number;
}

export default function OverviewTab({ stats, badges, achievements, userId }: Props) {
  const pct = stats.total_tutorials > 0 ? (stats.completed_count / stats.total_tutorials) * 100 : 0;
  const allDone = stats.total_tutorials > 0 && stats.completed_count >= stats.total_tutorials;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tutorial Progress</h2>
      <div className="mb-3 h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mb-2 text-sm text-zinc-500">
        {stats.completed_count} of {stats.total_tutorials} tutorials completed
      </p>

      {allDone && userId ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/certificate/${userId}`}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            🎓 View Certificate
          </Link>
          <ShareButton
            text={`I just completed all Go tutorials on uByte! Check out my certificate:`}
            url={typeof window !== "undefined" ? `${window.location.origin}/certificate/${userId}` : ""}
          />
        </div>
      ) : (
        <p className="mb-6 text-sm text-zinc-400 dark:text-zinc-500">
          🎓 Complete all {stats.total_tutorials} tutorials to earn your{" "}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">certificate of completion</span>.
        </p>
      )}

      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Badges</h2>
      {achievements.length === 0 ? (
        <p className="text-sm text-zinc-400">No badges yet — keep learning!</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {achievements.slice(0, 4).map((a) => {
            const badge = badges.find((b) => b.key === a.badge_key);
            return badge ? (
              <div key={a.badge_key} className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{badge.name}</span>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
