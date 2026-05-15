import { TypographyBodySmall } from "@/components/typography";

import { SPONSOR_LOGO_UPLOAD_CALLOUT_COPY } from "../../../_constants/sponsor-logo-upload";

export function SponsorLogoUploadFormatCallout() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <TypographyBodySmall className="text-amber-900">
        {SPONSOR_LOGO_UPLOAD_CALLOUT_COPY}
      </TypographyBodySmall>
    </div>
  );
}
