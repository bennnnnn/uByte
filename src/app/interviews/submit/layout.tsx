import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Share Interview Experience — uByte",
  description:
    "Share your tech interview experience anonymously to help other developers know what to expect.",
  alternates: { canonical: absoluteUrl("/interviews/submit") },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
