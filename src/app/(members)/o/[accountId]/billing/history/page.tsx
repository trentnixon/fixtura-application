import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";

import { BillingHistoryContent } from "./_components/BillingHistoryContent";

export default async function BillingHistoryPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <PageHeader
          title="Billing history"
          description="Order history, invoice requests, and subscription status for this organisation."
        />
      </div>
      <Suspense fallback={<BrandedLoader label="Loading history" />}>
        <BillingHistoryContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
