import type { Area } from "react-easy-crop";

export type OutputImageFormat = "image/png" | "image/jpeg" | "image/webp";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.src = src;
  });
}

/**
 * Renders the given pixel crop region from `imageSrc` to a canvas and returns a Blob.
 * `pixelCrop` should come from `onCropComplete`'s second argument (`croppedAreaPixels`) in react-easy-crop.
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputFormat: OutputImageFormat,
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.round(pixelCrop.width));
  const h = Math.max(1, Math.round(pixelCrop.height));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export image"));
      },
      outputFormat,
      outputFormat === "image/png" ? undefined : quality,
    );
  });
}

export function extensionForFormat(format: OutputImageFormat): string {
  switch (format) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}

export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type, lastModified: Date.now() });
}
