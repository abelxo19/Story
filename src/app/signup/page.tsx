import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<p className="p-16 text-center text-amber-900/60">Loading...</p>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
