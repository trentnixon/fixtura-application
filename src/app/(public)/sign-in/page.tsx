import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageHeader, AuthSurface } from "@/components/auth/structure";

function LoginFormFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center py-12">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader title="Sign in" description="Access your Fixtura members area" />

        <AuthSurface>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </AuthSurface>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
