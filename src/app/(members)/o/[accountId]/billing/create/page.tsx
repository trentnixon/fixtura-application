import { Suspense } from "react";

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
          <h1 className="font-brand text-2xl font-semibold capitalize">Create Season Pass</h1>
        </div>
        <Suspense fallback={<BrandedLoader label="Loading" />}>
          <CreateSubscriptionWizard accountId={accountId} />
        </Suspense>
      </div>
    </div>
  );
}
