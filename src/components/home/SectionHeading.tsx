interface SectionHeadingProps {
  id: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
  className?: string;
}

export default function SectionHeading({ id, title, subtitle, eyebrow, className = "mb-8" }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
          {eyebrow}
        </div>
      )}
      <h2 id={id} className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">{subtitle}</p>
    </div>
  );
}
