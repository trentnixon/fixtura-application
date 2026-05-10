import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorAssignmentEntryCard({
  accountId,
  disabled = false,
}: {
  accountId: string;
  disabled?: boolean;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Assign sponsors to asset</CardTitle>
        <CardDescription>
          Sponsor creation and sponsor assignment are now separate workflows. Use the assignment
          screen to place sponsors into primary or ranked positions and to prepare entity
          assignment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm leading-relaxed">
          This keeps logo and detail editing focused here, while the assignment route handles the
          actual sponsorship positions.
        </p>
        {disabled ? (
          <Button disabled>Open assignment screen</Button>
        ) : (
          <Button asChild>
            <Link href={accountScopedRoutes.manageSponsorsAssign(accountId)}>
              Open assignment screen
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
