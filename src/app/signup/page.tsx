import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-zinc-50 dark:bg-zinc-950" />}>
      <AuthPage variant="signup" />
    </Suspense>
  );
}
