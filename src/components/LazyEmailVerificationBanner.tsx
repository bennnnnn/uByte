"use client";

import dynamic from "next/dynamic";

const EmailVerificationBanner = dynamic(
  () => import("@/components/EmailVerificationBanner"),
  { ssr: false }
);

export default function LazyEmailVerificationBanner() {
  return <EmailVerificationBanner />;
}
