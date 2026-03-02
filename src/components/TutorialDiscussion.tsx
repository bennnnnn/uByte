"use client";

import { useAuth } from "@/components/AuthProvider";
import TutorialChat from "@/components/TutorialChat";
import Link from "next/link";

interface Props {
  lang: string;
  tutorialSlug: string;
}

export default function TutorialDiscussion({ lang, tutorialSlug }: Props) {
  const { user } = useAuth();
  const chatSlug = `${tutorialSlug}-general`;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Community Discussion</h2>
        <p className="mt-0.5 text-xs text-zinc-400">Ask questions or share tips about this tutorial</p>
      </div>
      {user ? (
        <TutorialChat
          chatSlug={chatSlug}
          onClose={() => {}}
          inline
        />
      ) : (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Sign in
            </Link>{" "}
            to join the discussion
          </p>
        </div>
      )}
    </div>
  );
}
