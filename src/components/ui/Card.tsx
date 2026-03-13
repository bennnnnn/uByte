import { forwardRef, type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className = "", as: Tag = "div" },
  ref
) {
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`rounded-2xl border border-[#E7E1F3] bg-surface-card shadow-sm dark:border-zinc-700 ${className}`}
    >
      {children}
    </Tag>
  );
});

export default Card;
