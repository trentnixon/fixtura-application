import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadCricketHistoricalDemoManifest } from "../src/features/remotion-asset-preview/cricket-demo-manifest";
import { buildSanitisedTeamOfTheWeekDataset } from "../src/features/remotion-asset-preview/cricket-demo-manifest/generate-team-of-the-week-dataset";

const cwd = process.cwd();
const filePath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_TeamOfTheWeek.json");
const existing = JSON.parse(readFileSync(filePath, "utf8")) as {
  videoMeta: Record<string, unknown>;
};

const manifest = loadCricketHistoricalDemoManifest(cwd);
const dataset = buildSanitisedTeamOfTheWeekDataset({
  manifest,
  existingVideoMeta: existing.videoMeta,
});

writeFileSync(filePath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${filePath} with ${dataset.data.length} players and ${dataset.frames.length} frames`,
);
