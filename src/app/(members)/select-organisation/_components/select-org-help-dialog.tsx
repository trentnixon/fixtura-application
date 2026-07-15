"use client";

import { CircleHelp } from "lucide-react";
import Link from "next/link";

import { TypographyBodySmall, TypographyCaption } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import { SelectOrgStatusBadge } from "./select-org-status-badge";
import {
  SELECT_ORG_STATUS_DESCRIPTIONS,
  SELECT_ORG_STATUS_LABELS,
} from "../_utils/select-org-display-state";

import type { SelectOrganisationDisplayState } from "../_utils/select-org-display-state";

type SelectOrgHelpDialogProps = {
  compact?: boolean;
};

const HELP_STATUS_STATES = [
  "active",
  "setup-required",
  "preparing",
  "inactive",
] as const satisfies readonly SelectOrganisationDisplayState[];

export function SelectOrgHelpDialog({ compact = false }: SelectOrgHelpDialogProps) {
  const label = "How organisation access works";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={compact ? "icon" : "sm"}
          className={cn(
            "shrink-0 gap-2 self-start max-[425px]:hidden",
            !compact && "max-[768px]:size-9 max-[768px]:gap-0 max-[768px]:px-0",
          )}
          aria-label={label}
        >
          <CircleHelp className="size-4" aria-hidden />
          {!compact ? <span className="max-[768px]:sr-only">{label}</span> : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Choose the workspace you want to work in. You can switch organisations later from the
            sidebar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <TypographyBodySmall as="p">
            An organisation is a Fixtura workspace for a club or association. You may see more than
            one if you belong to multiple workspaces.
          </TypographyBodySmall>

          <Separator />

          <div className="grid gap-3">
            <TypographyCaption as="p" className="font-semibold tracking-wide uppercase">
              Status meanings
            </TypographyCaption>
            <ul className="grid gap-3">
              {HELP_STATUS_STATES.map((state) => (
                <li key={state} className="flex items-start gap-3">
                  <SelectOrgStatusBadge
                    displayState={state}
                    statusLabel={SELECT_ORG_STATUS_LABELS[state]}
                    statusDescription=""
                    className="mt-0.5"
                  />
                  <TypographyBodySmall as="p" tone="muted" className="min-w-0 flex-1">
                    {SELECT_ORG_STATUS_DESCRIPTIONS[state]}
                  </TypographyBodySmall>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={ROUTES.support}>Contact support</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
