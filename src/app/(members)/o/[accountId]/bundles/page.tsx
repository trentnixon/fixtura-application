import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { BundlesScreen } from "./_components/bundles-screen";

export const metadata = buildPageMetadata({
  title: "Bundles",
  description:
    "View your render history and links to delivered asset bundles for your Fixtura organisation.",
});

export default async function BundlesPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return <BundlesScreen accountId={accountId} />;
}
