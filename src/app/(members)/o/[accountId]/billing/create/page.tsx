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
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold capitalize">Create subscription</h1>
        <p className="text-muted-foreground mt-1">
          Choose a plan, start date, and payment path. Your billing status updates from the server
          after each step.
        </p>
      </div>
      <Suspense fallback={<BrandedLoader label="Loading" />}>
        <CreateSubscriptionWizard accountId={accountId} />
      </Suspense>
    </div>
  );
}
