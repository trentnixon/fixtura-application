#!/usr/bin/env node
/*
 Generates missing test files for staged TS/TSX components.
 - For each staged file matching *.tsx or *.ts under src/components, create a sibling *.test.tsx/ts if missing.
 - Skips index files and story files.
*/
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function getStagedFiles() {
  const output = execSync("git diff --name-only --cached", { encoding: "utf8" });
  return output.split(/\r?\n/).filter(Boolean);
}

function isComponentFile(filePath) {
  if (!filePath.startsWith("src/components/")) return false;
  if (/\.(test|spec)\.(ts|tsx)$/.test(filePath)) return false;
  if (/\.stories\.(ts|tsx)$/.test(filePath)) return false;
  if (/index\.(ts|tsx)$/.test(filePath)) return false;
  return /\.(ts|tsx)$/.test(filePath);
}

function testPathFor(sourcePath) {
  const ext = sourcePath.endsWith(".tsx") ? ".test.tsx" : ".test.ts";
  return sourcePath.replace(/\.(ts|tsx)$/i, ext);
}

function ensureTestFile(sourcePath) {
  const target = testPathFor(sourcePath);
  if (fs.existsSync(target)) return false;
  const componentName = path.basename(sourcePath).replace(/\.(ts|tsx)$/i, "");
  const importPath = `./${path.basename(sourcePath)}`;
  // Create a safe TODO-style test stub that won't fail pre-commit
  const template = `import { describe, it } from "vitest";
import { ${componentName} } from "${importPath}";

describe("${componentName}", () => {
	it.todo("add tests for ${componentName}");
});
`;

  fs.writeFileSync(target, template, { encoding: "utf8" });
  console.log(`Created test: ${target}`);
  return true;
}

function run() {
  const created = [];
  for (const file of getStagedFiles()) {
    if (isComponentFile(file)) {
      if (ensureTestFile(file)) created.push(file);
    }
  }
  if (created.length === 0) {
    console.log("No tests created");
  }
}

run();
