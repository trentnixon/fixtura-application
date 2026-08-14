"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getProductionCompositionFromData,
  type FixturaDataset,
} from "@/vendor/fixtura-remotion-assets/preview";

import { buildThumbnailFrameTargets } from "../utils/build-thumbnail-frame-targets";
import { getExampleDatasetPathForSport } from "../utils/example-dataset-loader";
import { mergeAccountBrandingIntoDataset } from "../utils/merge-account-branding-into-dataset";

import type {
  RemotionAssetPreviewInput,
  RemotionAssetPreviewState,
  RemotionAssetPreviewStatus,
  ThumbnailFrameTarget,
} from "../types";

function emptyState(partial: Partial<RemotionAssetPreviewState>): RemotionAssetPreviewState {
  return {
    status: "idle",
    data: null,
    durationInFrames: 0,
    frameTargets: [],
    fromDatasetFrames: false,
    loadError: null,
    usedTemplateFallback: false,
    datasetPath: null,
    ...partial,
  };
}

export function useRemotionAssetPreview({
  sport,
  branding,
  logoUrl,
  templateModeSlug,
  templateCategoryCatalog = null,
  exampleCompositionId = null,
  accountSponsors = null,
  maxFrameTargets,
  enabled = true,
}: RemotionAssetPreviewInput): RemotionAssetPreviewState {
  const datasetPath = useMemo(
    () => getExampleDatasetPathForSport(sport, exampleCompositionId),
    [sport, exampleCompositionId],
  );

  const [baseData, setBaseData] = useState<FixturaDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "success" | "error" | "skipped"
  >("idle");

  useEffect(() => {
    if (!enabled) {
      setFetchStatus("skipped");
      setBaseData(null);
      setLoadError(null);
      return;
    }

    if (datasetPath === null) {
      setFetchStatus("skipped");
      setBaseData(null);
      setLoadError(null);
      return;
    }

    const controller = new globalThis.AbortController();
    setLoadError(null);
    setBaseData(null);
    setFetchStatus("loading");

    void fetch(datasetPath, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<FixturaDataset>;
      })
      .then((json) => {
        setBaseData(json);
        setFetchStatus("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Failed to load preview dataset: ${message}`);
        setFetchStatus("error");
      });

    return () => {
      controller.abort();
    };
  }, [datasetPath, enabled]);

  const mergeInput = useMemo(
    () => ({ branding, logoUrl, templateModeSlug, templateCategoryCatalog, accountSponsors }),
    [accountSponsors, branding, logoUrl, templateCategoryCatalog, templateModeSlug],
  );

  const merged = useMemo(() => {
    if (baseData === null) return null;
    return mergeAccountBrandingIntoDataset(baseData, mergeInput);
  }, [baseData, mergeInput]);

  const durationInFrames =
    merged !== null ? getProductionCompositionFromData(merged.data).durationInFrames : 0;

  const frameBundle = useMemo(() => {
    if (merged === null) {
      return { targets: [] as ThumbnailFrameTarget[], fromDataset: false };
    }
    const built = buildThumbnailFrameTargets(merged.data, durationInFrames, maxFrameTargets);
    return { targets: built.targets, fromDataset: built.fromDataset };
  }, [merged, durationInFrames, maxFrameTargets]);

  return useMemo((): RemotionAssetPreviewState => {
    if (!enabled) {
      return emptyState({ status: "idle", datasetPath });
    }

    if (datasetPath === null) {
      return emptyState({ status: "unsupported-sport", datasetPath: null });
    }

    if (fetchStatus === "loading" || fetchStatus === "idle") {
      return emptyState({
        status: "loading",
        datasetPath,
      });
    }

    if (fetchStatus === "error") {
      return emptyState({
        status: "error",
        loadError,
        datasetPath,
      });
    }

    if (fetchStatus !== "success" || merged === null) {
      return emptyState({ status: "idle", datasetPath });
    }

    const status: RemotionAssetPreviewStatus = "ready";
    return {
      status,
      data: merged.data,
      durationInFrames,
      frameTargets: frameBundle.targets,
      fromDatasetFrames: frameBundle.fromDataset,
      loadError: null,
      usedTemplateFallback: merged.usedTemplateFallback,
      datasetPath,
    };
  }, [
    datasetPath,
    enabled,
    fetchStatus,
    frameBundle.fromDataset,
    frameBundle.targets,
    loadError,
    merged,
    durationInFrames,
  ]);
}
