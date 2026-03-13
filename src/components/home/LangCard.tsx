import Link from "next/link";

type ColorScheme = "indigo" | "amber";

const THEMES: Record<ColorScheme, { iconBg: string; badge: string; arrow: string; hover: string }> = {
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
    badge:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    arrow:  "text-indigo-600 dark:text-indigo-400",
    hover:  "hover:border-indigo-300 hover:shadow-indigo-50 dark:hover:border-indigo-800",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    badge:  "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    arrow:  "text-amber-600 dark:text-amber-400",
    hover:  "hover:border-amber-300 hover:shadow-amber-50 dark:hover:border-amber-800",
  },
};

export interface LangCardProps {
  href: string;
  icon?: string;
  name: string;
  badge: string;
  description: string;
  cta: string;
  color?: ColorScheme;
}

export default function LangCard({ href, icon, name, badge, description, cta, color = "indigo" }: LangCardProps) {
  const t = THEMES[color];
  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl bg-zinc-50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-800/80 ${t.hover}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${t.iconBg}`}>
              {icon}
            </span>
          )}
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{name}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${t.badge}`}>{badge}</span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{description}</p>
      <div className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-[gap] group-hover:gap-2 ${t.arrow}`}>
        <span>{cta}</span>
        <span>→</span>
      </div>
    </Link>
  );
}
