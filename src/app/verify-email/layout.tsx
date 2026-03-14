import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify your email — uByte",
  description: "Confirm your email address to unlock all features of your uByte account.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
