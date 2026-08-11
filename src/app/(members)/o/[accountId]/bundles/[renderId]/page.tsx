import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { BundlesRenderDetailScreen } from "../_components/bundles-render-detail-screen";

export const metadata = buildPageMetadata({
  title: "Bundle render",
  description: "View details and external links for a Fixtura asset render.",
});

export default async function BundlesRenderDetailPage({
  params,
}: {
  params: Promise<{ accountId: string; renderId: string }>;
}) {
  const { accountId, renderId } = await params;

  return <BundlesRenderDetailScreen accountId={accountId} renderId={renderId} />;
}
