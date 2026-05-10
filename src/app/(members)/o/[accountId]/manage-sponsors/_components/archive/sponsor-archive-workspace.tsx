import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/container";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorArchiveWorkspace({ accountId }: { accountId: string }) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Archived sponsors"
        description="Archived sponsors move out of the active pool and into this area. Restore and delete behaviours land in Phase 6."
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

      <Card className="shadow-sm">
        <CardContent className="grid gap-4 pt-6">
          <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm leading-relaxed">
            Archived sponsors will move out of the active pool and into this area. Hard delete will
            only be available here after the archive lifecycle is wired.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
