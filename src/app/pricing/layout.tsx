import type { Metadata } from "next";
import { absoluteUrl, SITE_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "uByte Pricing - Coding Tutorials and Interview Prep Plans",
  description:
    "Upgrade to uByte Pro for unlimited tutorials, interview practice, AI hints, and more. Free and Pro plans available.",
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
      "Upgrade to uByte Pro for unlimited tutorials, interview practice, AI hints, and more.",
    url: absoluteUrl("/pricing"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | uByte",
    description:
      "Upgrade to uByte Pro for unlimited tutorials, interview practice, AI hints, and more.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
