import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function AddSponsorHeader({ accountId }: { accountId: string }) {
  return (
    <PageHeader
      title="Add sponsor"
      description="Create one sponsor at a time, confirm the save, then return to the sponsor overview when you are ready."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>Back to overview</Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
