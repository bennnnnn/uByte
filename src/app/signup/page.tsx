import { Suspense } from "react";
import AuthPage from "@/components/auth/AuthPage";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <AuthPage variant="signup" />
    </Suspense>
  );
}
