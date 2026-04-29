import { buildPageMetadata } from "@/lib/metadata/buildMetadata";

import { SeasonGradeView } from "../../../../_components/season-grade-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string; gradeId: string }>;
}) {
  const { accountId } = await params;
  return buildPageMetadata({
    title: "Grade",
    description: `Season hub grade for account ${accountId}.`,
  });
}

export default async function SeasonGradePage({
  params,
}: {
  params: Promise<{ accountId: string; competitionId: string; gradeId: string }>;
}) {
  const { accountId, competitionId, gradeId } = await params;

  return <SeasonGradeView accountId={accountId} competitionId={competitionId} gradeId={gradeId} />;
}
