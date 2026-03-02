import Link from "next/link";
import { tutorialUrl } from "@/lib/urls";

type Difficulty = "beginner" | "intermediate" | "advanced";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export interface TutorialCardProps {
  lang: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
}

/**
 * Compact card for a single tutorial. Used on the homepage "Featured tutorials" section.
 */
export default function TutorialCard({
  lang,
  slug,
  title,
  description,
  difficulty,
  estimatedMinutes,
}: TutorialCardProps) {
  return (
    <Link
      href={tutorialUrl(lang, slug)}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400 line-clamp-1">
        {title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${DIFFICULTY_STYLES[difficulty]}`}>
          {difficulty}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">⏱ {estimatedMinutes} min</span>
      </div>
    </Link>
  );
}
