import Link from "next/link";

import { InlineAlert, ReturnToSignInAction } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";
import { TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: "Authentication Error",
  description: "Something went wrong during the authentication process.",
};

export default function AuthErrorPage() {
  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader title="Sign-in Error" description="We couldn't complete your request." />

        <AuthSurface>
          <div className="space-y-6">
            <InlineAlert
              message="Your request couldn't be processed. This might be due to an expired link, or a configuration issue."
              variant="destructive"
            />
            <TypographyMuted className="text-center leading-relaxed">
              Please try signing in again. If the problem persists, contact our support team.
            </TypographyMuted>
          </div>
        </AuthSurface>

        <SecondaryLinkGroup>
          <ReturnToSignInAction label="Return to sign in" />
          <TypographyMuted className="text-xs">
            Still having issues?{" "}
            <Link href={ROUTES.help} className="text-primary font-medium hover:underline">
              Get help
            </Link>
          </TypographyMuted>
        </SecondaryLinkGroup>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
