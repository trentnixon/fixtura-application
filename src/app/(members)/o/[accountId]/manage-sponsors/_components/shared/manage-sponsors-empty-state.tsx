import { CircleAlert, Inbox } from "lucide-react";
import Link from "next/link";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import {
  MANAGE_SPONSORS_EMPTY_STATE_ADD_LABEL,
  MANAGE_SPONSORS_EMPTY_STATE_ASSIGNMENT_LABEL,
  MANAGE_SPONSORS_EMPTY_STATE_DESCRIPTION,
  MANAGE_SPONSORS_EMPTY_STATE_TITLE,
} from "./_constants/manage-sponsors-empty-state";
import {
  getManageSponsorsEmptyStateAddHref,
  getManageSponsorsEmptyStateAssignmentHref,
} from "./_utils/manage-sponsors-empty-state-routes";

import type { ManageSponsorsEmptyStateProps } from "./_types/manage-sponsors-empty-state";

export function ManageSponsorsEmptyState({ accountId }: ManageSponsorsEmptyStateProps) {
  return (
    <Card className="border-primary/15 bg-primary/5 shadow-sm ring-0">
      <CardContent className="flex flex-col items-center px-6 pt-8 text-center">
        <div
          className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-xl"
          aria-hidden
        >
          <Inbox className="size-6" />
        </div>
        <TypographyH3 className="mt-4 text-base font-semibold">
          {MANAGE_SPONSORS_EMPTY_STATE_TITLE}
        </TypographyH3>
        <TypographyMuted className="mt-2 max-w-xl text-sm leading-relaxed">
          {MANAGE_SPONSORS_EMPTY_STATE_DESCRIPTION}
        </TypographyMuted>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 px-6 pb-6">
        <Button variant="accent" asChild>
          <Link href={getManageSponsorsEmptyStateAddHref(accountId)}>
            {MANAGE_SPONSORS_EMPTY_STATE_ADD_LABEL}
          </Link>
        </Button>
        <Button variant="brandPrimaryOutline" asChild>
          <Link href={getManageSponsorsEmptyStateAssignmentHref(accountId)}>
            <CircleAlert className="size-4" aria-hidden />
            {MANAGE_SPONSORS_EMPTY_STATE_ASSIGNMENT_LABEL}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
