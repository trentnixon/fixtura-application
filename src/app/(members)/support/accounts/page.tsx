import { Suspense } from "react";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SupportAccountsContent } from "./support-accounts-content";
import { SupportAccountsGuard } from "./support-accounts-guard";

export const metadata = buildPageMetadata({
  title: "Support accounts",
  description: "Browse customer organisations in read-only support view.",
});

export default function SupportAccountsPage() {
  return (
    <SupportAccountsGuard>
      <Suspense fallback={<BrandedLoader fullPage label="Loading support accounts" />}>
        <SupportAccountsContent />
      </Suspense>
    </SupportAccountsGuard>
  );
}
