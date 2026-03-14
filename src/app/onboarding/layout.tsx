import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — uByte",
  description: "Tell us your goal so we can personalise your learning path — tutorials, interview prep, or certification.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
