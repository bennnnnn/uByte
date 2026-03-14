import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Create your account — uByte",
  description: "Join uByte for free. Learn programming through interactive tutorials, sharpen your skills with coding challenges, and earn verified certifications.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <AuthPage variant="signup" />
    </Suspense>
  );
}
