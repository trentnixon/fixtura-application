/**
 * Read natural pixel dimensions from an image file (browser only).
 */
export async function getImageDimensionsFromFile(
  file: File,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const dims = await loadImageDimensions(url);
    return dims;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    });
    img.addEventListener("error", () => {
      reject(new Error("Could not decode image"));
    });
    img.src = src;
  });
}
