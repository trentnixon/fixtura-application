import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SelectOrganisationContent } from "./select-organisation-content";

export const metadata = buildPageMetadata({
  title: "Organisations",
  description: "Choose an organisation to open in Fixtura Members.",
});

export default function SelectOrganisationPage() {
  return (
    <Suspense fallback={<BrandedLoader fullPage label="Loading your organisations" />}>
      <SelectOrganisationContent />
    </Suspense>
  );
}
