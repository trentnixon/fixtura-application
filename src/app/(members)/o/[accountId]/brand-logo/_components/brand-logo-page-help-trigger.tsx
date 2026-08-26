"use client";

import { CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildBrandLogoPageHelpContent,
  type BrandLogoPageHelpRoute,
} from "../_utils/build-brand-logo-page-help-content";

const TRIGGER_LABEL = "How this works";

export type BrandLogoPageHelpTriggerProps = {
  accountId: string;
  route: BrandLogoPageHelpRoute;
  variant?: "site-header";
};

export function BrandLogoPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: BrandLogoPageHelpTriggerProps) {
  const content = buildBrandLogoPageHelpContent({ accountId, route });

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
