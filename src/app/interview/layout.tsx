import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Coding Interview Simulator — Practice Timed Mock Interviews | uByte",
  description:
    "Simulate a real coding interview with timed mock sessions. Choose your language (Go, Python, JavaScript, Java, C++, Rust, C#), difficulty, and time limit. Practice under pressure and get instant feedback on your solutions.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding interview simulator",
    "mock coding interview",
    "timed coding interview",
    "practice coding interview",
    "coding interview practice online",
    "mock technical interview",
    "software engineer interview practice",
    "coding interview timer",
    "simulate coding interview",
    "interview practice tool",
    "coding interview under pressure",
    "free mock interview",
  ],
  alternates: { canonical: absoluteUrl("/interview") },
  openGraph: {
    title: "Coding Interview Simulator — Timed Mock Interviews | uByte",
    description: "Simulate real coding interviews with timed sessions in 7 languages. Practice under pressure and build confidence.",
    url: absoluteUrl("/interview"),
    images: [{ url: absoluteUrl("/api/og?title=Interview+Simulator&description=Timed+mock+coding+interviews+in+7+languages"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Interview Simulator | uByte",
    description: "Simulate real coding interviews with timed sessions in Go, Python, JavaScript, Java, C++, Rust, and C#.",
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
