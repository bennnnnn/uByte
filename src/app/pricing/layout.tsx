import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare uByte Free and Pro plans for interactive coding tutorials, interview prep, and certification-style exams.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding course pricing",
    "programming tutorials subscription",
    "developer certification pricing",
  ],
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    type: "website",
    title: "uByte Pricing",
    description:
      "Compare Free vs Pro for tutorials, interview practice, and certification-style exams.",
    url: absoluteUrl("/pricing"),
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
