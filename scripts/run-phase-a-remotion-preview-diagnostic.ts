#!/usr/bin/env npx tsx
/**
 * Phase A diagnostic runner — compare saved branding vs builder-equivalent draft assembly.
 *
 * Usage (fixture files):
 *   npx tsx scripts/run-phase-a-remotion-preview-diagnostic.ts \
 *     --branding .scratch/dashboard-template-preview-sync/fixtures/animated-thin-branding.json \
 *     --catalog .scratch/dashboard-template-preview-sync/fixtures/animated-catalog.json
 *
 * Usage (live Strapi — requires bearer token):
 *   FIXTURA_BEARER_TOKEN=... npx tsx scripts/run-phase-a-remotion-preview-diagnostic.ts --account-id 123
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { diagnoseAccountRemotionPreviewParity } from "../src/features/remotion-asset-preview/utils/diagnose-account-remotion-preview-parity";
import { resolveTemplateModeSlugFromBranding } from "../src/features/remotion-asset-preview/utils/resolve-template-mode-slug-from-branding";

import type { AccountBrandingData, AccountBrandingResponse } from "@/types/api/account";
import type {
  AllTemplateOptionsPayload,
  AllTemplateOptionsResponse,
  TemplateModeItem,
} from "@/types/api/all-template-options";
import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

const cwd = process.cwd();

type CliArgs = {
  branding?: string;
  catalog?: string;
  accountId?: string;
  out?: string;
  modes?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--branding") args.branding = argv[++i] ?? "";
    else if (token === "--catalog") args.catalog = argv[++i] ?? "";
    else if (token === "--account-id") args.accountId = argv[++i] ?? "";
    else if (token === "--out") args.out = argv[++i] ?? "";
    else if (token === "--modes") args.modes = argv[++i] ?? "";
  }
  return args;
}

function readJsonFile<T>(filePath: string): T {
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  return JSON.parse(readFileSync(absolute, "utf8")) as T;
}

function loadMinimalBaseDataset(): FixturaDataset {
  const ladderPath = path.join(cwd, "public/dummyAssetData/Cricket/Cricket_Ladder.json");
  return readJsonFile<FixturaDataset>(ladderPath);
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(typeof body?.error === "string" ? body.error : `HTTP ${res.status}`);
  }
  return body as T;
}

async function loadLivePayload(accountId: string, token: string, strapiUrl: string) {
  const brandingRes = await fetchJson<AccountBrandingResponse>(
    `${strapiUrl}/api/accounts/${accountId}/branding`,
    token,
  );
  const templateOptionId =
    brandingRes.data.templateOptionId ?? brandingRes.data.template_option?.["id"];
  const catalogQs = new URLSearchParams({ accountId });
  if (typeof templateOptionId === "number" && templateOptionId > 0) {
    catalogQs.set("templateOptionId", String(templateOptionId));
  }
  const catalogRes = await fetchJson<AllTemplateOptionsResponse>(
    `${strapiUrl}/api/template-categories/all-template-options?${catalogQs}`,
    token,
  );

  let modes: TemplateModeItem[] = [];
  try {
    const modesRes = await fetchJson<{ data: TemplateModeItem[] }>(
      `${strapiUrl}/api/template-modes/ui`,
      token,
    );
    modes = modesRes.data ?? [];
  } catch {
    modes = catalogRes.data.modes ?? [];
  }

  return { branding: brandingRes.data, catalog: catalogRes.data, modes };
}

function formatReport(
  label: string,
  diagnostic: ReturnType<typeof diagnoseAccountRemotionPreviewParity>,
): string {
  const lines: string[] = [
    `## ${label}`,
    "",
    `- **useBackground:** ${diagnostic.useBackground ?? "(none)"}`,
    `- **brandingComplete:** ${diagnostic.brandingComplete}`,
    `- **assemblyParity:** ${diagnostic.assemblyParity}`,
    `- **recommendation:** ${diagnostic.recommendation}`,
    "",
  ];

  if (diagnostic.brandingGaps.length > 0) {
    lines.push("### Branding gaps", "");
    for (const gap of diagnostic.brandingGaps) {
      lines.push(`- \`${gap.field}\` (${gap.status}): ${gap.detail}`);
    }
    lines.push("");
  }

  if (diagnostic.templateVariationDiff.length > 0) {
    lines.push("### templateVariation diff", "");
    for (const diff of diagnostic.templateVariationDiff) {
      lines.push(`- **${diff.path}**`);
      lines.push(`  - saved: \`${JSON.stringify(diff.saved)}\``);
      lines.push(`  - builder: \`${JSON.stringify(diff.builder)}\``);
    }
    lines.push("");
  }

  if (diagnostic.notes.length > 0) {
    lines.push("### Notes", "");
    for (const note of diagnostic.notes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const strapiUrl = process.env["STRAPI_URL"]?.trim() || "http://127.0.0.1:1337";
  const token = process.env["FIXTURA_BEARER_TOKEN"]?.trim() ?? "";

  let branding: AccountBrandingData;
  let catalog: AllTemplateOptionsPayload;
  let modes: TemplateModeItem[] = [];
  let label = "Fixture diagnostic";

  if (args.accountId) {
    if (!token) {
      console.error("FIXTURA_BEARER_TOKEN is required for live --account-id capture.");
      process.exit(1);
    }
    const live = await loadLivePayload(args.accountId, token, strapiUrl);
    branding = live.branding;
    catalog = live.catalog;
    modes = live.modes;
    label = `Live account ${args.accountId}`;
  } else if (args.branding && args.catalog) {
    branding = readJsonFile<AccountBrandingData>(args.branding);
    catalog = readJsonFile<AllTemplateOptionsPayload>(args.catalog);
    if (args.modes) {
      modes = readJsonFile<TemplateModeItem[]>(args.modes);
    } else {
      modes = catalog.modes ?? [];
    }
    label = path.basename(args.branding, ".json");
  } else {
    console.error(
      "Provide --account-id with FIXTURA_BEARER_TOKEN, or --branding and --catalog fixture paths.",
    );
    process.exit(1);
  }

  const templateModeSlug = resolveTemplateModeSlugFromBranding(branding, modes);
  const diagnostic = diagnoseAccountRemotionPreviewParity({
    branding,
    catalog,
    baseDataset: loadMinimalBaseDataset(),
    templateModeSlug,
    logoUrl: null,
  });

  const reportBody = [
    "# Phase A — Account Remotion Preview parity diagnostic",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    formatReport(label, diagnostic),
    "## Raw JSON",
    "",
    "```json",
    JSON.stringify(diagnostic, null, 2),
    "```",
    "",
  ].join("\n");

  console.log(reportBody);

  const outPath =
    args.out ??
    path.join(cwd, ".scratch/dashboard-template-preview-sync/phase-a-diagnostic-latest.md");
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, reportBody, "utf8");
  console.error(`Wrote ${outPath}`);
}

void main();
