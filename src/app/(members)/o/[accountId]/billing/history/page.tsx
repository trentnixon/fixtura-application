import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";

import { BillingHistoryContent } from "./billing-history-content";

export default async function BillingHistoryPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Billing history</h1>
        <p className="text-muted-foreground mt-1">
          Order history, invoice requests, and your current subscription row (from billing data).
        </p>
      </div>
      <Suspense fallback={<BrandedLoader label="Loading history" />}>
        <BillingHistoryContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
