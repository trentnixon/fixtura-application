"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getProductionCompositionFromData,
  type FixturaDataset,
} from "@/vendor/fixtura-remotion-assets/preview";

import { assembleAccountRemotionPreview } from "../utils/assemble-account-remotion-preview";
import { buildThumbnailFrameTargets } from "../utils/build-thumbnail-frame-targets";
import { getExampleDatasetPathForSport } from "../utils/example-dataset-loader";

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
  source,
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

  const assembled = useMemo(() => {
    if (baseData === null) return null;
    return assembleAccountRemotionPreview({
      base: baseData,
      source,
      logoUrl,
      templateModeSlug,
      templateCategoryCatalog,
      accountSponsors,
    });
  }, [accountSponsors, baseData, logoUrl, source, templateCategoryCatalog, templateModeSlug]);

  const durationInFrames =
    assembled !== null ? getProductionCompositionFromData(assembled.data).durationInFrames : 0;

  const frameBundle = useMemo(() => {
    if (assembled === null) {
      return { targets: [] as ThumbnailFrameTarget[], fromDataset: false };
    }
    const built = buildThumbnailFrameTargets(assembled.data, durationInFrames, maxFrameTargets);
    return { targets: built.targets, fromDataset: built.fromDataset };
  }, [assembled, durationInFrames, maxFrameTargets]);

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

    if (fetchStatus !== "success" || assembled === null) {
      return emptyState({ status: "idle", datasetPath });
    }

    const status: RemotionAssetPreviewStatus = "ready";
    return {
      status,
      data: assembled.data,
      durationInFrames,
      frameTargets: frameBundle.targets,
      fromDatasetFrames: frameBundle.fromDataset,
      loadError: null,
      usedTemplateFallback: assembled.usedTemplateFallback,
      datasetPath,
    };
  }, [
    assembled,
    datasetPath,
    durationInFrames,
    enabled,
    fetchStatus,
    frameBundle.fromDataset,
    frameBundle.targets,
    loadError,
  ]);
}
