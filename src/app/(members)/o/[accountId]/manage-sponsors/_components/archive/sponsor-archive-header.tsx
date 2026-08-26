import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorArchiveHeader({ accountId }: { accountId: string }) {
  return (
    <PageHeader
      title="Archived sponsors"
      description="These sponsors are out of the pool until you restore them."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="brandPrimaryOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>Back to sponsor pool</Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
