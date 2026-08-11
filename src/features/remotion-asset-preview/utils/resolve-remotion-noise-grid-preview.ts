import { noise2D, noise3D } from "@remotion/noise";

import type { RemotionNoiseTypeKey } from "./read-remotion-noise-from-catalog";

type GridNoiseDimension = "2d" | "3d";
type GridNoiseCellShape = "square" | "circle";

export type GridNoisePreviewParams = {
  baseColor: string;
  noiseColor: string;
  startColor?: string;
  endColor?: string;
  gradientDirection?: "horizontal" | "vertical";
  blurAmount?: number;
  noiseOpacity: number;
  noiseScale: number;
  noiseSpeed: number;
  noiseDimension: GridNoiseDimension;
  noiseSeed: string;
  gridSize: number;
  cellShape: GridNoiseCellShape;
};

const GRID_NOISE_VARIANT_PARAMS: Partial<Record<RemotionNoiseTypeKey, GridNoisePreviewParams>> = {
  default: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.3,
    noiseScale: 0.5,
    noiseSpeed: 0.05,
    noiseDimension: "2d",
    noiseSeed: "noise-seed",
    gridSize: 16,
    cellShape: "square",
  },
  subtle: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.05,
    noiseScale: 0.5,
    noiseSpeed: 0.02,
    noiseDimension: "3d",
    noiseSeed: "noise-seed",
    gridSize: 10,
    cellShape: "square",
  },
  grain: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.02,
    noiseScale: 1,
    noiseSpeed: 0.001,
    noiseDimension: "2d",
    noiseSeed: "noise-seed",
    gridSize: 20,
    cellShape: "square",
  },
  wave: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.2,
    noiseScale: 2,
    noiseSpeed: 0.03,
    noiseDimension: "2d",
    noiseSeed: "noise-seed",
    gridSize: 15,
    cellShape: "square",
  },
  fog: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.15,
    noiseScale: 0.8,
    noiseSpeed: 0.01,
    noiseDimension: "3d",
    noiseSeed: "noise-seed",
    gridSize: 12,
    cellShape: "square",
  },
  static: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.3,
    noiseScale: 10,
    noiseSpeed: 0.05,
    noiseDimension: "2d",
    noiseSeed: "noise-seed",
    gridSize: 15,
    cellShape: "square",
  },
  pulsingCircles: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.2,
    noiseScale: 1.5,
    noiseSpeed: 0.01,
    noiseDimension: "3d",
    noiseSeed: "noise-seed",
    gridSize: 15,
    cellShape: "circle",
  },
  gradientGrid: {
    baseColor: "#000021",
    noiseColor: "#ffffff",
    noiseOpacity: 0.4,
    noiseScale: 1.5,
    noiseSpeed: 0.005,
    noiseDimension: "2d",
    noiseSeed: "noise-seed",
    gridSize: 18,
    cellShape: "square",
    gradientDirection: "horizontal",
    blurAmount: 0,
  },
};

const GRID_NOISE_VARIANTS = new Set<RemotionNoiseTypeKey>(
  Object.keys(GRID_NOISE_VARIANT_PARAMS) as RemotionNoiseTypeKey[],
);

export function isGridNoiseRemotionVariant(type: RemotionNoiseTypeKey): boolean {
  return GRID_NOISE_VARIANTS.has(type);
}

function interpolateHexColor(start: string, end: string, t: number): string {
  const parse = (hex: string) => {
    const normalized = hex.replace("#", "");
    const value =
      normalized.length === 3
        ? normalized
            .split("")
            .map((c) => c + c)
            .join("")
        : normalized;
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  };
  const a = parse(start);
  const b = parse(end);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = mix(a.r, b.r);
  const g = mix(a.g, b.g);
  const bl = mix(a.b, b.b);
  return `rgb(${r}, ${g}, ${bl})`;
}

function resolveParamsForVariant(
  variant: RemotionNoiseTypeKey,
  baseColor: string,
  accentColor: string,
): GridNoisePreviewParams | null {
  const template = GRID_NOISE_VARIANT_PARAMS[variant];
  if (template == null) return null;

  const params: GridNoisePreviewParams = {
    ...template,
    baseColor,
    noiseColor: variant === "grain" ? "#ffffff" : accentColor,
  };

  if (variant === "gradientGrid") {
    params.startColor = accentColor;
    params.endColor = baseColor;
  }

  return params;
}

function drawGridNoisePreview(
  ctx: CanvasRenderingContext2D,
  params: GridNoisePreviewParams,
  size: number,
  frame = 0,
): void {
  const {
    baseColor,
    noiseColor,
    startColor,
    endColor,
    gradientDirection = "horizontal",
    noiseOpacity,
    noiseScale,
    noiseSpeed,
    noiseDimension,
    noiseSeed,
    gridSize,
    cellShape,
  } = params;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const time = frame * noiseSpeed;
  const cellWidth = size / gridSize;
  const cellHeight = size / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const xPos = (x / gridSize) * noiseScale;
      const yPos = (y / gridSize) * noiseScale;
      const noiseValue =
        noiseDimension === "2d"
          ? noise2D(noiseSeed, xPos + time, yPos + time)
          : noise3D(noiseSeed, xPos, yPos, time);

      let cellColor = noiseColor;
      if (startColor && endColor) {
        const interpolationPoint = gradientDirection === "horizontal" ? x / gridSize : y / gridSize;
        cellColor = interpolateHexColor(startColor, endColor, interpolationPoint);
      }

      const opacity = Math.abs(noiseValue) * noiseOpacity;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = cellColor;

      const px = x * cellWidth;
      const py = y * cellHeight;

      if (cellShape === "circle") {
        ctx.beginPath();
        ctx.arc(
          px + cellWidth / 2,
          py + cellHeight / 2,
          Math.min(cellWidth, cellHeight) / 2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else {
        ctx.fillRect(px, py, cellWidth, cellHeight);
      }
    }
  }

  ctx.globalAlpha = 1;
}

