"use client";

import { CircleAlert, CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import {
  buildMediaGalleryPageHelpContent,
  type MediaGalleryPageHelpRoute,
} from "../_utils/build-media-gallery-page-help-content";

const TRIGGER_LABEL = "How this works";

export type MediaGalleryPageHelpTriggerProps = {
  accountId: string;
  route: MediaGalleryPageHelpRoute;
  variant?: "empty-state" | "site-header";
};

export function MediaGalleryPageHelpTrigger({
  accountId,
  route,
  variant = "site-header",
}: MediaGalleryPageHelpTriggerProps) {
  const content = buildMediaGalleryPageHelpContent({ accountId, route });
  const Icon = variant === "empty-state" ? CircleAlert : CircleHelp;

  return (
    <PageHelpSheet
      content={content}
      trigger={
        <Button
          type="button"
          size={variant === "site-header" ? "sm" : "default"}
          variant={variant === "site-header" ? "brandPrimary" : "brandPrimaryOutline"}
        >
          <Icon className="size-4" aria-hidden />
          {TRIGGER_LABEL}
        </Button>
      }
    />
  );
}
