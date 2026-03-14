import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Certificate of Completion — uByte",
    description: "View and verify this programming certification certificate issued by uByte.",
  };
}

export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
