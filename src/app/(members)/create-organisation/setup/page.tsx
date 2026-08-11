import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { CreateOrganisationSetupClient } from "./setup-client";

export const metadata = buildPageMetadata({
  title: "Organisation setup",
  description: "Preparing your organisation in Fixtura Members.",
});

export default function CreateOrganisationSetupPage() {
  return (
    <Suspense fallback={<BrandedLoader fullPage label="Loading…" />}>
      <CreateOrganisationSetupClient />
    </Suspense>
  );
}
