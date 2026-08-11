import { Badge } from "@/components/ui/badge";

import { changeKindLabel } from "../../_utils/sponsor-editor";

import type { SponsorLogoChangeKind } from "../../_types/sponsor-editor";

export function SponsorLogoReplacementBadge({
  logoChangeKind,
}: {
  logoChangeKind: SponsorLogoChangeKind;
}) {
  if (logoChangeKind !== "replacement") return null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Badge variant="outline">{changeKindLabel(logoChangeKind)}</Badge>
    </div>
  );
}
