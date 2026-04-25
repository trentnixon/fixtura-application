import Link from "next/link";

import { accountScopedRoutes } from "@/lib/config/account-routes";
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
        <Link
          href={`${accountScopedRoutes.season(accountId)}/competitions/${competitionId}/grades/${gradeId}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          Grade
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Fixture</span>
      </nav>
      <SeasonFixtureView
        accountId={accountId}
        competitionId={competitionId}
        gradeId={gradeId}
        fixtureId={fixtureId}
      />
    </div>
  );
}
