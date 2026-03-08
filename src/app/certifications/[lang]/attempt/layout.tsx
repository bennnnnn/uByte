import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam Attempt",
  description: "In-progress exam attempt.",
  robots: { index: false, follow: false },
};

export default function ExamAttemptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
