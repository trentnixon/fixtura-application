import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { ReturnToSignInAction } from "@/components/auth/actions";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";

export const metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your Fixtura account.",
};

function AuthFormFallback() {
  return (
    <div className="flex min-h-[320px] items-center justify-center py-12">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
    </div>
  );
}

interface ForgotPasswordPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { code } = await searchParams;
  const isResetting = !!code;

  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader
          title={isResetting ? "Create a new password" : "Reset your password"}
          description={
            isResetting
              ? "Enter a strong password to secure your account."
              : "We'll send you a link to get back into your account."
          }
        />

        <AuthSurface>
          <Suspense fallback={<AuthFormFallback />}>
            {isResetting ? <ResetPasswordForm /> : <ForgotPasswordForm />}
          </Suspense>
        </AuthSurface>

        <SecondaryLinkGroup>
          <ReturnToSignInAction />
        </SecondaryLinkGroup>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
