import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { loadCricketHistoricalDemoManifest } from "../src/features/remotion-asset-preview/cricket-demo-manifest";
import { buildSanitisedResultsDataset } from "../src/features/remotion-asset-preview/cricket-demo-manifest/generate-results-dataset";

const cwd = process.cwd();
const filePath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_Results.json");
const existing = JSON.parse(readFileSync(filePath, "utf8")) as {
  videoMeta: Record<string, unknown>;
};

const manifest = loadCricketHistoricalDemoManifest(cwd);
const dataset = buildSanitisedResultsDataset({
  manifest,
  existingVideoMeta: existing.videoMeta,
});

writeFileSync(filePath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${filePath} with ${dataset.data.length} results and ${dataset.frames.length} frames`,
);
