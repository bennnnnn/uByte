"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import TutorialChat from "@/components/TutorialChat";
import DiscussionThread from "@/app/practice/[lang]/[slug]/DiscussionThread";

interface Props {
  lang: string;
  tutorialSlug: string;
}

type Tab = "community" | "ai";

export default function TutorialDiscussion({ lang, tutorialSlug }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("community");

  // Namespaced slug so tutorial threads don't collide with practice problem threads
  const discussSlug = `tutorial:${lang}:${tutorialSlug}`;
  const chatSlug    = `${tutorialSlug}-general`;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

      {/* Tab strip */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-800">
        {(["community", "ai"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            }`}
          >
            {t === "community" ? "💬 Community" : "✨ Ask AI"}
          </button>
        ))}
      </div>

      {/* Community discussion */}
      {tab === "community" && (
        <div className="min-h-[280px]">
          <DiscussionThread
            slug={discussSlug}
            currentUserId={user?.id ?? null}
            isSignedIn={!!user}
          />
        </div>
      )}

      {/* AI chat */}
      {tab === "ai" && (
        <TutorialChat
          chatSlug={chatSlug}
          lang={lang}
          onClose={() => {}}
          inline
        />
      )}
    </div>
  );
}
