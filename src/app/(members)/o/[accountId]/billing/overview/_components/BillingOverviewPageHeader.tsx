import Link from "next/link";

import { TypographyPageDescription, TypographyPageTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";

type BillingOverviewPageHeaderProps = {
  showBillingHistory?: boolean;
  historyHref: string;
};

export function BillingOverviewPageHeader({
  showBillingHistory = false,
  historyHref,
}: BillingOverviewPageHeaderProps) {
  return (
    <header className="border-border border-b pb-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <TypographyPageTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
            Billing
          </TypographyPageTitle>
          <TypographyPageDescription className="max-w-3xl">
            Manage your subscription, trial, invoices, and billing access for this organisation.
          </TypographyPageDescription>
        </div>
        {showBillingHistory ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={historyHref}>View billing history</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
