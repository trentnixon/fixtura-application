import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonOverview } from "./_components/season-overview";

export const metadata = buildPageMetadata({
  title: "Season",
  description: "Explore competitions, grades, and fixtures for your organisation.",
});

export default async function SeasonPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return <SeasonOverview accountId={accountId} />;
}
