import Link from "next/link";

export interface LanguageCardProps {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  href?: string;
  /** Total number of lessons (steps) for this language, from tutorial data. */
  lessonCount?: number;
}

/** Single purple identity theme for all language cards */
const PURPLE_THEME = {
  card:  "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 hover:border-indigo-400 hover:shadow-indigo-100 dark:border-indigo-900/50 dark:from-zinc-900 dark:to-indigo-950/20 dark:hover:border-indigo-700 dark:hover:shadow-indigo-950/50",
  icon:  "bg-indigo-100 dark:bg-indigo-950/50",
  badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
  arrow: "text-indigo-600 dark:text-indigo-400",
};

export default function LanguageCard({
  slug,
  name,
  description,
  icon,
  href = `/${slug}`,
  lessonCount = 0,
}: LanguageCardProps) {
  const theme = PURPLE_THEME;

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${theme.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          {icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${theme.icon}`}>
              {icon}
            </span>
          )}
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {name}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${theme.badge}`}>
          {lessonCount} lessons
        </span>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      <div className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-gap group-hover:gap-2 ${theme.arrow}`}>
        <span>Start learning</span>
        <span>→</span>
      </div>
    </Link>
  );
}
