import type { RemotionSandboxCricketCompositionId } from "../_types/remotion-sandbox";

export const REMOTION_SANDBOX_CRICKET_COMPOSITION_IDS = [
  "CricketLadder",
  "CricketUpcoming",
  "CricketTop5Batting",
  "CricketTop5Bowling",
  "CricketBattingPerformances",
  "CricketBowlingPerformances",
  "CricketResults",
  "CricketRoster",
  "CricketResultSingle",
  "CricketTeamOfTheWeek",
] as const satisfies readonly RemotionSandboxCricketCompositionId[];

export const DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID: RemotionSandboxCricketCompositionId =
  "CricketLadder";

export const REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME = 10;
