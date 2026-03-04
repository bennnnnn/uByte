import Link from "next/link";

export interface InterviewCtaCardProps {
  /** Main heading, e.g. "Prepare for your interview" or "Ace your interview" */
  title: string;
  /** Short description */
  description: string;
  /** Link target; defaults to /practice */
  href?: string;
  /** Optional icon/emoji */
  icon?: string;
  /** CTA label; defaults to "Practice problems →" or "Practice exams →" based on href */
  ctaLabel?: string;
}

/**
 * Reusable CTA card for the interview practice section on the homepage.
 * Click navigates to the practice problem list (e.g. /practice).
 */
function defaultCtaLabel(href: string): string {
  return href.includes("practice-exams") ? "Practice exams →" : "Practice problems →";
}

export default function InterviewCtaCard({
  title,
  description,
  href = "/practice",
  icon = "🎯",
  ctaLabel,
}: InterviewCtaCardProps) {
  const label = ctaLabel ?? defaultCtaLabel(href);
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-6 text-left transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md dark:border-indigo-800 dark:bg-indigo-950/30 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xl dark:bg-indigo-900/50">
          {icon}
        </span>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-indigo-700 dark:text-indigo-300">
        {label}
      </span>
    </Link>
  );
}
