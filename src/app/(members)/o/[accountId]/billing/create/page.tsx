import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { Button } from "@/components/ui/button";

import { CreateSubscriptionWizard } from "./create-subscription-wizard";

/** Canonical Season Pass purchase route for account billing. */
export default async function CreateBillingPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const billingHref = `/o/${encodeURIComponent(accountId)}/billing`;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <header className="border-border mb-4 border-b pb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4 w-fit">
          <Link href={billingHref}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to billing
          </Link>
        </Button>

        <div className="space-y-2">
          <TypographyPageTitle
            as="h1"
            className="font-brand text-3xl font-bold tracking-tight capitalize sm:text-4xl"
          >
            Create Season Pass
          </TypographyPageTitle>
          <TypographyPageDescription className="max-w-3xl">
            Choose a Season Pass, set the start date, and pick how it will be paid for.
          </TypographyPageDescription>
        </div>
      </header>

      <Suspense fallback={<BrandedLoader label="Loading" />}>
        <CreateSubscriptionWizard key={accountId} accountId={accountId} />
      </Suspense>
    </div>
  );
}
