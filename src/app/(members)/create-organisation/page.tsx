import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { CreateOrganisationWizard } from "./_components/create-organisation-wizard";

export const metadata = buildPageMetadata({
  title: "Create organisation",
  description: "Set up your organisation in Fixtura Members.",
});

/**
 * Onboarding wizard shell (Phase 0): Get Started + stepper frames; no CMS writes yet.
 * Phases and API contracts: `.docs/PhasedIntegrationPath.md`.
 */
export default function CreateOrganisationPage() {
  return (
    <Suspense fallback={<BrandedLoader fullPage label="Loading…" />}>
      <CreateOrganisationWizard />
    </Suspense>
  );
}
