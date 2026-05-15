import { CircleAlert, Inbox } from "lucide-react";
import Link from "next/link";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { accountScopedRoutes } from "@/lib/config/account-routes";

export function ManageSponsorsEmptyState({ accountId }: { accountId: string }) {
  return (
    <Card className="border-primary/15 bg-primary/5 shadow-sm ring-0">
      <CardContent className="flex flex-col items-center px-6 pt-8 text-center">
        <div
          className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl"
          aria-hidden
        >
          <Inbox className="size-6" />
        </div>
        <TypographyH3 className="mt-4 text-base font-semibold">Add your first sponsor</TypographyH3>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          Add one sponsor at a time with their name, logo, and supporting details so they appear in
          your sponsor pool. Once a sponsor exists, you can assign them into primary or ranked
          positions from the assignment workflow.
        </TypographyMuted>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 px-6 pb-6">
        <Button variant="accent" asChild>
          <Link href={accountScopedRoutes.addSponsor(accountId)}>Add your first sponsor</Link>
        </Button>
        <Button variant="brandPrimaryOutline" asChild>
          <Link href={accountScopedRoutes.manageSponsorsAssignPosition(accountId)}>
            <CircleAlert className="size-4" aria-hidden />
            How assignment works
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
