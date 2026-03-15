import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Share Your Interview Experience — Help Developers Prepare | uByte",
  description:
    "Share your tech interview experience anonymously. Help other developers know what to expect at Google, Meta, Amazon, Microsoft, and other top companies.",
  keywords: [
    ...SITE_KEYWORDS,
    "share interview experience",
    "submit interview story",
    "tech interview feedback",
    "anonymous interview experience",
  ],
  alternates: { canonical: absoluteUrl("/interviews/submit") },
  openGraph: {
    title: "Share Your Interview Experience | uByte",
    description:
      "Help other developers by sharing your interview experience anonymously.",
    url: absoluteUrl("/interviews/submit"),
    images: [{ url: absoluteUrl("/api/og?title=Share+Your+Interview+Experience&description=Help+developers+prepare+for+tech+interviews"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Share Your Interview Experience | uByte",
    description: "Help other developers by sharing your interview experience anonymously.",
  },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
