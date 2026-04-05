import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthPageHeader, AuthSurface } from "@/components/auth/structure";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

export const metadata = buildPageMetadata({
  title: "Sign In",
  description: "Sign in to access your Fixtura Members account.",
});

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
        <AuthPageHeader title="Sign in" />

        <AuthSurface>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>
        </AuthSurface>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
