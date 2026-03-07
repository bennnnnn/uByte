import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Exam result – uByte",
    description: "View your practice exam result and certificate.",
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
