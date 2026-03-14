import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Log in — uByte",
  description: "Sign in to your uByte account to continue your programming tutorials, practice problems, and certifications.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <AuthPage variant="login" />
    </Suspense>
  );
}
