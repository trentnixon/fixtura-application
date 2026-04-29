import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonCompetitionDetail } from "../../_components/season-competition-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string }>;
}) {
  const { accountId } = await params;
  return buildPageMetadata({
    title: "Competition",
    description: `Season hub competition for account ${accountId}.`,
  });
}

export default async function SeasonCompetitionPage({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string }>;
}) {
  const { accountId, competitionId } = await params;

  return <SeasonCompetitionDetail accountId={accountId} competitionId={competitionId} />;
}
