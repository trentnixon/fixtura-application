import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";

import { loadCricketHistoricalDemoManifest } from "../src/features/remotion-asset-preview/cricket-demo-manifest";
import { buildSanitisedLadderDataset } from "../src/features/remotion-asset-preview/cricket-demo-manifest/generate-ladder-dataset";

const cwd = process.cwd();
const ladderPath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_Ladder.json");
const existing = JSON.parse(readFileSync(ladderPath, "utf8")) as {
  videoMeta: Record<string, unknown>;
};

const manifest = loadCricketHistoricalDemoManifest(cwd);
const dataset = buildSanitisedLadderDataset({
  manifest,
  existingVideoMeta: existing.videoMeta,
});

writeFileSync(ladderPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${ladderPath} with ${dataset.data.length} blocks and ${dataset.frames.length} frames`,
);
