"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useAssetsListForSelection } from "@/lib/api/hooks/account/useAssetsListForSelection";

import {
  ALL_SPORTS_KEY,
  DEFAULT_SPORT_FILTER_KEY,
  NO_SPORT_KEY,
  assetPickerSelectedIdKey,
} from "../_consts";
import {
  assetCategoryTypeLabel,
  groupAssetsBySport,
  isImageOptionsAsset,
  resolveSelectedAssetIdString,
  sortImageOptionsAssets,
} from "../_utils";
import { useAssetPickerSelection } from "./use-asset-picker-selection";

export type UseImageOptionsAssetsPickerOptions = {
  /** Required account scope for UI selection isolation (route id or `"sandbox"`). */
  accountId: string;
  /**
   * When set, assets are filtered to this API `Sport` string only (no "All sports").
   * Used when sport is implied by context (e.g. organisation).
   */
  lockSportFilterTo?: string | null;
};

export function useImageOptionsAssetsPicker(options: UseImageOptionsAssetsPickerOptions) {
  const { accountId } = options;
  const lockKey =
    options.lockSportFilterTo != null && options.lockSportFilterTo.trim() !== ""
      ? options.lockSportFilterTo.trim()
      : null;

  const queryClient = useQueryClient();
  const q = useAssetsListForSelection();
  const { selectedId, setSelectedId } = useAssetPickerSelection(accountId);
  const selectionKey = useMemo(() => assetPickerSelectedIdKey(accountId), [accountId]);

  const assets = useMemo(
    () => sortImageOptionsAssets((q.data?.data ?? []).filter(isImageOptionsAsset)),
    [q.data],
  );

  const sportFilterOptions = useMemo(() => {
    const groups = groupAssetsBySport(assets);
    return [
      { key: ALL_SPORTS_KEY, label: "All sports" },
      ...groups.map((g) => ({ key: g.key, label: g.label })),
    ];
  }, [assets]);

  const [sportFilter, setSportFilter] = useState<string>(DEFAULT_SPORT_FILTER_KEY);

  const effectiveSportFilter = lockKey ?? sportFilter;

  const filteredAssets = useMemo(() => {
    if (effectiveSportFilter === ALL_SPORTS_KEY) return assets;
    return assets.filter((a) => (a.Sport ?? NO_SPORT_KEY) === effectiveSportFilter);
  }, [assets, effectiveSportFilter]);

  const assetsBySportAll = useMemo(() => groupAssetsBySport(assets), [assets]);
  const assetsBySport = useMemo(() => groupAssetsBySport(filteredAssets), [filteredAssets]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedAssetIdString(filteredAssets, selectedId),
    [filteredAssets, selectedId],
  );

  const firstFiltered = filteredAssets[0];
  const selectValue =
    resolvedSelectedId ?? (firstFiltered !== undefined ? String(firstFiltered.id) : "");

  useEffect(() => {
    if (filteredAssets.length === 0) {
      setSelectedId(null);
      return;
    }
    const current = queryClient.getQueryData<string | null>(selectionKey) ?? null;
    if (current != null && current !== "" && filteredAssets.some((a) => String(a.id) === current)) {
      return;
    }
    const first = filteredAssets[0];
    setSelectedId(first !== undefined ? String(first.id) : null);
  }, [filteredAssets, queryClient, selectionKey, setSelectedId]);

  const selected = useMemo(
    () => filteredAssets.find((a) => String(a.id) === resolvedSelectedId) ?? null,
    [filteredAssets, resolvedSelectedId],
  );

  const showTypeBesideName = useMemo(() => {
    const labels = filteredAssets.map((a) => assetCategoryTypeLabel(a));
    const distinct = new Set(labels.filter((l): l is string => Boolean(l)));
    return distinct.size > 1 || labels.some((l) => l === null);
  }, [filteredAssets]);

  const rawAssetCount = q.data?.data?.length ?? 0;

  useEffect(() => {
    if (lockKey) return;
    if (sportFilter === ALL_SPORTS_KEY) return;
    if (assets.length === 0) return;
    const valid = new Set(sportFilterOptions.map((o) => o.key));
    if (!valid.has(sportFilter)) setSportFilter(ALL_SPORTS_KEY);
  }, [lockKey, sportFilter, sportFilterOptions, assets.length]);

  return {
    q,
    assets,
    sportFilterOptions,
    sportFilter,
    setSportFilter,
    /** When `lockKey` is set, filtering uses this value (read-only for UI). */
    effectiveSportFilter,
    isSportFilterLocked: lockKey !== null,
    filteredAssets,
    assetsBySportAll,
    assetsBySport,
    resolvedSelectedId,
    selectValue,
    selected,
    showTypeBesideName,
    rawAssetCount,
    setSelectedId,
  };
}

export type ImageOptionsAssetsPickerState = ReturnType<typeof useImageOptionsAssetsPicker>;
