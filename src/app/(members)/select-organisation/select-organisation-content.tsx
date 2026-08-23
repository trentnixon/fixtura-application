"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, List, RefreshCw, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { InlineAlert } from "@/components/auth/actions";
import { AccountLoadErrorFeedback } from "@/components/select-organisation/account-load-error-feedback";
import {
  TypographyBodySmall,
  TypographyCaption,
  TypographyPageTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { accountPickerRowsFromMePayload } from "@/lib/account/account-me-rows";
import {
  lastSelectedOrganisationValidForAccounts,
  readLastSelectedOrganisationRecord,
  writeLastSelectedOrganisationRecord,
} from "@/lib/account/last-selected-organisation";
import {
  buildSelectOrgSummaryStats,
  filterSelectOrgRowsBySearch,
  formatSelectOrgSummaryLine,
  sortSelectOrgRows,
} from "@/lib/account/select-organisation-workspace";
import { captureUserAction } from "@/lib/analytics";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import { parseOnboardingStatePayload } from "@/lib/api/parse-onboarding-state";
import { queryKeys } from "@/lib/api/query/query-keys";
import { accountApi } from "@/lib/api/services/account.api";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import {
  SELECT_ORG_REASON_QUERY,
  parseSelectOrgGatewayReason,
  selectOrgReasonMessage,
} from "@/lib/config/gateway-reasons";
import { ROUTES } from "@/lib/config/routes";
import {
  SELECT_ORG_SIM_QUERY,
  parseSelectOrgSim,
  syntheticAccountMeResponseForSim,
} from "@/lib/dev/select-organisation-sim";
import { isSelectOrgSimulatorEnabled } from "@/lib/dev-sandbox";
import {
  accountEntryFromOnboardingState,
  resolveAccountEntry,
} from "@/lib/onboarding/resolve-account-entry";
import { cn } from "@/lib/utils";

import { CreateOrganisationCard } from "./_components/create-organisation-card";
import { SelectOrgGridItem, SelectOrgListItem } from "./_components/select-org-collection-items";
import { SelectOrgDetailsDialog } from "./_components/select-org-details-dialog";
import { SelectOrgHelpDialog } from "./_components/select-org-help-dialog";
import { SelectOrgLoadingSkeleton } from "./_components/select-org-loading-skeleton";
import { SelectOrgMissingHelp } from "./_components/select-org-missing-help";
import { SelectOrgResumePanel } from "./_components/select-org-resume-panel";
import {
  defaultSelectOrgViewMode,
  useSelectOrgPreferences,
} from "./_hooks/use-select-org-preferences";
import { buildSelectOrgItemViewModel } from "./_utils/build-select-org-item-view-model";

import type { SelectOrganisationDisplayState } from "./_utils/select-org-display-state";
import type { SelectOrganisationItemViewModel } from "./_utils/select-org-display-state";
import type { LastSelectedOrganisationRecord } from "@/lib/account/last-selected-organisation";
import type { SelectOrgSortMode } from "@/lib/account/select-organisation-workspace";
import type { OnboardingStateData } from "@/types/api/account";

const ONBOARDING_STATE_STALE_MS = 30_000;
const SELECTION_ERROR_MESSAGE =
  "We could not open this organisation. Try again or contact support if the problem continues.";

function lastOpenedAtFromRecord(record: LastSelectedOrganisationRecord): string | undefined {
  return "openedAt" in record ? record.openedAt : undefined;
}

export function SelectOrganisationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [detailsItem, setDetailsItem] = useState<SelectOrganisationItemViewModel | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [resumePanelDismissed, setResumePanelDismissed] = useState(false);

  const orgSim = isSelectOrgSimulatorEnabled
    ? parseSelectOrgSim(searchParams.get(SELECT_ORG_SIM_QUERY))
    : null;
  const simulating = orgSim !== null;
  const gatewayReason = parseSelectOrgGatewayReason(searchParams.get(SELECT_ORG_REASON_QUERY));

  const { data, isPending, isError, refetch } = useAccountMe({
    enabled: !simulating,
  });

  const payload =
    orgSim === "none" || orgSim === "one" || orgSim === "multiple"
      ? syntheticAccountMeResponseForSim(orgSim).data
      : data?.data;

  const rows = accountPickerRowsFromMePayload(payload);
  const accountIds = rows.map((r) => String(r.id));
  const userId = payload?.user?.id;

  const { sortMode, setSortMode, setViewMode, storedViewMode, hydrated } =
    useSelectOrgPreferences(userId);

  const onboardingStateQueries = useQueries({
    queries: accountIds.map((id) => ({
      queryKey: queryKeys.account.onboardingState(id),
      queryFn: async (): Promise<OnboardingStateData> => {
        const raw = await accountApi.getOnboardingOnboardingState(id);
        const parsed = parseOnboardingStatePayload(raw);
        if (!parsed) {
          throw new Error("Onboarding state response could not be parsed.");
        }
        return parsed;
      },
      enabled: !simulating && accountIds.length > 0,
      staleTime: ONBOARDING_STATE_STALE_MS,
    })),
  });

  const onboardingStateByAccountId = useMemo(
    () =>
      new Map(
        accountIds.map((id, index) => {
          const query = onboardingStateQueries[index];
          return [id, query?.data];
        }),
      ),
    [accountIds, onboardingStateQueries],
  );

  const lifecycleQueryStatusByAccountId = useMemo(
    () =>
      new Map(
        accountIds.map((id, index) => {
          const query = onboardingStateQueries[index];
          if (simulating) return [id, "success" as const];
          if (!query || query.isPending) return [id, "pending" as const];
          if (query.isError) return [id, "error" as const];
          return [id, "success" as const];
        }),
      ),
    [accountIds, onboardingStateQueries, simulating],
  );

  const lastUsedRecord = useMemo(() => {
    if (simulating || userId == null) return null;
    return lastSelectedOrganisationValidForAccounts(
      readLastSelectedOrganisationRecord(userId),
      accountIds,
    );
  }, [accountIds, simulating, userId]);

  useEffect(() => {
    setResumePanelDismissed(false);
  }, [lastUsedRecord?.accountId]);

  const reasonParam = searchParams.get(SELECT_ORG_REASON_QUERY);
  const parsedReason = parseSelectOrgGatewayReason(reasonParam);

  const workspaceCtx = useMemo(
    () => ({
      simulating,
      onboardingStateByAccountId,
    }),
    [onboardingStateByAccountId, simulating],
  );

  const isEmpty = rows.length === 0;
  const showOrgFilter = rows.length > 5;
  const orgFilterQuery = orgFilter.trim();
  const orgFilterActive = showOrgFilter && orgFilterQuery.length >= 1;

  const searchFilteredRows = showOrgFilter ? filterSelectOrgRowsBySearch(rows, orgFilter) : rows;
  const sortedRows = showOrgFilter
    ? sortSelectOrgRows(searchFilteredRows, sortMode, workspaceCtx)
    : sortSelectOrgRows(rows, sortMode, workspaceCtx);
  const filterActiveWithNoMatches = orgFilterActive && searchFilteredRows.length === 0;

  const viewMode = hydrated
    ? defaultSelectOrgViewMode(rows.length, storedViewMode, isMobile)
    : isMobile
      ? "list"
      : "grid";

  const itemViewModels = useMemo(
    () =>
      sortedRows.map((row) => {
        const id = String(row.id);
        const lifecycleStatus = lifecycleQueryStatusByAccountId.get(id) ?? "pending";
        const onboardingState = onboardingStateByAccountId.get(id);
        const lastOpenedAt =
          lastUsedRecord?.accountId === id && lastUsedRecord
            ? lastOpenedAtFromRecord(lastUsedRecord)
            : undefined;
        return buildSelectOrgItemViewModel({
          row,
          lifecycleQueryStatus: lifecycleStatus,
          simulating,
          isLastUsed: lastUsedRecord?.accountId === id,
          ...(onboardingState ? { onboardingState } : {}),
          ...(lastOpenedAt ? { lastOpenedAt } : {}),
        });
      }),
    [
      lastUsedRecord,
      lifecycleQueryStatusByAccountId,
      onboardingStateByAccountId,
      simulating,
      sortedRows,
    ],
  );

  const resumeItem = useMemo(() => {
    if (!lastUsedRecord) return undefined;
    const row = rows.find((r) => String(r.id) === lastUsedRecord.accountId);
    if (!row) return undefined;
    const id = lastUsedRecord.accountId;
    const onboardingState = onboardingStateByAccountId.get(id);
    const lastOpenedAt = lastOpenedAtFromRecord(lastUsedRecord);
    return buildSelectOrgItemViewModel({
      row,
      lifecycleQueryStatus: lifecycleQueryStatusByAccountId.get(id) ?? "pending",
      simulating,
      isLastUsed: true,
      ...(onboardingState ? { onboardingState } : {}),
      ...(lastOpenedAt ? { lastOpenedAt } : {}),
    });
  }, [
    lastUsedRecord,
    lifecycleQueryStatusByAccountId,
    onboardingStateByAccountId,
    rows,
    simulating,
  ]);

  const summaryStats = !isEmpty ? buildSelectOrgSummaryStats(rows, workspaceCtx) : null;

  function removeOrgSimFromUrl() {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(SELECT_ORG_SIM_QUERY);
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  }

  function persistLastSelectedOrganisation(accountId: string) {
    if (simulating || userId == null) return;
    writeLastSelectedOrganisationRecord(userId, accountId);
  }

  const openDetails = useCallback((item: SelectOrganisationItemViewModel) => {
    setDetailsItem(item);
    setDetailsOpen(true);
  }, []);

  async function handleSelectOrganisation(
    accountId: string,
    context?: { itemName?: string; displayState?: SelectOrganisationDisplayState },
  ) {
    if (pendingAccountId !== null) return;
    setSelectionError(null);
    if (context?.itemName) {
      setLiveMessage(`Opening ${context.itemName}`);
    }
    if (simulating) {
      router.push(accountScopedRoutes.dashboard(accountId));
      return;
    }
    setPendingAccountId(accountId);
    try {
      const onboardingData = await queryClient.fetchQuery<OnboardingStateData>({
        queryKey: queryKeys.account.onboardingState(accountId),
        queryFn: async () => {
          const raw = await accountApi.getOnboardingOnboardingState(accountId);
          const parsed = parseOnboardingStatePayload(raw);
          if (!parsed) {
            throw new Error("Onboarding state response could not be parsed.");
          }
          return parsed;
        },
      });
      const entryRoute = resolveAccountEntry(onboardingData);
      captureUserAction("organisation_selected", {
        accountId,
        entry_route: entryRoute,
        ...(context?.displayState ? { display_state: context.displayState } : {}),
        ...(gatewayReason ? { gateway_reason: gatewayReason } : {}),
      });
      persistLastSelectedOrganisation(accountId);
      router.push(accountEntryFromOnboardingState(onboardingData, accountId));
    } catch {
      captureUserAction("organisation_selection_failed", { accountId });
      setSelectionError(SELECTION_ERROR_MESSAGE);
    } finally {
      setPendingAccountId(null);
    }
  }

  function handlePrimaryAction(item: SelectOrganisationItemViewModel) {
    if (item.displayState === "needs-attention") {
      openDetails(item);
      return;
    }
    void handleSelectOrganisation(item.accountId, {
      itemName: item.name,
      displayState: item.displayState,
    });
  }

  async function handleRefresh() {
    if (simulating || refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
      await Promise.all(
        accountIds.map((id) =>
          queryClient.invalidateQueries({ queryKey: queryKeys.account.onboardingState(id) }),
        ),
      );
    } finally {
      setRefreshing(false);
    }
  }

  function retryLifecycleStatus(accountId: string) {
    void queryClient.invalidateQueries({ queryKey: queryKeys.account.onboardingState(accountId) });
  }

  if (orgSim === "loading") {
    return <SelectOrgLoadingSkeleton showControls={false} showResume={false} />;
  }

  if (!simulating && isPending) {
    return <SelectOrgLoadingSkeleton />;
  }

  if (orgSim === "error") {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 py-8">
        <AccountLoadErrorFeedback onRetry={removeOrgSimFromUrl} />
      </div>
    );
  }

  if (!simulating && isError) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 py-8">
        <AccountLoadErrorFeedback onRetry={() => void refetch()} />
      </div>
    );
  }

  const busy = pendingAccountId !== null;

  return (
    <TooltipProvider>
      <div className="grid w-full max-w-7xl gap-6 py-4 2xl:max-w-[90rem]">
        <div className="flex flex-col gap-3 min-[769px]:flex-row min-[769px]:items-start min-[769px]:justify-between">
          <div className="min-w-0 flex-1">
            <TypographyPageTitle
              as="h1"
              className="font-brand text-xl leading-tight font-semibold min-[769px]:text-2xl sm:text-xl"
            >
              {isEmpty ? "Set up an organisation" : "Select organisation"}
            </TypographyPageTitle>
            <TypographyBodySmall as="p" tone="muted" className="mt-1 max-w-xl text-sm">
              {isEmpty
                ? "Create one below."
                : "Choose a workspace to continue. You can switch later."}
            </TypographyBodySmall>
          </div>
          <SelectOrgHelpDialog />
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveMessage}
        </div>

        {parsedReason ? (
          <div className="grid gap-2">
            <InlineAlert message={selectOrgReasonMessage(parsedReason)} variant="warning" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => router.replace(ROUTES.selectOrganisation)}
            >
              Dismiss
            </Button>
          </div>
        ) : null}

        {selectionError ? <InlineAlert message={selectionError} variant="destructive" /> : null}

        {isEmpty ? (
          <CreateOrganisationCard variant="empty" />
        ) : (
          <>
            {showOrgFilter && resumeItem && !resumePanelDismissed ? (
              <SelectOrgResumePanel
                item={resumeItem}
                busy={busy}
                pending={pendingAccountId === resumeItem.accountId}
                onPrimaryAction={() => handlePrimaryAction(resumeItem)}
                onViewDetails={() => openDetails(resumeItem)}
                onDismiss={() => setResumePanelDismissed(true)}
              />
            ) : null}

            <div className="grid gap-3">
              {showOrgFilter ? (
                <div className="relative w-full">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    value={orgFilter}
                    onChange={(e) => setOrgFilter(e.target.value)}
                    placeholder="Search organisations…"
                    aria-label="Search organisations"
                    className="w-full pl-9 max-[425px]:h-10"
                  />
                </div>
              ) : null}

              {/* ≤425: compact toolbar */}
              <div className="hidden gap-2 max-[425px]:grid">
                {summaryStats ? (
                  <TypographyCaption as="p" tone="muted" className="truncate">
                    {formatSelectOrgSummaryLine(summaryStats)}
                  </TypographyCaption>
                ) : null}
                <div className="flex items-center gap-2">
                  {showOrgFilter ? (
                    <Select
                      value={sortMode}
                      onValueChange={(value) => setSortMode(value as SelectOrgSortMode)}
                    >
                      <SelectTrigger className="h-9 min-w-0 flex-1" aria-label="Sort organisations">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                        <SelectItem value="newest-first">Newest first</SelectItem>
                        <SelectItem value="setup-first">Setup first</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0"
                    disabled={refreshing || simulating}
                    aria-label={refreshing ? "Refreshing organisations" : "Refresh organisations"}
                    onClick={() => void handleRefresh()}
                  >
                    <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
                  </Button>
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value === "grid" || value === "list") setViewMode(value);
                    }}
                    className="shrink-0"
                    aria-label="View mode"
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view" className="size-9 p-0">
                      <LayoutGrid className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view" className="size-9 p-0">
                      <List className="size-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                {orgFilterActive ? (
                  <div className="flex items-center justify-between gap-2">
                    <TypographyBodySmall
                      as="span"
                      tone="muted"
                      className="min-w-0 truncate text-xs"
                    >
                      Showing {displayRowsCount(sortedRows.length)} of {rows.length}
                    </TypographyBodySmall>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="shrink-0"
                      onClick={() => setOrgFilter("")}
                    >
                      <X className="size-3.5" aria-hidden />
                      Clear
                    </Button>
                  </div>
                ) : null}
              </div>

              {/* ≥426: standard controls */}
              <div className="hidden min-[426px]:flex min-[426px]:flex-col min-[426px]:gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
                  {showOrgFilter ? (
                    <Select
                      value={sortMode}
                      onValueChange={(value) => setSortMode(value as SelectOrgSortMode)}
                    >
                      <SelectTrigger className="w-full sm:w-48" aria-label="Sort organisations">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                        <SelectItem value="newest-first">Newest first</SelectItem>
                        <SelectItem value="setup-first">Setup first</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : null}
                  {summaryStats ? (
                    <TypographyCaption as="span" tone="muted" className="shrink-0">
                      {formatSelectOrgSummaryLine(summaryStats)}
                    </TypographyCaption>
                  ) : null}
                  {orgFilterActive ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <TypographyBodySmall as="span" tone="muted">
                        Showing {displayRowsCount(sortedRows.length)} of {rows.length} organisations
                      </TypographyBodySmall>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setOrgFilter("")}
                      >
                        <X className="size-4" aria-hidden />
                        Clear
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={refreshing || simulating}
                    onClick={() => void handleRefresh()}
                  >
                    <RefreshCw className={cn("mr-1.5 size-4", refreshing && "animate-spin")} />
                    Refresh
                  </Button>
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value === "grid" || value === "list") setViewMode(value);
                    }}
                    aria-label="View mode"
                  >
                    <ToggleGroupItem value="grid" aria-label="Grid view">
                      <LayoutGrid className="size-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="list" aria-label="List view">
                      <List className="size-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
            </div>

            {filterActiveWithNoMatches ? (
              <TypographyBodySmall as="p" tone="muted">
                No organisations match &ldquo;{orgFilterQuery}&rdquo;.
              </TypographyBodySmall>
            ) : null}

            <Separator />

            <div className="py-12">
              {viewMode === "grid" ? (
                <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6">
                  {itemViewModels.map((item) => (
                    <SelectOrgGridItem
                      key={item.accountId}
                      item={item}
                      busy={busy}
                      pending={pendingAccountId === item.accountId}
                      onPrimaryAction={() => handlePrimaryAction(item)}
                      onStatusInfo={() => openDetails(item)}
                    />
                  ))}
                  <CreateOrganisationCard variant="grid" />
                </div>
              ) : (
                <div className="grid gap-3">
                  {itemViewModels.map((item) => (
                    <SelectOrgListItem
                      key={item.accountId}
                      item={item}
                      busy={busy}
                      pending={pendingAccountId === item.accountId}
                      showLastOpened={Boolean(lastUsedRecord)}
                      onPrimaryAction={() => handlePrimaryAction(item)}
                      onStatusInfo={() => openDetails(item)}
                    />
                  ))}
                  <CreateOrganisationCard variant="list" />
                </div>
              )}
            </div>

            <Separator />

            <SelectOrgMissingHelp onRefresh={() => void handleRefresh()} refreshing={refreshing} />
          </>
        )}

        <SelectOrgDetailsDialog
          item={detailsItem}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          primaryPending={detailsItem ? pendingAccountId === detailsItem.accountId : false}
          onPrimaryAction={() => {
            if (!detailsItem) return;
            if (detailsItem.displayState === "needs-attention") {
              void handleSelectOrganisation(detailsItem.accountId, {
                itemName: detailsItem.name,
                displayState: detailsItem.displayState,
              });
              return;
            }
            handlePrimaryAction(detailsItem);
          }}
          {...(detailsItem
            ? { onRetryStatus: () => retryLifecycleStatus(detailsItem.accountId) }
            : {})}
        />
      </div>
    </TooltipProvider>
  );
}

function displayRowsCount(count: number): number {
  return count;
}
