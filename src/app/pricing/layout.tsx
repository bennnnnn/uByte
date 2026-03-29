import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "uByte Pricing - Coding Tutorials and Interview Prep Plans",
  description:
    "Everything on uByte is free — tutorials, interview prep, and certifications. Upgrade to Pro for tutorial hints, code feedback, certification exam review, and interview debriefs.",
  keywords: [
    ...SITE_KEYWORDS,
    "coding course pricing",
    "programming tutorials subscription",
    "developer certification pricing",
  ],
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: {
    type: "website",
    title: "Pricing | uByte",
    description:
      "Free to learn. Upgrade to Pro for in-context help, code feedback, exam review, and interview debriefs.",
    url: absoluteUrl("/pricing"),
    images: [{ url: absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+coding+tutorials+and+certifications"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | uByte",
    description:
      "Free to learn. Upgrade to Pro for in-context help, code feedback, exam review, and interview debriefs.",
    images: [absoluteUrl("/api/og?title=Pricing&description=Free+and+Pro+plans+for+coding+tutorials+and+certifications")],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
