import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function ManageSponsorsHeader({
  accountId,
  onAddSponsor,
}: {
  accountId: string;
  onAddSponsor: () => void;
}) {
  return (
    <Card className="overflow-hidden py-0">
      <div className="from-primary via-brand-secondary to-brand-accent h-1.5 w-full bg-linear-to-r" />
      <CardContent className="flex flex-col gap-4 px-6 py-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
              Sponsor pool workspace
            </p>
            <h1 className="font-brand text-2xl font-semibold">Manage sponsors</h1>
          </div>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Sponsors live in a pool first. Placement makes a sponsor usable, and targeting controls
            where that sponsor applies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={accountScopedRoutes.manageSponsorsArchive(accountId)}>View archive</Link>
          </Button>
          <Button variant="secondary" onClick={onAddSponsor}>
            Add sponsor
          </Button>
          <Button disabled>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
