import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { PageHeader } from "@/components/ui/container";

import { BillingContent } from "./billing-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <PageHeader
          title="Billing"
          description="Subscription and billing status for this organisation from your live account (one request refreshes plan, trial, access, and invoice-request state)."
        />
      </div>
      <Suspense fallback={<BrandedLoader label="Loading billing" />}>
        <BillingContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
