import type { Metadata } from "next";
import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

/** Auth SEO: defined here only — `signup/layout.tsx` is a passthrough (single source of truth). */
export const metadata: Metadata = {
  title: "Create your free account — uByte",
  description: "Join uByte for free and start learning through interactive tutorials with live code, saved progress, and optional paid hints.",
  robots: { index: false, follow: false },
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
