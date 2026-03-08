"use client";

import { useState } from "react";
import type { ExamDetailContent } from "@/lib/exams/content";

function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {items.map((item, i) => {
        const isOpen = openIndex === i || hoverIndex === i;
        return (
          <div
            key={i}
            className="group"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 hover:text-indigo-600 dark:text-zinc-100 dark:hover:bg-zinc-800/50 dark:hover:text-indigo-400"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
            >
              <span>{item.question}</span>
              <span
                className={`shrink-0 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type TabId = "overview" | "learn" | "faq";

const TAB_LABELS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "learn", label: "What you'll learn" },
  { id: "faq", label: "Q&A" },
];

interface Props {
  langName: string;
  content: ExamDetailContent | null;
  examSize: number;
  examDurationMinutes: number;
  passPercent: number;
}

export default function ExamDetailTabs({ langName, content, examSize, examDurationMinutes, passPercent }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tagline =
    content?.tagline ??
    `Timed multiple-choice exam to validate your ${langName} knowledge.`;
  const objective =
    content?.objective ??
    `This exam tests core ${langName} concepts. Score ${passPercent}% or higher to pass and earn a certificate.`;
  const topics =
    content?.topics ?? [
      "Language syntax and types",
      "Standard library and common patterns",
      "Best practices and idioms",
    ];
  const audience = content?.audience;
  const faq =
    content?.faq ?? [
      {
        question: "How long is the exam?",
        answer: `${examDurationMinutes} minutes. The timer starts when you begin and cannot be paused.`,
      },
      {
        question: "How many questions?",
        answer: `${examSize} multiple-choice questions. You need ${passPercent}% or higher to pass.`,
      },
      {
        question: "Do I get a certificate?",
        answer: `Yes. Passing with ${passPercent}% or higher earns you a shareable certificate.`,
      },
    ];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Tab bar */}
      <div
        className="flex border-b border-zinc-200 dark:border-zinc-700"
        role="tablist"
        aria-label="Exam details"
      >
        {TAB_LABELS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`tabpanel-${id}`}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`min-w-0 flex-1 border-b-2 px-4 py-4 text-sm font-semibold transition-colors sm:flex-initial sm:px-6 ${
              activeTab === id
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="p-5 sm:p-6">
        {activeTab === "overview" && (
          <div
            id="tabpanel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="space-y-6"
          >
            <p className="text-zinc-700 dark:text-zinc-300">{tagline}</p>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                About this exam
              </h3>
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">{objective}</p>
            </div>
            {audience && (
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Who this is for
                </h3>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  {audience}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "learn" && (
          <div
            id="tabpanel-learn"
            role="tabpanel"
            aria-labelledby="tab-learn"
            className="space-y-4"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Topics and skills covered in this exam:
            </p>
            <ul className="space-y-3">
              {topics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-3 text-zinc-800 dark:text-zinc-200"
                >
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-400"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "faq" && (
          <div
            id="tabpanel-faq"
            role="tabpanel"
            aria-labelledby="tab-faq"
            className="space-y-0"
          >
            <FaqAccordion items={faq} />
          </div>
        )}
      </div>
    </div>
  );
}
