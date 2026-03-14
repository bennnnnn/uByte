import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Log in — uByte",
  description: "Sign in to your uByte account to continue your programming tutorials, practice problems, and certifications.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100svh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-indigo-600" />
      </div>
    }>
      <AuthPage variant="login" />
    </Suspense>
  );
}
