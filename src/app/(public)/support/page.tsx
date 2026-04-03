import { Mail } from "lucide-react";

import { ReturnToSignInAction } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";
import { TypographyH5, TypographyMuted } from "@/components/typography";

export const metadata = {
  title: "Support",
  description: "Get help with your Fixtura account.",
};

export default function SupportPage() {
  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader title="Support" description="How can we help you today?" />

        <AuthSurface>
          <div className="space-y-6 py-4 text-center">
            <div className="flex justify-center">
              <div className="bg-primary/10 rounded-full p-4">
                <Mail className="text-primary h-8 w-8" />
              </div>
            </div>

            <div className="space-y-2">
              <TypographyH5>Contact Us</TypographyH5>
              <TypographyMuted>
                For account assistance, technical issues, or billing inquiries, please contact our
                support team.
              </TypographyMuted>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-primary font-medium">support@fixtura.com.au</p>
            </div>

            <TypographyMuted>We typically respond within 24-48 hours.</TypographyMuted>
          </div>
        </AuthSurface>

        <SecondaryLinkGroup>
          <ReturnToSignInAction label="Back to sign in" />
        </SecondaryLinkGroup>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
