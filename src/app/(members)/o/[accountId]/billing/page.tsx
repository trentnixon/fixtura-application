import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";

import { BillingContent } from "./billing-content";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Subscription and billing status for this organisation from your live account (one request
          refreshes plan, trial, access, and invoice-request state).
        </p>
      </div>
      <Suspense fallback={<BrandedLoader label="Loading billing" />}>
        <BillingContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
