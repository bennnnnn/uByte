"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { Card, TextLink } from "@/components/ui";
import type { Stats } from "./types";
import { tutorialUrl } from "@/lib/urls";

interface Props {
  stats: Stats;
  userId?: number;
}

function formatSlug(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function ProgressTab({ stats, userId }: Props) {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const pct = stats.total_tutorials > 0
    ? Math.round((stats.completed_count / stats.total_tutorials) * 100)
    : 0;
  const allDone = stats.total_tutorials > 0 && stats.completed_count >= stats.total_tutorials;

  useEffect(() => {
    fetch("/api/progress", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d.progress) setCompletedSlugs(d.progress); })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      {/* Progress summary card */}
      <Card className="p-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.completed_count}
              <span className="text-xl font-normal text-zinc-400"> / {stats.total_tutorials}</span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">tutorials completed</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{pct}%</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </Card>

      {/* Certificate */}
      {allDone && userId ? (
        <div className="rounded-2xl border-2 border-indigo-500 bg-indigo-50 p-6 text-center dark:bg-indigo-950/30">
          <div className="mb-2 text-4xl">🎓</div>
          <h3 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">Certificate earned!</h3>
          <p className="mb-5 text-sm text-zinc-500">You&apos;ve completed all Go tutorials. Congratulations!</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={`/certificate/${userId}`}
              className="rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              View Certificate
            </Link>
            <ShareButton
              text="I just completed all Go tutorials on uByte!"
              url={typeof window !== "undefined" ? `${window.location.origin}/certificate/${userId}` : ""}
            />
          </div>
        </div>
      ) : (
        <Card className="flex items-center gap-4 p-5">
          <span className="text-3xl">🎓</span>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Certificate of Completion</p>
            <p className="text-sm text-zinc-500">
              {stats.total_tutorials - stats.completed_count} tutorial{stats.total_tutorials - stats.completed_count !== 1 ? "s" : ""} remaining to earn your certificate
            </p>
          </div>
        </Card>
      )}

      {/* Completed tutorials list */}
      <div>
        <h3 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">
          Completed tutorials
          {completedSlugs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-400">({completedSlugs.length})</span>
          )}
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : fetchError ? (
          <Card className="py-10 text-center">
            <p className="text-sm text-zinc-500">Could not load progress. Try refreshing the page.</p>
          </Card>
        ) : completedSlugs.length === 0 ? (
          <Card className="py-10 text-center">
            <p className="text-2xl">📚</p>
            <p className="mt-2 text-sm text-zinc-500">No tutorials completed yet.</p>
            <TextLink href="/" className="mt-3 inline-block text-sm">
              Start learning →
            </TextLink>
          </Card>
        ) : (
          <ul className="space-y-2">
            {completedSlugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={tutorialUrl("go", slug)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-surface-card px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatSlug(slug)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
