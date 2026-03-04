// Exam detail content for the public exam landing pages.
// Used so users can read full info before upgrading to take the exam.

import type { ExamLang } from "./config";
import { EXAM_DURATION_MINUTES, EXAM_SIZE } from "./config";

export interface ExamDetailContent {
  /** Short tagline under the title */
  tagline: string;
  /** 1–2 sentences: what this exam validates */
  objective: string;
  /** Bullet list of topic areas covered */
  topics: string[];
  /** Bullet list of rules (time, pass threshold, behavior) */
  rules: string[];
  /** Optional: who it's for */
  audience?: string;
  /** Q&A for the FAQ tab */
  faq?: { question: string; answer: string }[];
}

const GO_CONTENT: ExamDetailContent = {
  tagline: "Validate your Go fundamentals with a timed, multiple-choice assessment.",
  objective:
    "This exam checks that you understand core Go concepts: syntax, types, concurrency, and standard library usage. Passing demonstrates readiness for Go-focused roles or further study.",
  topics: [
    "Variables, types, and zero values",
    "Functions and multiple return values",
    "Structs, methods, and interfaces",
    "Slices, arrays, and the append/copy built-ins",
    "Maps and iteration with range",
    "Pointers and dereferencing",
    "Goroutines, channels, and select",
    "Error handling: error type, defer, panic, recover",
    "Packages, imports, and visibility (capitalization)",
    "Context and net/http basics",
    "Testing (go test) and tooling (gofmt, go mod)",
  ],
  rules: [
    `${EXAM_SIZE} multiple-choice questions.`,
    `${EXAM_DURATION_MINUTES} minutes. The timer starts when you begin and cannot be paused.`,
    `You need 70% or higher (${Math.ceil((EXAM_SIZE * 70) / 100)} correct answers) to pass.`,
    "Questions and answer order are randomized each attempt.",
    "One attempt per exam session. You can retake the exam in a new session after completion.",
    "Passing earns a shareable certificate.",
  ],
  audience: "Developers who have completed the Go tutorials or have equivalent experience.",
  faq: [
    {
      question: "How long is the exam?",
      answer: "You have 45 minutes from the moment you start. The timer cannot be paused. Use your time wisely and try to answer every question.",
    },
    {
      question: "How many questions are there?",
      answer: "Each attempt has 40 multiple-choice questions. They are drawn at random from a larger pool, so each attempt can feel different.",
    },
    {
      question: "What score do I need to pass?",
      answer: "You need 70% or higher (at least 28 correct answers out of 40) to pass and earn your certificate.",
    },
    {
      question: "Can I retake the exam?",
      answer: "Yes. After you complete an attempt (submit or run out of time), you can start a new attempt. Questions and answer order are randomized each time.",
    },
    {
      question: "Do I get a certificate?",
      answer: "Yes. When you pass with 70% or higher, you receive a shareable certificate that you can link to from your profile or resume.",
    },
    {
      question: "What if I run out of time?",
      answer: "Your answers are automatically submitted when the timer ends. You'll see your score and whether you passed. You can start a new attempt anytime.",
    },
  ],
};

const EXAM_CONTENT: Partial<Record<ExamLang, ExamDetailContent>> = {
  go: GO_CONTENT,
};

/** Get detail content for an exam language. Returns null if not defined (fallback to generic). */
export function getExamDetailContent(lang: string): ExamDetailContent | null {
  return EXAM_CONTENT[lang as ExamLang] ?? null;
}

export { EXAM_DURATION_MINUTES, EXAM_SIZE };
