"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Building2, Grid2X2, List, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { BrandedLoader } from "@/components/ui/branded-loader";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { SectionBlock } from "@/components/ui/section";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BRANDING_CONTAINER_HEADER_CLASS_NAME,
  BrandingContainerHeaderTitle,
} from "@/features/branding/components/branding-container-header-title";
import {
  isAccountClubLogosDirectoryGatewayRedirect,
  useAccountClubLogosDirectory,
} from "@/lib/api/hooks/account/useAccountClubLogosDirectory";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { selectOrganisationUrlWithReason } from "@/lib/config/gateway-reasons";
import { cn } from "@/lib/utils";

import { CLUB_LOGOS_SCREEN_COPY } from "../_consts";

import type { AccountClubLogosDirectoryClub } from "@/types/api/account";

export type ClubLogoDirectoryPanelProps = {
  accountId: string;
};

type DirectoryViewMode = "grid" | "list";

function clubLogoSrc(club: AccountClubLogosDirectoryClub): string | null {
  const logoUrl = typeof club.logoUrl === "string" ? club.logoUrl.trim() : "";
  return logoUrl.length > 0 ? logoUrl : null;
}

function clubHasLogo(club: AccountClubLogosDirectoryClub): boolean {
  return clubLogoSrc(club) !== null;
}

function clubLogoActionLabel(club: AccountClubLogosDirectoryClub): string {
  return clubHasLogo(club)
    ? CLUB_LOGOS_SCREEN_COPY.directoryReplaceLogoAction
    : CLUB_LOGOS_SCREEN_COPY.directoryAddLogoAction;
}

function formatClubCount(count: number): string {
  return `${count} ${count === 1 ? "club" : "clubs"}`;
}

function ClubLogoStatusBadge({ club }: { club: AccountClubLogosDirectoryClub }) {
  const hasLogo = clubHasLogo(club);

  return (
    <Badge variant={hasLogo ? "secondary" : "outline"}>
      {hasLogo
        ? CLUB_LOGOS_SCREEN_COPY.directoryHasLogoLabel
        : CLUB_LOGOS_SCREEN_COPY.directoryNoLogoLabel}
    </Badge>
  );
}

function ClubLogoPreview({
  club,
  className,
  imageClassName,
}: {
  club: AccountClubLogosDirectoryClub;
  className?: string;
  imageClassName?: string;
}) {
  const src = clubLogoSrc(club);

  return (
    <div
      className={cn(
        "border-border bg-muted/40 flex shrink-0 items-center justify-center overflow-hidden rounded-lg border",
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={club.name}
          className={cn("max-h-full max-w-full object-contain", imageClassName)}
        />
      ) : (
        <span className="text-muted-foreground px-2 text-center text-[10px] font-medium uppercase">
          {CLUB_LOGOS_SCREEN_COPY.directoryNoLogoLabel}
        </span>
      )}
    </div>
  );
}

