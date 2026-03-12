"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";

interface ReferralData {
  code: string;
  shareUrl: string;
  signups: number;
  subscribed: number;
}

export default function ReferralSection() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch("/api/referral")
      .then((r) => r.json())
      .then((j) => { if (j.code) setData(j as ReferralData); })
      .catch(() => {});
  }, []);

  const copy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tweetUrl = data
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        "Learning to code on @ubyte_dev — try it free 👇"
      )}&url=${encodeURIComponent(data.shareUrl)}`
    : "#";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-surface-card p-6 dark:border-zinc-800">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">🎁</span>
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Refer &amp; Earn
        </h3>
      </div>

      <p className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">
        Share your unique link. When a friend subscribes to Pro, you&apos;ll earn{" "}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
          30 free days of Pro
        </span>{" "}
        — for each one.
      </p>

      {/* Stats */}
      <div className="my-4 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
            {data?.signups ?? "—"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Signed up</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {data?.subscribed ?? "—"}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Went Pro</p>
        </div>
      </div>

      {/* Zero-state hint — shown once data has loaded and no one has used the link yet */}
      {data && data.signups === 0 && (
        <p className="mb-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
          Share your link below to get started. You earn one free Pro month for every friend who subscribes.
        </p>
      )}

      {/* Invite link */}
      {data ? (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          <span className="flex-1 truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {data.shareUrl}
          </span>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      ) : (
        <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      )}

      {/* Share actions */}
      <div className="mt-3 flex gap-2">
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
        >
          {/* X (Twitter) icon */}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
        >
          📋 Copy link
        </button>
      </div>
    </div>
  );
}
