import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function AddSponsorHeader({ accountId }: { accountId: string }) {
  return (
    <PageHeader
      title="Add sponsor"
      description="Add one name and logo, save it, then go back to the pool to place it."
    >
      <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="brandOutline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>
              <ArrowLeft aria-hidden />
              Back to overview
            </Link>
          </Button>
        </div>
      </div>
    </PageHeader>
  );
}
