import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in or create a uByte account.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
