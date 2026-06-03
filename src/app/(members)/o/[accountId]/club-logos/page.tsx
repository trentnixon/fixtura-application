import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { ClubLogosScreen } from "./_components/club-logos-screen";

export const metadata = buildPageMetadata({
  title: "Club logos",
  description: "Manage logos for clubs in your association.",
});

export default async function ClubLogosPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  return <ClubLogosScreen accountId={accountId} />;
}
