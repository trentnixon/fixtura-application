export type CroppedOutputValidationRules = {
  minOutputWidth?: number;
  minOutputHeight?: number;
  maxOutputWidth?: number;
  maxOutputHeight?: number;
};

export type ValidateCroppedOutputResult = {
  ok: boolean;
  errors: string[];
};

/**
 * Validates cropped bitmap dimensions (and optionally file size) after export.
 */
export function validateCroppedOutput(
  width: number,
  height: number,
  rules: CroppedOutputValidationRules,
  _byteSize?: number,
): ValidateCroppedOutputResult {
  const errors: string[] = [];
  const w = Math.round(width);
  const h = Math.round(height);

  if (rules.minOutputWidth !== undefined && w < rules.minOutputWidth) {
    errors.push(
      `Cropped result must be at least ${rules.minOutputWidth}px wide. Adjust the crop or use a larger image.`,
    );
  }
  if (rules.minOutputHeight !== undefined && h < rules.minOutputHeight) {
    errors.push(
      `Cropped result must be at least ${rules.minOutputHeight}px tall. Adjust the crop or use a larger image.`,
    );
  }
  if (rules.maxOutputWidth !== undefined && w > rules.maxOutputWidth) {
    errors.push(`Cropped result must be at most ${rules.maxOutputWidth}px wide.`);
  }
  if (rules.maxOutputHeight !== undefined && h > rules.maxOutputHeight) {
    errors.push(`Cropped result must be at most ${rules.maxOutputHeight}px tall.`);
  }

  return { ok: errors.length === 0, errors };
}
