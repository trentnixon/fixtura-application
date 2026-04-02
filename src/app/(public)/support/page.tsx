import { Mail } from "lucide-react";

import { ReturnToSignInAction } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";

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
              <h3 className="text-lg font-medium">Contact Us</h3>
              <p className="text-muted-foreground">
                For account assistance, technical issues, or billing inquiries, please contact our
                support team.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-primary font-medium">support@fixtura.com.au</p>
            </div>

            <p className="text-muted-foreground text-sm">
              We typically respond within 24-48 hours.
            </p>
          </div>
        </AuthSurface>

        <SecondaryLinkGroup>
          <ReturnToSignInAction label="Back to sign in" />
        </SecondaryLinkGroup>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
