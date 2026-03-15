import type { Metadata } from "next";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the uByte team. Report bugs, ask billing questions, request features, or reach out for any other reason.",
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: "Contact Us — uByte",
    description: "Reach the uByte team for support, feedback, or questions.",
    url: `${BASE_URL}/contact`,
    images: [{ url: `${BASE_URL}/api/og?title=Contact+Us&description=Get+in+touch+with+the+uByte+team`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — uByte",
    description: "Reach the uByte team for support, feedback, or questions.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
