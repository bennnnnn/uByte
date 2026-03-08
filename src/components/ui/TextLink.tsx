import Link from "next/link";
import type { ReactNode } from "react";

interface TextLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function TextLink({ href, children, className = "" }: TextLinkProps) {
  return (
    <Link
      href={href}
      className={`font-medium text-indigo-600 hover:underline dark:text-indigo-400 ${className}`}
    >
      {children}
    </Link>
  );
}
