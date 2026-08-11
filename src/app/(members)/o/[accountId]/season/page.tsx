import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonOverview } from "./_components/season-overview";

export const metadata = buildPageMetadata({
  title: "Fixtura Vision",
  description:
    "Your synced season in one place — browse competitions, grades, teams, and fixtures.",
});

export default async function SeasonPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;

  return <SeasonOverview accountId={accountId} />;
}
