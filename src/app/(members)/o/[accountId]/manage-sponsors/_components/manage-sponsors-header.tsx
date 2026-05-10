import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function ManageSponsorsHeader({ accountId }: { accountId: string }) {
  return (
    <PageHeader
      title="Manage sponsors"
      description="Sponsors live in a pool first. Placement makes a sponsor usable, and targeting controls where that sponsor applies."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsAssign(accountId)}>Assign sponsors</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsArchive(accountId)}>View archive</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={accountScopedRoutes.addSponsor(accountId)}>Add sponsor</Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
