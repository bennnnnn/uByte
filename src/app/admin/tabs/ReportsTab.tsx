"use client";

/**
 * ReportsTab — moderate reported discussion comments.
 *
 * Shows all posts that users have flagged. Admin can:
 *   - Delete the post (soft-delete, removes it from the discussion)
 *   - Dismiss all reports (clears flags, post stays visible)
 */

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";
import { SectionCard, EmptyRow } from "../components";

interface Report {
  post_id: number;
  post_content: string;
  post_created_at: string;
  post_deleted: boolean;
  author_name: string | null;
  author_email: string | null;
  problem_slug: string | null;
  lang: string | null;
  report_count: number;
  reasons: string[];
  first_reported_at: string;
  last_reported_at: string;
}

function formatDate(s: string): string {
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const REASON_LABEL: Record<string, string> = {
  spam:          "Spam",
  harassment:    "Harassment",
  inappropriate: "Inappropriate",
  other:         "Other",
};

export default function ReportsTab() {
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busy, setBusy]         = useState<number | null>(null);
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetch("/api/admin/reports");
      const data = await res.json() as { reports: Report[] };
      setReports(data.reports ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(postId: number, action: "dismiss" | "delete") {
    setBusy(postId);
    try {
      await apiFetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action }),
      });
      setReports((prev) => prev.filter((r) => r.post_id !== postId));
      setExpanded(null);
      showToast(action === "delete" ? "Post deleted." : "Reports dismissed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <SectionCard title="Reported Comments">
      {/* Refresh */}
      <div className="mb-4 flex justify-end">
        <button onClick={load} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
          {toast}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-zinc-400">Loading…</div>
      ) : reports.length === 0 ? (
        <EmptyRow message="No reported comments — all clear." />
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {reports.map((r) => (
            <div key={r.post_id} className="py-4">
              {/* Summary row */}
              <button
                onClick={() => setExpanded(expanded === r.post_id ? null : r.post_id)}
                className="flex w-full items-start gap-3 text-left"
              >
                {/* Report count badge */}
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  r.report_count >= 3 ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                }`}>
                  {r.report_count}
                </span>

                <div className="min-w-0 flex-1">
                  {/* Post preview */}
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {r.post_content}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    by <span className="font-medium">{r.author_name ?? "deleted user"}</span>
                    {r.author_email && <span className="ml-1 text-zinc-400">({r.author_email})</span>}
                    {" · "}
                    {r.lang && r.problem_slug && (
                      <a
                        href={`/practice/${r.lang}/${r.problem_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {r.lang}/{r.problem_slug}
                      </a>
                    )}
                    {" · "}
                    posted {formatDate(r.post_created_at)}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {r.reasons.map((reason) => (
                      <span key={reason} className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {REASON_LABEL[reason] ?? reason}
                      </span>
                    ))}
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Last reported {formatDate(r.last_reported_at)}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-xs text-zinc-400">{expanded === r.post_id ? "▲" : "▼"}</span>
              </button>

              {/* Expanded detail + actions */}
              {expanded === r.post_id && (
                <div className="mt-3 ml-9 space-y-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{r.post_content}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => act(r.post_id, "delete")}
                      disabled={busy === r.post_id}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      {busy === r.post_id ? "Working…" : "Delete post"}
                    </button>
                    <button
                      onClick={() => act(r.post_id, "dismiss")}
                      disabled={busy === r.post_id}
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      {busy === r.post_id ? "Working…" : "Dismiss reports"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
