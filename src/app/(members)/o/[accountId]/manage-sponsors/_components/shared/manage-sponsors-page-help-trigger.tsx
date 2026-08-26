"use client";

import { CircleAlert, CircleHelp } from "lucide-react";

import { PageHelpSheet } from "@/components/page-help";
import { Button } from "@/components/ui/button";

import { useSponsorAssignmentTargetCopy } from "../../_hooks/use-sponsor-assignment-target-copy";
import {
  buildManageSponsorsPageHelpContent,
  type ManageSponsorsPageHelpRoute,
} from "../../_utils/build-manage-sponsors-page-help-content";
import {
  FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY,
  type SponsorAssignmentTargetCopy,
} from "../../_utils/sponsor-assignment-target-copy";

const TRIGGER_LABEL = "How this works";

const ROUTES_NEEDING_TARGET_COPY = new Set<ManageSponsorsPageHelpRoute>([
  "pool",
  "assign-position",
  "assign-entity",
]);

export type ManageSponsorsPageHelpTriggerProps = {
  accountId: string;
  route: ManageSponsorsPageHelpRoute;
  variant?: "header" | "empty-state" | "site-header";
};

export function ManageSponsorsPageHelpTrigger(props: ManageSponsorsPageHelpTriggerProps) {
  if (ROUTES_NEEDING_TARGET_COPY.has(props.route)) {
    return <ManageSponsorsPageHelpTriggerWithTargetCopy {...props} />;
  }
  return (
    <ManageSponsorsPageHelpSheet {...props} targetCopy={FALLBACK_SPONSOR_ASSIGNMENT_TARGET_COPY} />
  );
}

function ManageSponsorsPageHelpTriggerWithTargetCopy(props: ManageSponsorsPageHelpTriggerProps) {
  const targetCopy = useSponsorAssignmentTargetCopy(props.accountId);
  return <ManageSponsorsPageHelpSheet {...props} targetCopy={targetCopy} />;
}

function ManageSponsorsPageHelpSheet({
  accountId,
  route,
  variant = "header",
  targetCopy,
}: ManageSponsorsPageHelpTriggerProps & { targetCopy: SponsorAssignmentTargetCopy }) {
  const content = buildManageSponsorsPageHelpContent({ accountId, route, targetCopy });
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
