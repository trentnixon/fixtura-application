/**
 * Display and default-selection order for Image Options assets in preview pickers.
 * Edit this list to reorder pickers (template builder, dashboard, data lab).
 * Matches CMS `CompositionID` on each asset row — unknown ids appear after listed ids.
 */
export const IMAGE_OPTIONS_ASSET_COMPOSITION_ORDER = [
  "CricketResults",
  "CricketResultSingle",
  "CricketLadder",
  "CricketUpcoming",
  "CricketTop5Batting",
  "CricketTop5Bowling",
  "CricketBattingPerformances",
  "CricketBowlingPerformances",
  "CricketRoster",
  "CricketTeamOfTheWeek",
] as const;
