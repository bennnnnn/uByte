import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Exam result — uByte",
    description: "Your certification exam result. See your score, correct/incorrect answers, and download your certificate if you passed.",
    robots: { index: false, follow: false },
  };
}

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
