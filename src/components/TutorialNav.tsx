"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

interface NavTutorial {
  slug: string;
  title: string;
}

export default function TutorialNav({
  slug,
  prev,
  next,
}: {
  slug: string;
  prev: NavTutorial | null;
  next: NavTutorial | null;
}) {
  const { user, progress, toggleProgress } = useAuth();
  const isCompleted = progress.includes(slug);

  const handleNext = () => {
    if (user && !isCompleted) {
      toggleProgress(slug);
    }
  };

  return (
    <div className="mt-16 flex items-center justify-between border-t border-zinc-200 pt-8 dark:border-zinc-800">
      {prev ? (
        <Link href={`/golang/${prev.slug}`} className="group flex flex-col">
          <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            &larr; Previous
          </span>
          <span className="font-medium text-zinc-700 group-hover:text-indigo-700 dark:text-zinc-300 dark:group-hover:text-indigo-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/golang/${next.slug}`}
          onClick={handleNext}
          className="group flex flex-col items-end"
        >
          <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            Next &rarr;
          </span>
          <span className="font-medium text-zinc-700 group-hover:text-indigo-700 dark:text-zinc-300 dark:group-hover:text-indigo-400">
            {next.title}
          </span>
        </Link>
      ) : (
        // Last tutorial — show a "Finish" button that marks complete
        user && !isCompleted ? (
          <button
            onClick={() => toggleProgress(slug)}
            className="group flex flex-col items-end"
          >
            <span className="text-xs text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
              Finish ✓
            </span>
            <span className="font-medium text-zinc-700 group-hover:text-indigo-700 dark:text-zinc-300 dark:group-hover:text-indigo-400">
              Mark as Complete
            </span>
          </button>
        ) : (
          <div />
        )
      )}
    </div>
  );
}
