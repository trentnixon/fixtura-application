import type { ComponentType, FC } from "react";

/**
 * Dataset passed to template renders. Matches `FixturaDataset` in this repo; kept loose here so
 * the package build does not need to emit types for the full data graph.
 */
export type FixturaDataset = Record<string, unknown>;

export type FixturaTemplateSceneProps = {
  data: FixturaDataset;
};

export declare const FixturaTemplateScene: FC<FixturaTemplateSceneProps>;

export type FixturaTemplateComponent = ComponentType<{
  data: FixturaDataset;
}>;

export type ProductionCompositionFromData = {
  TemplateComponent: FixturaTemplateComponent;
  remoteCompositionId: string;
  durationInFrames: number;
};

export declare function getProductionCompositionFromData(
  data: FixturaDataset,
): ProductionCompositionFromData;
