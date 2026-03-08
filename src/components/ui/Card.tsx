import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

export default function Card({ children, className = "", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={`rounded-2xl border border-zinc-200 bg-surface-card shadow-sm dark:border-zinc-700 ${className}`}
    >
      {children}
    </Tag>
  );
}
