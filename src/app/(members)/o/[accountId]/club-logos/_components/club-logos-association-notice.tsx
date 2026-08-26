import { Info } from "lucide-react";

import { TypographyAlertDescription, TypographyAlertTitle } from "@/components/typography";

import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";

export function ClubLogosAssociationNotice() {
  return (
    <div
      className="border-primary/15 bg-primary/5 ring-primary/10 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ring-1"
      role="note"
    >
      <Info className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">
        <TypographyAlertTitle as="p">
          {CLUB_LOGOS_SCREEN_COPY.associationOnlyNoticeTitle}
        </TypographyAlertTitle>
        <TypographyAlertDescription tone="muted">
          {CLUB_LOGOS_SCREEN_COPY.associationOnlyNoticeDescription}
        </TypographyAlertDescription>
      </div>
    </div>
  );
}
