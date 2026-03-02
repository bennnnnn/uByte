import Link from "next/link";

export interface LanguageCardProps {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  href?: string;
  tutorialCount?: number;
}

const LANG_THEME: Record<string, {
  card: string;
  icon: string;
  badge: string;
  arrow: string;
}> = {
  go: {
    card:  "border-cyan-200 bg-gradient-to-br from-white to-cyan-50/60 hover:border-cyan-400 hover:shadow-cyan-100 dark:border-cyan-900/50 dark:from-zinc-900 dark:to-cyan-950/20 dark:hover:border-cyan-700 dark:hover:shadow-cyan-950/50",
    icon:  "bg-cyan-100 dark:bg-cyan-950/50",
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400",
    arrow: "text-cyan-600 dark:text-cyan-400",
  },
  python: {
    card:  "border-blue-200 bg-gradient-to-br from-white to-blue-50/60 hover:border-blue-400 hover:shadow-blue-100 dark:border-blue-900/50 dark:from-zinc-900 dark:to-blue-950/20 dark:hover:border-blue-700 dark:hover:shadow-blue-950/50",
    icon:  "bg-blue-100 dark:bg-blue-950/50",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    arrow: "text-blue-600 dark:text-blue-400",
  },
  cpp: {
    card:  "border-violet-200 bg-gradient-to-br from-white to-violet-50/60 hover:border-violet-400 hover:shadow-violet-100 dark:border-violet-900/50 dark:from-zinc-900 dark:to-violet-950/20 dark:hover:border-violet-700 dark:hover:shadow-violet-950/50",
    icon:  "bg-violet-100 dark:bg-violet-950/50",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    arrow: "text-violet-600 dark:text-violet-400",
  },
  javascript: {
    card:  "border-yellow-200 bg-gradient-to-br from-white to-yellow-50/60 hover:border-yellow-400 hover:shadow-yellow-100 dark:border-yellow-900/50 dark:from-zinc-900 dark:to-yellow-950/20 dark:hover:border-yellow-700 dark:hover:shadow-yellow-950/50",
    icon:  "bg-yellow-100 dark:bg-yellow-950/50",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    arrow: "text-yellow-600 dark:text-yellow-500",
  },
  java: {
    card:  "border-orange-200 bg-gradient-to-br from-white to-orange-50/60 hover:border-orange-400 hover:shadow-orange-100 dark:border-orange-900/50 dark:from-zinc-900 dark:to-orange-950/20 dark:hover:border-orange-700 dark:hover:shadow-orange-950/50",
    icon:  "bg-orange-100 dark:bg-orange-950/50",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    arrow: "text-orange-600 dark:text-orange-400",
  },
  rust: {
    card:  "border-red-200 bg-gradient-to-br from-white to-red-50/60 hover:border-red-400 hover:shadow-red-100 dark:border-red-900/50 dark:from-zinc-900 dark:to-red-950/20 dark:hover:border-red-700 dark:hover:shadow-red-950/50",
    icon:  "bg-red-100 dark:bg-red-950/50",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    arrow: "text-red-600 dark:text-red-400",
  },
};

const DEFAULT_THEME = {
  card:  "border-zinc-200 bg-white hover:border-indigo-300 hover:shadow-indigo-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700",
  icon:  "bg-indigo-50 dark:bg-indigo-950/50",
  badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  arrow: "text-indigo-600 dark:text-indigo-400",
};

export default function LanguageCard({
  slug,
  name,
  description,
  icon,
  href = `/${slug}`,
  tutorialCount = 19,
}: LanguageCardProps) {
  const theme = LANG_THEME[slug] ?? DEFAULT_THEME;

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
          {tutorialCount} lessons
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
