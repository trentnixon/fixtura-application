"use client";

import { CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildSortOrderPageHelpContent,
  type SortOrderPageHelpRoute,
} from "../_utils/build-sort-order-page-help-content";

const TRIGGER_LABEL = "How this works";

export type SortOrderPageHelpTriggerProps = {
  accountId: string;
  route: SortOrderPageHelpRoute;
  variant?: "site-header";
};

export function SortOrderPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: SortOrderPageHelpTriggerProps) {
  const content = buildSortOrderPageHelpContent({ accountId, route });

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
