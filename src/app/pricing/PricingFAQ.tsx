"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

interface Props {
  items: FaqItem[];
}

export default function PricingFAQ({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="mx-auto mt-14 max-w-2xl">
      <h2 className="mb-6 text-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Frequently asked questions
      </h2>
      <dl className="space-y-2">
        {items.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.q}
              className="rounded-xl border border-zinc-200 bg-surface-card dark:border-zinc-700"
            >
              <dt>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  {faq.q}
                  <span
                    className={`shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
              </dt>
              <dd
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                className={`overflow-hidden text-sm text-zinc-600 transition-[height] dark:text-zinc-400 ${
                  isOpen ? "visible" : "hidden"
                }`}
              >
                <p className="border-t border-zinc-100 px-4 pb-3.5 pt-1.5 dark:border-zinc-700">
                  {faq.a}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
