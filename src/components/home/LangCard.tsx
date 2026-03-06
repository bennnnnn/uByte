import Link from "next/link";

type ColorScheme = "indigo" | "amber";

const THEMES: Record<ColorScheme, { card: string; iconBg: string; badge: string; arrow: string }> = {
  indigo: {
    card: "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/60 hover:border-indigo-400 hover:shadow-indigo-100 dark:border-indigo-900/50 dark:from-zinc-900 dark:to-indigo-950/20 dark:hover:border-indigo-700 dark:hover:shadow-indigo-950/50",
    iconBg: "bg-indigo-100 dark:bg-indigo-950/50",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400",
    arrow: "text-indigo-600 dark:text-indigo-400",
  },
  amber: {
    card: "border-amber-200 bg-gradient-to-br from-white to-amber-50/60 hover:border-amber-400 hover:shadow-amber-100 dark:border-amber-900/40 dark:from-zinc-900 dark:to-amber-950/20 dark:hover:border-amber-700",
    iconBg: "bg-amber-50 dark:bg-amber-950/50",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    arrow: "text-amber-600 dark:text-amber-400",
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
      className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${t.card}`}
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
