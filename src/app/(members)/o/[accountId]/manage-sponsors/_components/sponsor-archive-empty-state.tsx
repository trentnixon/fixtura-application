import { ArchiveRestore } from "lucide-react";
import Link from "next/link";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorArchiveEmptyState({ accountId }: { accountId: string }) {
  return (
    <Card className="border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <div
          className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-lg"
          aria-hidden
        >
          <ArchiveRestore className="size-6" />
        </div>
        <TypographyH4 className="mt-4 text-base font-semibold">No archived sponsors</TypographyH4>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          Sponsors you archive from the sponsor editor will appear here. Restoring one returns it to
          the sponsor pool without assigning it to a placement.
        </TypographyMuted>
        <Button className="mt-5" variant="brandPrimaryOutline" asChild>
          <Link href={accountScopedRoutes.manageSponsors(accountId)}>Back to sponsor pool</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
