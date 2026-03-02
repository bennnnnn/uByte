import Link from "next/link";

export interface LanguageCardProps {
  /** Language slug for URL, e.g. "go", "python", "cpp" */
  slug: string;
  /** Display name, e.g. "Go", "Python" */
  name: string;
  /** Short description for the card */
  description: string;
  /** Optional icon or emoji (e.g. "🐹" for Go) */
  icon?: string;
  /** href override; defaults to `/${slug}` */
  href?: string;
}

/**
 * Reusable card for a programming language. Used on the homepage and anywhere we list languages.
 * Click navigates to the language's tutorial list (e.g. /go, /python).
 */
export default function LanguageCard({
  slug,
  name,
  description,
  icon,
  href = `/${slug}`,
}: LanguageCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700"
    >
      <div className="mb-3 flex items-center gap-3">
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xl dark:bg-indigo-950/50">
            {icon}
          </span>
        )}
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-400">
          {name}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Start learning →
      </span>
    </Link>
  );
}
