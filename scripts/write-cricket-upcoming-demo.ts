import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadCricketHistoricalDemoManifest } from "../src/features/remotion-asset-preview/cricket-demo-manifest";
import { buildSanitisedUpcomingDataset } from "../src/features/remotion-asset-preview/cricket-demo-manifest/generate-upcoming-dataset";

const cwd = process.cwd();
const upcomingPath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_upcoming.json");
const existing = JSON.parse(readFileSync(upcomingPath, "utf8")) as {
  videoMeta: Record<string, unknown>;
};

const manifest = loadCricketHistoricalDemoManifest(cwd);
const dataset = buildSanitisedUpcomingDataset({
  manifest,
  existingVideoMeta: existing.videoMeta,
});

writeFileSync(upcomingPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${upcomingPath} with ${dataset.data.length} fixtures and ${dataset.frames.length} frames`,
);
