import Link from "next/link";

import { accountScopedRoutes } from "@/lib/config/account-routes";
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

  return (
    <div className="grid gap-4">
      <nav className="text-muted-foreground text-sm">
        <Link
          href={accountScopedRoutes.season(accountId)}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Season
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`${accountScopedRoutes.season(accountId)}/competitions/${competitionId}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Competition
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Grade</span>
      </nav>
      <SeasonGradeView accountId={accountId} competitionId={competitionId} gradeId={gradeId} />
    </div>
  );
}
