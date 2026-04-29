import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonFixtureView } from "../../../../../../_components/season-fixture-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string; gradeId: string; fixtureId: string }>;
}) {
  const { accountId } = await params;
  return buildPageMetadata({
    title: "Fixture",
    description: `Season hub fixture for account ${accountId}.`,
  });
}

export default async function SeasonFixturePage({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string; gradeId: string; fixtureId: string }>;
}) {
  const { accountId, competitionId, gradeId, fixtureId } = await params;

  return (
    <SeasonFixtureView
      accountId={accountId}
      competitionId={competitionId}
      gradeId={gradeId}
      fixtureId={fixtureId}
    />
  );
}
