"use client";

import { CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildClubLogosPageHelpContent,
  type ClubLogosPageHelpRoute,
} from "../_utils/build-club-logos-page-help-content";

const TRIGGER_LABEL = "How this works";

export type ClubLogosPageHelpTriggerProps = {
  accountId: string;
  route: ClubLogosPageHelpRoute;
  variant?: "site-header";
};

export function ClubLogosPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: ClubLogosPageHelpTriggerProps) {
  const content = buildClubLogosPageHelpContent({ accountId, route });

  return (
    <PageHelpSheet
      content={content}
      trigger={
        <Button
          type="button"
          size={variant === "site-header" ? "sm" : "default"}
          variant={variant === "site-header" ? "brandPrimary" : "brandPrimaryOutline"}
        >
          <CircleHelp className="size-4" aria-hidden />
          {TRIGGER_LABEL}
        </Button>
      }
    />
  );
}
