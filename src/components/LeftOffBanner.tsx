import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

/** Shown on home when user has last-activity data: "You left off at ..." */
export default function LeftOffBanner({ href, label }: Props) {
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:flex-nowrap">
        <div className="flex items-center gap-3">
          <span className="text-xl">👋</span>
          <div>
            <p className="text-sm font-medium text-violet-900 dark:text-violet-200">
              You left off at
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Pick up where you left off
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-violet-600 hover:shadow-md"
        >
          {label}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
