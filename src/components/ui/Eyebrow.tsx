import type { ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "p" | "span";
  id?: string;
}

export default function Eyebrow({ children, className = "", as: Tag = "h2", id }: EyebrowProps) {
  return (
    <Tag
      id={id}
      className={`mb-1 text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 ${className}`}
    >
      {children}
    </Tag>
  );
}
