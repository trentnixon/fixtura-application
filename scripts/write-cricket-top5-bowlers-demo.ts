import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadCricketHistoricalDemoManifest } from "../src/features/remotion-asset-preview/cricket-demo-manifest";
import { buildSanitisedTop5BowlersDataset } from "../src/features/remotion-asset-preview/cricket-demo-manifest/generate-top5-bowlers-dataset";

const cwd = process.cwd();
const filePath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_Top5Bowlers.json");
const existing = JSON.parse(readFileSync(filePath, "utf8")) as {
  videoMeta: Record<string, unknown>;
};

const manifest = loadCricketHistoricalDemoManifest(cwd);
const dataset = buildSanitisedTop5BowlersDataset({
  manifest,
  existingVideoMeta: existing.videoMeta,
});

writeFileSync(filePath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${filePath} with ${dataset.data.length} bowlers and ${dataset.frames.length} frames`,
);
