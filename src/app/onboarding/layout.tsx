import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — uByte",
  description: "Choose a language and jump straight into your first tutorial track.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
