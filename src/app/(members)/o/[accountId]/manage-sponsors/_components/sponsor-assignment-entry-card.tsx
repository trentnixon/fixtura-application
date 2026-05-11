import Link from "next/link";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorAssignmentEntryCard({
  accountId,
  disabled = false,
}: {
  accountId: string;
  disabled?: boolean;
}) {
  const assignBase = accountScopedRoutes.manageSponsorsAssign(accountId);

  return (
    <div className="bg-card text-card-foreground ring-border rounded-xl border-none p-5 shadow-sm ring-1">
      <div className="min-w-0 space-y-1">
        <TypographyH4 className="text-sm font-semibold">Assign sponsors to asset</TypographyH4>
        <TypographyMuted className="text-xs">
          Sponsor creation and sponsor assignment are now separate workflows. Use the assignment
          screen to place sponsors into primary or ranked positions and to prepare entity
          assignment.
        </TypographyMuted>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {disabled ? (
          <>
            <Button size="sm" variant="brand" disabled>
              Assign sponsors positions
            </Button>
            <Button size="sm" variant="outline" disabled>
              Assign sponsors to entities
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="brand" asChild>
              <Link href={`${assignBase}#sponsor-assign-positions`}>Assign sponsors positions</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`${assignBase}#sponsor-assign-entities`}>
                Assign sponsors to entities
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
