import Link from "next/link";

import { ReturnToSignInAction } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";
import { TypographyMuted } from "@/components/typography";
import { ROUTES } from "@/lib/config/routes";

export const metadata = {
  title: "Session Expired",
  description: "For your security, your session has timed out.",
};

export default function SessionExpiredPage() {
  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader
          title="Session Expired"
          description="Your session has timed out for security."
        />

        <AuthSurface>
          <div className="space-y-6 text-center">
            <TypographyMuted className="leading-relaxed">
              This usually happens after a period of inactivity. Please sign in again to continue
              working.
            </TypographyMuted>
            <div className="flex justify-center">
              <ReturnToSignInAction label="Sign in again" />
            </div>
          </div>
        </AuthSurface>

        <SecondaryLinkGroup>
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
