import Link from "next/link";

export interface InterviewLanguageCardProps {
  /** Language slug, e.g. "go", "python", "cpp" */
  slug: string;
  /** Display name, e.g. "Go", "Python" */
  name: string;
  /** Optional icon/emoji */
  icon?: string;
  /** Link target; defaults to /practice */
  href?: string;
}

/**
 * Card for "Ace your interview" section: one per language. Click opens the list of interview problems (/practice).
 */
export default function InterviewLanguageCard({
  slug,
  name,
  icon,
  href = "/practice",
}: InterviewLanguageCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-5 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50"
    >
      <div className="mb-2 flex items-center gap-3">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg dark:bg-indigo-900/50">
            {icon}
          </span>
        )}
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Practice in {name}
        </h3>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Solve problems like Two Sum, Three Sum & more.
      </p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">
        View problems →
      </span>
    </Link>
  );
}
