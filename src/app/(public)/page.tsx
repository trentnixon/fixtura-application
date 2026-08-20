import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { SignInPageLayout } from "@/components/auth/sign-in-page-layout";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

export const metadata = buildPageMetadata({
  title: "Members",
  description:
    "Sign in to your Fixtura Members account to manage competitions, branding, and weekly content.",
});

function LoginFormFallback() {
  return (
    <div className="flex min-h-80 items-center justify-center py-12">
      <BrandedLoader size="sm" label="Loading sign in..." />
    </div>
  );
}

export default function Home() {
  return (
    <SignInPageLayout
      form={
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      }
    />
  );
}
