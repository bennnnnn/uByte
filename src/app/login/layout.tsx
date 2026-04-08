import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to continue your interactive tutorials, saved progress, bookmarks, and streak.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
