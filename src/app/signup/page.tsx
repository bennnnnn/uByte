import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Create your account — uByte",
  description: "Join uByte for free. Learn programming through interactive tutorials, sharpen your skills with coding challenges, and earn verified certifications.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100svh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
      </div>
    }>
      <AuthPage variant="signup" />
    </Suspense>
  );
}
