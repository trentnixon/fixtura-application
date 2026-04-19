"use client";

import { useEffect, useMemo, useState } from "react";

import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "@/components/remotion/_constants/remotion-composition";
import { REMOTION_SANDBOX_CRICKET_DATASET_PATHS } from "@/components/remotion/_constants/remotion-datasets";
import { DEFAULT_REMOTION_SANDBOX_TEMPLATE } from "@/components/remotion/_constants/remotion-templates";
import { mergeSandboxDataset } from "@/components/remotion/_utils/merge-sandbox-dataset";
import {
  getProductionCompositionFromData,
  type FixturaDataset,
} from "@/vendor/fixtura-remotion-assets/preview";

import type {
  RemotionSandboxCricketCompositionId,
  UseRemotionSandboxPreviewDataArgs,
} from "@/components/remotion/_types/remotion-sandbox";

export function useRemotionSandboxPreviewData({
  template = DEFAULT_REMOTION_SANDBOX_TEMPLATE,
  compositionId = DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID,
}: UseRemotionSandboxPreviewDataArgs) {
  const [baseData, setBaseData] = useState<FixturaDataset | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new globalThis.AbortController();
    const datasetPath =
      REMOTION_SANDBOX_CRICKET_DATASET_PATHS[compositionId as RemotionSandboxCricketCompositionId];

    setLoadError(null);
    setBaseData(null);

    void fetch(datasetPath, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json() as Promise<FixturaDataset>;
      })
      .then((json) => {
        setBaseData(json);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : "Unknown error";
        setLoadError(`Failed to load preview dataset for ${compositionId}: ${message}`);
      });

    return () => {
      controller.abort();
    };
  }, [compositionId]);

  const data = useMemo(
    () =>
      baseData
        ? mergeSandboxDataset(baseData, {
            template,
          })
        : null,
    [baseData, template],
  );

  const durationInFrames =
    data !== null ? getProductionCompositionFromData(data).durationInFrames : 0;

  return { data, durationInFrames, loadError };
}
