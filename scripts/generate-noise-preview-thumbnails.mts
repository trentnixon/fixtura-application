/**
 * Regenerate static noise preview thumbnails for template-builder tiles.
 *
 * Usage: npx tsx scripts/generate-noise-preview-thumbnails.mts
 *
 * Writes SVG approximations to public/template-builder/noise-previews/.
 * GridNoise variants use live canvas previews in the browser (see resolve-remotion-noise-grid-preview.ts).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { REMOTION_NOISE_STATIC_PREVIEW_TYPES } from "../src/features/remotion-asset-preview/utils/resolve-remotion-noise-static-preview-url.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "../public/template-builder/noise-previews");

const BASE = "#000021";
const ACCENT = "#4a90e2";
const SECONDARY = "#7b68ee";
const HIGHLIGHT = "#ff6b6b";

function svgHeader(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">`;
}

function svgFooter(): string {
  return `</svg>`;
}

function writeSvg(filename: string, body: string): void {
  writeFileSync(join(OUTPUT_DIR, filename), `${svgHeader()}\n${body}\n${svgFooter()}\n`, "utf8");
}

const STATIC_SVG_BUILDERS: Record<(typeof REMOTION_NOISE_STATIC_PREVIEW_TYPES)[number], string> = {
  floatingParticles: `<rect width="300" height="300" fill="${BASE}"/>
  <circle cx="40" cy="50" r="6" fill="${ACCENT}" opacity="0.45"/>
  <circle cx="140" cy="40" r="7" fill="${ACCENT}" opacity="0.5"/>
  <circle cx="240" cy="60" r="6" fill="${ACCENT}" opacity="0.3"/>
  <circle cx="120" cy="180" r="6" fill="${ACCENT}" opacity="0.38"/>
  <circle cx="230" cy="170" r="7" fill="${ACCENT}" opacity="0.33"/>
  <circle cx="150" cy="250" r="6" fill="${ACCENT}" opacity="0.44"/>`,
  dynamicParticles: `<rect width="300" height="300" fill="${BASE}"/>
  <circle cx="50" cy="60" r="3" fill="${ACCENT}" opacity="0.55"/>
  <circle cx="170" cy="70" r="3" fill="${ACCENT}" opacity="0.5"/>
  <circle cx="130" cy="150" r="3" fill="${ACCENT}" opacity="0.42"/>
  <circle cx="250" cy="140" r="3" fill="${ACCENT}" opacity="0.38"/>
  <circle cx="150" cy="230" r="3" fill="${ACCENT}" opacity="0.44"/>`,
  triangleSwarm: `<rect width="300" height="300" fill="${BASE}"/>
  <polygon points="50,35 35,65 65,65" fill="${ACCENT}" opacity="0.5"/>
  <polygon points="200,45 180,80 220,80" fill="${ACCENT}" opacity="0.45"/>
  <polygon points="160,140 140,175 180,175" fill="${ACCENT}" opacity="0.48"/>
  <polygon points="110,240 90,275 130,275" fill="${ACCENT}" opacity="0.44"/>`,
  digitalRain: `<rect width="300" height="300" fill="${BASE}"/>
  <rect x="42" y="20" width="4" height="40" fill="${ACCENT}" opacity="0.55"/>
  <rect x="162" y="70" width="4" height="60" fill="${ACCENT}" opacity="0.4"/>
  <rect x="142" y="120" width="4" height="70" fill="${ACCENT}" opacity="0.52"/>
  <rect x="222" y="150" width="4" height="55" fill="${ACCENT}" opacity="0.4"/>`,
  spokes: `<rect width="300" height="300" fill="${BASE}"/>
  <g stroke="${ACCENT}" stroke-width="3" stroke-linecap="round" opacity="0.7">
    <line x1="150" y1="150" x2="150" y2="30"/>
    <line x1="150" y1="150" x2="235" y2="85"/>
    <line x1="150" y1="150" x2="235" y2="215"/>
    <line x1="150" y1="150" x2="150" y2="270"/>
    <line x1="150" y1="150" x2="65" y2="215"/>
    <line x1="150" y1="150" x2="65" y2="85"/>
  </g>`,
  geometric: `<rect width="300" height="300" fill="${BASE}"/>
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${SECONDARY}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <polygon points="150,110 130,150 170,150" fill="url(#g1)" opacity="0.75"/>
  <polygon points="190,130 170,170 210,170" fill="${ACCENT}" opacity="0.55"/>
  <circle cx="90" cy="90" r="10" fill="${HIGHLIGHT}" opacity="0.45"/>
  <circle cx="220" cy="100" r="8" fill="${HIGHLIGHT}" opacity="0.4"/>`,
};

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const type of REMOTION_NOISE_STATIC_PREVIEW_TYPES) {
  writeSvg(`${type}.svg`, STATIC_SVG_BUILDERS[type]);
  console.log(`Wrote ${type}.svg`);
}

console.log(
  `Done. ${REMOTION_NOISE_STATIC_PREVIEW_TYPES.length} static noise previews in ${OUTPUT_DIR}`,
);
