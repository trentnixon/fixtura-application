"use client";

import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { useSeasonHubStats } from "@/lib/api/hooks/season-hub/useSeasonHubStats";

import { DashboardRouteListCard } from "./dashboard-route-list-card";
import { buildOrganisationRouteCards } from "../_utils/build-organisation-route-cards";

import type { DashboardViewModel } from "../dashboard-view-model";

type DashboardOrganisationRouteCardsProps = {
  accountId: string;
  model: Pick<DashboardViewModel, "branding">;
  brandingPending: boolean;
};

export function DashboardOrganisationRouteCards({
  accountId,
  model,
  brandingPending,
}: DashboardOrganisationRouteCardsProps) {
  const sponsorsQuery = useAccountSponsors(accountId);
  const seasonStatsQuery = useSeasonHubStats(accountId);

  const sponsorsData =
    sponsorsQuery.data && !isAccountSponsorsGatewayRedirect(sponsorsQuery.data)
      ? sponsorsQuery.data.data.items
      : null;

  const seasonSummary = seasonStatsQuery.data?.data.summary ?? null;

  const cards = buildOrganisationRouteCards({
    accountId,
    model,
    sponsors: sponsorsData,
    seasonSummary,
  });

  const pendingByCard = {
    Branding: brandingPending,
    Sponsors: sponsorsQuery.isPending,
    Vision: seasonStatsQuery.isPending,
  } as const;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.headerIcon;
        const isPending = pendingByCard[card.title as keyof typeof pendingByCard] ?? false;

        return (
          <DashboardRouteListCard
            key={card.href}
            title={card.title}
            description={card.description}
            href={card.href}
            ctaLabel={card.ctaLabel}
            items={card.items}
            isPending={isPending}
            headerIcon={<Icon className="text-primary size-5" stroke={1.5} aria-hidden />}
          />
        );
      })}
    </div>
  );
}
