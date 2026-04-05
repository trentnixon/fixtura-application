import { ReturnToSignInAction, SuccessMessageBlock } from "@/components/auth/actions";
import { AuthContentContainer, AuthPageSection } from "@/components/auth/layout";
import { AuthPageHeader, AuthSurface, SecondaryLinkGroup } from "@/components/auth/structure";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

export const metadata = buildPageMetadata({
  title: "Check Your Email",
  description: "A password reset link has been sent to your email address for Fixtura Members.",
});

export default function CheckEmailPage() {
  return (
    <AuthContentContainer>
      <AuthPageSection>
        <AuthPageHeader
          title="Check your email"
          description="We've sent a recovery link to your address."
        />

        <AuthSurface>
          <SuccessMessageBlock
            title="Check your inbox"
            description="If an account exists for that email, you'll receive a password reset link shortly."
          />
        </AuthSurface>

        <SecondaryLinkGroup>
          <ReturnToSignInAction label="Back to sign in" />
        </SecondaryLinkGroup>
      </AuthPageSection>
    </AuthContentContainer>
  );
}
