import type { RemotionSandboxCricketCompositionId } from "../_types/remotion-sandbox";

export const REMOTION_SANDBOX_CRICKET_DATASET_PATHS: Record<
  RemotionSandboxCricketCompositionId,
  string
> = {
  CricketLadder: "/dummyAssetData/Cricket/Cricket_Ladder.json",
  CricketUpcoming: "/dummyAssetData/Cricket/Cricket_upcoming.json",
  CricketTop5Batting: "/dummyAssetData/Cricket/Cricket_Top5Batters.json",
  CricketTop5Bowling: "/dummyAssetData/Cricket/Cricket_Top5Bowlers.json",
  CricketBattingPerformances: "/dummyAssetData/Cricket/Cricket_BattingPerformances.json",
  CricketBowlingPerformances: "/dummyAssetData/Cricket/Cricket_BowlingPerformances.json",
  CricketResults: "/dummyAssetData/Cricket/Cricket_Results.json",
  CricketRoster: "/dummyAssetData/Cricket/Cricket_Roster.json",
  CricketResultSingle: "/dummyAssetData/Cricket/Cricket_WeekendResultsSingle.json",
  CricketTeamOfTheWeek: "/dummyAssetData/Cricket/Cricket_TeamOfTheWeek.json",
};

export function isRemotionSandboxCricketCompositionId(
  id: string | null | undefined,
): id is RemotionSandboxCricketCompositionId {
  return id != null && id in REMOTION_SANDBOX_CRICKET_DATASET_PATHS;
}
