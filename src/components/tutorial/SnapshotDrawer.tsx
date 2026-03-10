"use client";

import { useEffect, useState } from "react";

interface Snapshot {
  id: number;
  code: string;
  saved_at: string;
}

interface Props {
  slug: string;
  stepIndex: number;
  lang?: string;
  onRestore: (code: string) => void;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function SnapshotDrawer({ slug, stepIndex, lang = "go", onRestore, onClose }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/code-snapshots?slug=${encodeURIComponent(slug)}&stepIndex=${stepIndex}&lang=${encodeURIComponent(lang)}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => setSnapshots(d.snapshots ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, stepIndex, lang]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/40"
        role="button"
        aria-label="Close drawer"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClose(); } }}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[56] flex w-80 flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Code History</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              ))}
            </div>
          ) : snapshots.length === 0 ? (
            <p className="text-sm text-zinc-400">No saved snapshots for this step yet. Snapshots are saved automatically when you check your answer.</p>
          ) : (
            <div className="space-y-3">
              {snapshots.map((s) => (
                <div key={s.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{timeAgo(s.saved_at)}</span>
                    <button
                      onClick={() => { onRestore(s.code); onClose(); }}
                      className="rounded-md border border-indigo-300 px-2 py-0.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950"
                    >
                      Restore
                    </button>
                  </div>
                  <pre className="overflow-hidden font-mono text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {s.code.split("\n").slice(0, 2).join("\n")}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
