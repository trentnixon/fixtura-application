import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";

import { SelectOrganisationContent } from "./select-organisation-content";

export default function SelectOrganisationPage() {
  return (
    <Suspense fallback={<BrandedLoader fullPage label="Loading your organisations" />}>
      <SelectOrganisationContent />
    </Suspense>
  );
}
