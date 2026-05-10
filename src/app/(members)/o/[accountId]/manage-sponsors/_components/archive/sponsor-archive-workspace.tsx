import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function SponsorArchiveWorkspace({ accountId }: { accountId: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Archived sponsors</CardTitle>
        <CardDescription>
          Phase 1 creates the archive route scaffold. Restore and delete behaviors land in Phase 6.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="text-muted-foreground rounded-xl border border-dashed p-6 text-sm leading-relaxed">
          Archived sponsors will move out of the active pool and into this area. Hard delete will
          only be available here after the archive lifecycle is wired.
        </div>
        <div>
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsors(accountId)}>Back to sponsor pool</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
