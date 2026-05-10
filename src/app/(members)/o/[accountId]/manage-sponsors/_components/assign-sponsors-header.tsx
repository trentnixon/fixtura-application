import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function AssignSponsorsHeader({ accountId }: { accountId: string }) {
  return (
    <PageHeader
      title="Assign sponsors"
      description="Choose sponsors for asset positions here, then prepare entity assignment in the same workflow. Sponsor details and logo editing stay in the sponsor pool route."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>Back to sponsor pool</Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
