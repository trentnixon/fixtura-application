import {
  isRemotionSandboxCricketCompositionId,
  REMOTION_SANDBOX_CRICKET_DATASET_PATHS,
} from "@/components/remotion/_constants/remotion-datasets";

import { isCricketSport } from "./sport";

/** v1: Cricket example ladder JSON only. */
export const CRICKET_DEFAULT_EXAMPLE_DATASET_PATH = "/dummyAssetData/Cricket/Cricket_Ladder.json";

/**
 * Returns a public URL to example Fixtura dataset JSON for preview, or null when unsupported.
 * When `sport` is cricket, `compositionId` may select a bundled sandbox JSON (Image Options
 * `CompositionID`); unknown ids fall back to the ladder example.
 */
export function getExampleDatasetPathForSport(
  sport: string | null,
  compositionId?: string | null,
): string | null {
  if (!isCricketSport(sport)) {
    return null;
  }
  if (compositionId != null && isRemotionSandboxCricketCompositionId(compositionId)) {
    return REMOTION_SANDBOX_CRICKET_DATASET_PATHS[compositionId];
  }
  return CRICKET_DEFAULT_EXAMPLE_DATASET_PATH;
}
