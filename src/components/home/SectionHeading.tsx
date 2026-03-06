interface SectionHeadingProps {
  id: string;
  title: string;
  subtitle: string;
  className?: string;
}

export default function SectionHeading({ id, title, subtitle, className = "mb-8" }: SectionHeadingProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 id={id} className="text-2xl font-black text-zinc-900 dark:text-zinc-100 sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">{subtitle}</p>
    </div>
  );
}
