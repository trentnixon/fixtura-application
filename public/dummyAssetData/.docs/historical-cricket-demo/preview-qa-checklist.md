# Remotion cricket demo — preview QA checklist

Parent: Sanitise Remotion cricket example datasets  
Date: 2026-07-24

Automated gates (required before visual pass):

- [x] `npx vitest run src/features/remotion-asset-preview/cricket-demo-manifest`
- [x] Composition mapping / counts / frames / timings contracts
- [x] Privacy scan across 10 active JSON files
- [x] Local flag + `/dummyAssetData` path existence

Manual preview (template-builder Remotion path):

| Composition                | Dataset                           | Fetch OK | Duration OK | Frames in range | Visual spot-check |
| -------------------------- | --------------------------------- | -------- | ----------- | --------------- | ----------------- |
| CricketLadder              | Cricket_Ladder.json               | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketUpcoming            | Cricket_upcoming.json             | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketTop5Batting         | Cricket_Top5Batters.json          | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketTop5Bowling         | Cricket_Top5Bowlers.json          | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketBattingPerformances | Cricket_BattingPerformances.json  | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketBowlingPerformances | Cricket_BowlingPerformances.json  | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketResults             | Cricket_Results.json              | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketRoster              | Cricket_Roster.json               | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketResultSingle        | Cricket_WeekendResultsSingle.json | [ ]      | [ ]         | [ ]             | [ ]               |
| CricketTeamOfTheWeek       | Cricket_TeamOfTheWeek.json        | [ ]      | [ ]         | [ ]             | [ ]               |

Visual focus:

- Long nation/player/tournament names do not clip badly
- Flags readable on light/dark templates
- Ladder 4/6/8 team blocks render
- Roster shows 11 names with captain/keeper suffixes
- Scorecards / performance cards coherent
- No residual club logos or sponsors during animation
