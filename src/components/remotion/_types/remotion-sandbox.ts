export type RemotionSandboxTemplateId =
  | "Basic"
  | "Brickwork"
  | "Classic"
  | "CNSW"
  | "CNSWPrivate"
  | "Sixers"
  | "Thunder"
  | "TwoColumnClassic"
  | "Mudgeeraba"
  | "BroadcastPro";

export type RemotionSandboxCricketCompositionId =
  | "CricketLadder"
  | "CricketUpcoming"
  | "CricketTop5Batting"
  | "CricketTop5Bowling"
  | "CricketBattingPerformances"
  | "CricketBowlingPerformances"
  | "CricketResults"
  | "CricketRoster"
  | "CricketResultSingle"
  | "CricketTeamOfTheWeek";

export type UseRemotionSandboxPreviewDataArgs = {
  template?: string;
  compositionId?: string;
};

export type SandboxDatasetOverrides = {
  template: string;
};
