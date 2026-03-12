"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, TextLink } from "@/components/ui";
import type { Badge, Achievement, Stats, ActivityItem } from "./types";

const ACTION_ICONS: Record<string, string> = {
  complete: "✅",
  bookmark: "🔖",
  achievement: "🏆",
  streak: "🔥",
  login: "👋",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatDetail(action: string, detail: string): string {
  if (action === "complete" && detail) {
    return detail.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  return detail;
}

interface Props {
  stats: Stats;
  badges: Badge[];
  achievements: Achievement[];
  userId?: number;
}

export default function OverviewTab({ stats, badges, achievements, userId }: Props) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(false);
  const [examCerts, setExamCerts] = useState<
    { id: string; lang: string; passed_at: string }[]
  >([]);
  const [certsLoading, setCertsLoading] = useState(!!userId);
  const [certsError, setCertsError] = useState(false);

  const pct = stats.total_tutorials > 0
    ? Math.round((stats.completed_count / stats.total_tutorials) * 100)
    : 0;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile/activity", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.activity) setActivity(d.activity); })
      .catch(() => { if (!cancelled) setActivityError(true); })
      .finally(() => { if (!cancelled) setActivityLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetch("/api/profile/exam-certificates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.certificates)) {
          setExamCerts(d.certificates);
        }
      })
      .catch(() => { if (!cancelled) setCertsError(true); })
      .finally(() => { if (!cancelled) setCertsLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="space-y-8">

      {/* Quick progress summary */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {stats.completed_count} / {stats.total_tutorials} lessons
          </span>
          <span className="font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-400">
            {stats.total_tutorials - stats.completed_count} lesson{stats.total_tutorials - stats.completed_count !== 1 ? "s" : ""} remaining
          </span>
          <Link href="/profile?tab=progress" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            View details →
          </Link>
        </div>
      </Card>

      {/* Exam certificates */}
      {certsLoading && (
        <div className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
      )}
      {!certsLoading && certsError && (
        <p className="text-sm text-zinc-400">Could not load certificates.</p>
      )}
      {!certsLoading && !certsError && examCerts.length === 0 && (
        <Card className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Exam certificates</h2>
          </div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No certificates yet.{" "}
            <Link href="/certifications" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Take a certification exam →
            </Link>
          </p>
        </Card>
      )}
      {!certsLoading && !certsError && examCerts.length > 0 && (
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Exam certificates
            </h2>
          </div>
          <ul className="space-y-2">
            {examCerts.slice(0, 3).map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-200">
                  {c.lang.toUpperCase()} exam
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {new Date(c.passed_at).toLocaleDateString()}
                  </span>
                  <TextLink
                    href={`/certifications/certificate/${c.id}`}
                    className="text-xs"
                  >
                    Download
                  </TextLink>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recent achievements */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Recent badges</h2>
          {achievements.length > 0 && (
            <Link href="/profile?tab=achievements" className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              View all →
            </Link>
          )}
        </div>
        {achievements.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No badges yet.{" "}
            <Link href="/tutorial/go" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Start a tutorial to earn your first →
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {achievements.slice(0, 4).map((a) => {
              const badge = badges.find((b) => b.key === a.badge_key);
              return badge ? (
                <div
                  key={a.badge_key}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-surface-card px-3 py-2 dark:border-zinc-800"
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{badge.name}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-100">Recent activity</h2>
        {activityLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : activityError ? (
          <p className="text-sm text-zinc-400">Could not load activity. Try refreshing the page.</p>
        ) : activity.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No activity yet.{" "}
            <TextLink href="/">
              Start a tutorial →
            </TextLink>
          </p>
        ) : (
          <ul className="space-y-2">
            {activity.slice(0, 8).map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-surface-card px-4 py-3 dark:border-zinc-800"
              >
                <span className="text-lg">{ACTION_ICONS[item.action] ?? "📌"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="capitalize">{item.action}</span>
                    {item.detail && (
                      <span className="text-zinc-500"> — {formatDetail(item.action, item.detail)}</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">{timeAgo(item.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
