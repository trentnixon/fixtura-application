import { Suspense } from "react";

import { TypographyPageTitle } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";

import { CreateSubscriptionWizard } from "./create-subscription-wizard";

export default async function CreateBillingPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="bg-muted/35 grid gap-6 rounded-lg border border-transparent p-5 sm:p-6">
        <div>
          <TypographyPageTitle className="font-brand capitalize">
            Create Season Pass
          </TypographyPageTitle>
        </div>
        <Suspense fallback={<BrandedLoader label="Loading" />}>
          <CreateSubscriptionWizard accountId={accountId} />
        </Suspense>
      </div>
    </div>
  );
}
