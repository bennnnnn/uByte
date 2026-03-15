import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Interview Simulator",
  description:
    "Practice coding interviews with timed mock sessions. Choose your language, difficulty, and time limit to simulate real interview conditions.",
  alternates: { canonical: `${BASE_URL}/interview` },
  openGraph: {
    title: "Interview Simulator — uByte",
    description: "Timed mock coding interviews across 7 languages.",
    url: `${BASE_URL}/interview`,
  },
};

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
