import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";

import { BillingContent } from "./overview/_components/BillingContent";

export default async function Page({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      <Suspense fallback={<BrandedLoader label="Loading billing" />}>
        <BillingContent accountId={accountId} />
      </Suspense>
    </div>
  );
}
