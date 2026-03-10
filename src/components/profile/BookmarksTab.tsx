"use client";

import { useState } from "react";
import Link from "next/link";
import type { Bookmark } from "./types";

interface Props {
  bookmarks: Bookmark[];
  hasMore: boolean;
  total: number;
  onDelete: (id: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
  loadingMore: boolean;
}

/** Build a correct href for a bookmark.
 *  - practice:two-sum  → /practice/go/two-sum
 *  - getting-started   → /tutorial/go/getting-started
 */
function bookmarkHref(tutorialSlug: string, language: string): string {
  const lang = language || "go";
  if (tutorialSlug.startsWith("practice:")) {
    const problemSlug = tutorialSlug.slice("practice:".length);
    return `/practice/${lang}/${problemSlug}`;
  }
  return `/tutorial/${lang}/${tutorialSlug}`;
}

/** Human-readable label for the bookmark link. */
function bookmarkLabel(tutorialSlug: string): string {
  if (tutorialSlug.startsWith("practice:")) {
    const slug = tutorialSlug.slice("practice:".length);
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return tutorialSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Badge showing what kind of bookmark it is and the language. */
function BookmarkBadge({ tutorialSlug, language }: { tutorialSlug: string; language: string }) {
  const isPractice = tutorialSlug.startsWith("practice:");
  return (
    <div className="flex items-center gap-1.5">
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        isPractice
          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
      }`}>
        {isPractice ? "Interview Prep" : "Tutorial"}
      </span>
      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium capitalize text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {language || "go"}
      </span>
    </div>
  );
}

export default function BookmarksTab({ bookmarks, hasMore, total, onDelete, onLoadMore, loadingMore }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {total > 0 && (
        <p className="mb-4 text-sm text-zinc-500">
          {total} bookmark{total !== 1 ? "s" : ""}
        </p>
      )}
      {bookmarks.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 p-8 text-center dark:border-zinc-800">
          <p className="text-zinc-400">
            No bookmarks yet. Click the bookmark icon on any tutorial code example or interview prep problem to save it.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className={`rounded-xl border border-zinc-200 p-4 transition-opacity dark:border-zinc-800 ${
                deletingId === bm.id ? "opacity-50" : ""
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <Link
                    href={bookmarkHref(bm.tutorial_slug, bm.language)}
                    className="block truncate text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {bookmarkLabel(bm.tutorial_slug)}
                  </Link>
                  <BookmarkBadge tutorialSlug={bm.tutorial_slug} language={bm.language} />
                </div>
                <button
                  onClick={() => handleDelete(bm.id)}
                  disabled={deletingId === bm.id}
                  className="shrink-0 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 disabled:pointer-events-none dark:hover:bg-zinc-800"
                  aria-label="Delete bookmark"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <pre className="mb-2 overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100 dark:bg-zinc-800">{bm.snippet}</pre>
              {bm.note && <p className="text-xs italic text-zinc-500">{bm.note}</p>}
            </div>
          ))}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