export function drawGridNoisePreviewToDataUrl({
  variant,
  baseColor,
  accentColor,
  size = 150,
}: {
  variant: RemotionNoiseTypeKey;
  baseColor: string;
  accentColor: string;
  size?: number;
}): string | null {
  if (!isGridNoiseRemotionVariant(variant)) return null;

  const params = resolveParamsForVariant(variant, baseColor, accentColor);
  if (params == null) return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx == null) return null;

  drawGridNoisePreview(ctx, params, size, 0);
  return canvas.toDataURL("image/png");
}

/** Node/canvas-friendly draw for thumbnail generation scripts. */
export function drawGridNoisePreviewToCanvas(
  ctx: CanvasRenderingContext2D,
  {
    variant,
    baseColor,
    accentColor,
    size = 300,
  }: {
    variant: RemotionNoiseTypeKey;
    baseColor: string;
    accentColor: string;
    size?: number;
  },
): boolean {
  if (!isGridNoiseRemotionVariant(variant)) return false;

  const params = resolveParamsForVariant(variant, baseColor, accentColor);
  if (params == null) return false;

  drawGridNoisePreview(ctx, params, size, 0);
  return true;
}

/** Simplified particle preview for static thumbnail generation. */
export function drawParticleNoisePreviewToCanvas(
  ctx: CanvasRenderingContext2D,
  {
    variant,
    baseColor,
    accentColor,
    size = 300,
  }: {
    variant: RemotionNoiseTypeKey;
    baseColor: string;
    accentColor: string;
    size?: number;
  },
): void {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  const config = {
    floatingParticles: { rows: 12, cols: 12, radius: 4, shape: "circle" as const },
    dynamicParticles: { rows: 8, cols: 10, radius: 3, shape: "circle" as const },
    triangleSwarm: { rows: 12, cols: 12, radius: 6, shape: "triangle" as const },
    digitalRain: { rows: 14, cols: 14, radius: 8, shape: "line" as const },
  }[variant as "floatingParticles" | "dynamicParticles" | "triangleSwarm" | "digitalRain"];

  if (config == null) return;

  const { rows, cols, radius, shape } = config;
  const seed = `particle-${variant}`;

  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
      const px = (j / cols) * size;
      const py = (i / rows) * size;
      const dx = noise3D(`${seed}-x`, px, py, 0) * 20;
      const dy = noise3D(`${seed}-y`, px, py, 0) * 20;
      const opacity = Math.abs(noise3D(`${seed}-o`, i, j, 0)) * 0.5;
      const x = px + dx;
      const y = py + dy;

      ctx.globalAlpha = opacity;
      ctx.fillStyle = accentColor;

      if (shape === "circle") {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x - radius, y + radius);
        ctx.lineTo(x + radius, y + radius);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x - radius / 4, y - radius, radius / 2, radius * 2);
      }
    }
  }

  ctx.globalAlpha = 1;
}

/** Simplified SVG-style graphics preview for static thumbnail generation. */
export function drawGraphicsPreviewToCanvas(
  ctx: CanvasRenderingContext2D,
  {
    variant,
    baseColor,
    primaryColor,
    secondaryColor,
    accentColor,
    size = 300,
  }: {
    variant: "spokes" | "geometric";
    baseColor: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    size?: number;
  },
): void {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  if (variant === "spokes") {
    const cx = size / 2;
    const cy = size / 2;
    const spokes = 8;
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * size * 0.45, cy + Math.sin(angle) * size * 0.45);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }

  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180;
    const x = size / 2 + Math.cos(angle) * size * 0.25;
    const y = size / 2 + Math.sin(angle) * size * 0.25;
    const triSize = 12 + (i % 3) * 6;
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = i % 2 === 0 ? primaryColor : secondaryColor;
    ctx.beginPath();
    ctx.moveTo(x, y - triSize);
    ctx.lineTo(x - triSize, y + triSize);
    ctx.lineTo(x + triSize, y + triSize);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < 6; i++) {
    const x = size * 0.2 + ((i * 15) % 80) * (size / 100);
    const y = size * 0.2 + ((i * 12) % 80) * (size / 100);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(x, y, 6 + (i % 2) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

const PARTICLE_NOISE_VARIANTS = new Set<RemotionNoiseTypeKey>([
  "floatingParticles",
  "dynamicParticles",
  "triangleSwarm",
  "digitalRain",
]);

/** Brand-aware canvas preview for any supported noise variant (browser only). */
export function drawRemotionNoisePreviewToDataUrl({
  variant,
  baseColor,
  accentColor,
  size = 150,
}: {
  variant: RemotionNoiseTypeKey;
  baseColor: string;
  accentColor: string;
  size?: number;
}): string | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext("2d");
  } catch {
    return null;
  }
  if (ctx == null) return null;

  if (isGridNoiseRemotionVariant(variant)) {
    const params = resolveParamsForVariant(variant, baseColor, accentColor);
    if (params == null) return null;
    drawGridNoisePreview(ctx, params, size, 0);
  } else if (PARTICLE_NOISE_VARIANTS.has(variant)) {
    drawParticleNoisePreviewToCanvas(ctx, { variant, baseColor, accentColor, size });
  } else if (variant === "spokes" || variant === "geometric") {
    drawGraphicsPreviewToCanvas(ctx, {
      variant,
      baseColor,
      primaryColor: accentColor,
      secondaryColor: accentColor,
      accentColor,
      size,
    });
  } else {
    return null;
  }

  return canvas.toDataURL("image/png");
}
