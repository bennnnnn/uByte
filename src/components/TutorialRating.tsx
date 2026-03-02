"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "./AuthProvider";

interface Props {
  lang: string;
  tutorialSlug: string;
}

interface RatingData {
  thumbs_up: number;
  thumbs_down: number;
  user_vote: number | null;
}

export default function TutorialRating({ lang, tutorialSlug }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?slug=${encodeURIComponent(tutorialSlug)}`, { credentials: "same-origin" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => { if (data) setRating(data); });
  }, [tutorialSlug]);

  const vote = async (value: 1 | -1) => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: tutorialSlug, value }),
      });
      if (res.ok) {
        const data = await res.json();
        setRating(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!rating) return null;

  return (
    <div className="mt-8 flex items-center gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Was this tutorial helpful?</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => vote(1)}
          disabled={!user || loading}
          title={user ? "Helpful" : "Sign in to rate"}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            rating.user_vote === 1
              ? "border-green-400 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400"
              : "border-zinc-300 text-zinc-600 hover:border-green-400 hover:text-green-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-green-700 dark:hover:text-green-400"
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {rating.thumbs_up}
        </button>

        <button
          onClick={() => vote(-1)}
          disabled={!user || loading}
          title={user ? "Not helpful" : "Sign in to rate"}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            rating.user_vote === -1
              ? "border-red-400 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-400"
              : "border-zinc-300 text-zinc-600 hover:border-red-400 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-red-700 dark:hover:text-red-400"
          }`}
        >
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          {rating.thumbs_down}
        </button>
      </div>
    </div>
  );
}
