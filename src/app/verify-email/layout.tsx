import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address for your uByte account.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
