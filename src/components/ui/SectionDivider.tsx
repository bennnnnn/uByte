interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className = "" }: SectionDividerProps) {
  return (
    <div
      className={`border-t border-zinc-100 dark:border-zinc-800 ${className}`}
    />
  );
}
