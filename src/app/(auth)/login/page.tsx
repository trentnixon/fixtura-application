import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

function LoginFormFallback() {
  return (
    <div className="text-muted-foreground text-center text-sm" role="status">
      Loading sign-in…
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <div className="text-center">
        <h1 className="font-brand text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm">Use your Fixtura account to continue.</p>
      </div>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
      <p className="text-muted-foreground text-center text-xs">
        <Link href="/" className="hover:text-foreground underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </div>
  );
}
