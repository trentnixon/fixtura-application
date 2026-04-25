import Link from "next/link";

import { accountScopedRoutes } from "@/lib/config/account-routes";
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
        <span className="text-foreground">Competition</span>
      </nav>
      <SeasonCompetitionDetail accountId={accountId} competitionId={competitionId} />
    </div>
  );
}
