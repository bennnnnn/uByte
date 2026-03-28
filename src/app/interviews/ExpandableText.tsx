"use client";

import { useState } from "react";

const TRUNCATE_LINES = 4; // ~4 lines of text before collapsing

interface Props {
  text: string;
  className?: string;
  labelClassName?: string;
}

export default function ExpandableText({ text, className = "", labelClassName = "" }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Rough heuristic: collapse if text has more than 4 newlines or 400 chars
  const isLong = text.length > 400 || (text.match(/\n/g) ?? []).length > 3;

  if (!isLong) {
    return <p className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>{text}</p>;
  }

  return (
    <div>
      <p
        className={`whitespace-pre-wrap text-sm leading-relaxed ${className} ${
          !expanded ? `line-clamp-${TRUNCATE_LINES}` : ""
        }`}
        style={!expanded ? { WebkitLineClamp: TRUNCATE_LINES, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" } : undefined}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`mt-1.5 text-xs font-semibold transition-colors hover:underline ${labelClassName}`}
      >
        {expanded ? "Show less ↑" : "Read more ↓"}
      </button>
    </div>
  );
}
