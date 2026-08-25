"use client";

import { CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildBrandingPageHelpContent,
  type BrandingPageHelpRoute,
} from "../_utils/build-branding-page-help-content";

const TRIGGER_LABEL = "How this works";

export type BrandingPageHelpTriggerProps = {
  accountId: string;
  route: BrandingPageHelpRoute;
  variant?: "site-header";
};

export function BrandingPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: BrandingPageHelpTriggerProps) {
  const content = buildBrandingPageHelpContent({ accountId, route });

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
