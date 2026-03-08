import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starting Exam",
  description: "Preparing your exam attempt.",
  robots: { index: false, follow: false },
};

export default function ExamStartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
