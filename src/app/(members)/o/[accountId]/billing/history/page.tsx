import { Suspense } from "react";

import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";

import { BillingHistoryContent } from "./_components/BillingHistoryContent";

export default async function BillingHistoryPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div className="space-y-1">
        <TypographyPageTitle className="font-brand capitalize">Billing history</TypographyPageTitle>
        <TypographyPageDescription className="mt-1 max-w-none text-base">
          Order history, invoice requests, and your current subscription row (from billing data).
        </TypographyPageDescription>
      </div>
      <Suspense fallback={<BrandedLoader label="Loading history" />}>
        <BillingHistoryContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
