#!/usr/bin/env node
// Runs vitest on changed test files, or falls back to full run if none are staged
const { execSync } = require("node:child_process");

function getStagedTests() {
  const out = execSync("git diff --name-only --cached", { encoding: "utf8" });
  return out
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((f) => /\.(test|spec)\.(ts|tsx)$/.test(f));
}

const tests = getStagedTests();
if (tests.length > 0) {
  const cmd = `vitest run ${tests.map((t) => `"${t}"`).join(" ")}`;
  execSync(cmd, { stdio: "inherit" });
} else {
  execSync("vitest run", { stdio: "inherit" });
}
