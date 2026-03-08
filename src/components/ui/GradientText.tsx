import type { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "strong" | "em";
}

export default function GradientText({ children, className = "", as: Tag = "span" }: GradientTextProps) {
  return (
    <Tag
      className={`bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </Tag>
  );
}
