"use client";

import { CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildTemplateBuilderPageHelpContent,
  type TemplateBuilderPageHelpRoute,
} from "../_utils/build-template-builder-page-help-content";

const TRIGGER_LABEL = "How this works";

export type TemplateBuilderPageHelpTriggerProps = {
  accountId: string;
  route: TemplateBuilderPageHelpRoute;
  variant?: "site-header";
};

export function TemplateBuilderPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: TemplateBuilderPageHelpTriggerProps) {
  const content = buildTemplateBuilderPageHelpContent({ accountId, route });

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