function ClubLogoGrid({
  accountId,
  clubs,
}: {
  accountId: string;
  clubs: AccountClubLogosDirectoryClub[];
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clubs.map((club) => (
        <li key={club.id} className="min-w-0">
          <Link
            href={accountScopedRoutes.clubLogo(accountId, club.id)}
            className="border-border bg-card text-card-foreground hover:border-primary/40 focus-visible:ring-ring block h-full rounded-lg border p-3 shadow-xs transition-all outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <ClubLogoPreview club={club} className="h-28 w-full bg-white" />
            <div className="mt-3 flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{club.name}</p>
                <div className="mt-2">
                  <ClubLogoStatusBadge club={club} />
                </div>
              </div>
            </div>
            <span
              className={cn(buttonVariants({ variant: "brandOutline", size: "sm" }), "mt-4 w-full")}
            >
              {clubLogoActionLabel(club)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ClubLogoList({
  accountId,
  clubs,
}: {
  accountId: string;
  clubs: AccountClubLogosDirectoryClub[];
}) {
  return (
    <ul className="border-border divide-border divide-y rounded-md border">
      {clubs.map((club) => (
        <li key={club.id}>
          <Link
            href={accountScopedRoutes.clubLogo(accountId, club.id)}
            className="hover:bg-muted/50 focus-visible:ring-ring flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <ClubLogoPreview club={club} className="size-14 bg-white" />
              <div className="min-w-0">
                <p className="truncate font-medium">{club.name}</p>
                <div className="mt-1">
                  <ClubLogoStatusBadge club={club} />
                </div>
              </div>
            </div>
            <span className={buttonVariants({ variant: "brandOutline", size: "sm" })}>
              {clubLogoActionLabel(club)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ClubLogoDirectoryPanel({ accountId }: ClubLogoDirectoryPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectingRef = useRef(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<DirectoryViewMode>("grid");
  const q = useAccountClubLogosDirectory(accountId);

  useEffect(() => {
    redirectingRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!q.isSuccess || !q.data || redirectingRef.current) return;
    if (!isAccountClubLogosDirectoryGatewayRedirect(q.data)) return;

    redirectingRef.current = true;
    void queryClient.removeQueries({ queryKey: queryKeys.account.clubLogosDirectory(accountId) });
    router.replace(selectOrganisationUrlWithReason(q.data.reason));
  }, [accountId, q.data, q.isSuccess, queryClient, router]);

  if (q.isPending) {
    return <BrandedLoader label={CLUB_LOGOS_SCREEN_COPY.directoryLoadingLabel} />;
  }

  if (q.isError) {
    return (
      <ErrorState
        title={CLUB_LOGOS_SCREEN_COPY.directoryErrorTitle}
        description={
          q.error instanceof Error && q.error.message
            ? q.error.message
            : CLUB_LOGOS_SCREEN_COPY.directoryErrorFallback
        }
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (!q.isSuccess || q.data === undefined) {
    return null;
  }

  if (isAccountClubLogosDirectoryGatewayRedirect(q.data)) {
    return (
      <div className="text-muted-foreground grid gap-2 text-center text-sm" role="status">
        <p>{CLUB_LOGOS_SCREEN_COPY.directoryRedirecting}</p>
      </div>
    );
  }

  const clubs = q.data.data.clubs;
  const logoCount = clubs.filter(clubHasLogo).length;
  const missingLogoCount = clubs.length - logoCount;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredClubs = clubs.filter((club) => {
    return normalizedSearch.length === 0 || club.name.toLowerCase().includes(normalizedSearch);
  });

  if (clubs.length === 0) {
    return (
      <MetricComparisonCard
        className="ring-border w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
        layout="card"
        headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
        titleRowClassName="items-start"
        title={
          <BrandingContainerHeaderTitle
            icon={<Building2 className="size-5" aria-hidden />}
            title="Club directory"
            description="Review the clubs in your association and manage each club logo."
          />
        }
        body={
          <p className="text-muted-foreground text-sm" role="status">
            {CLUB_LOGOS_SCREEN_COPY.directoryEmpty}
          </p>
        }
      />
    );
  }

  const statsLine = `${formatClubCount(clubs.length)} / ${logoCount} with logos / ${missingLogoCount} missing`;

  return (
    <MetricComparisonCard
      className="ring-border w-full min-w-0 rounded-2xl border-none shadow-xl ring-1"
      layout="card"
      headerClassName={BRANDING_CONTAINER_HEADER_CLASS_NAME}
      titleRowClassName="items-start"
      title={
        <BrandingContainerHeaderTitle
          icon={<Building2 className="size-5" aria-hidden />}
          title="Club directory"
          description="Review the clubs in your association and manage each club logo."
        />
      }
      body={
        <div className="grid gap-4">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={CLUB_LOGOS_SCREEN_COPY.directorySearchPlaceholder}
              aria-label={CLUB_LOGOS_SCREEN_COPY.directorySearchPlaceholder}
              className="pl-9"
            />
          </div>

          <SectionBlock variant="inset" className="bg-muted/40 text-foreground" spacing="none">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
              <TypographyMuted className="text-xs">{statsLine}</TypographyMuted>

              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value === "grid" || value === "list") setViewMode(value);
                }}
                variant="outline"
                size="sm"
                className="shrink-0"
                aria-label="Club logo directory view"
              >
                <ToggleGroupItem
                  value="grid"
                  aria-label={CLUB_LOGOS_SCREEN_COPY.directoryGridViewLabel}
                >
                  <Grid2X2 className="size-4" aria-hidden />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label={CLUB_LOGOS_SCREEN_COPY.directoryListViewLabel}
                >
                  <List className="size-4" aria-hidden />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </SectionBlock>

          {filteredClubs.length === 0 ? (
            <p className="text-muted-foreground text-sm" role="status">
              {CLUB_LOGOS_SCREEN_COPY.directoryNoFilteredResults}
            </p>
          ) : viewMode === "grid" ? (
            <ClubLogoGrid accountId={accountId} clubs={filteredClubs} />
          ) : (
            <ClubLogoList accountId={accountId} clubs={filteredClubs} />
          )}
        </div>
      }
    />
  );
}
