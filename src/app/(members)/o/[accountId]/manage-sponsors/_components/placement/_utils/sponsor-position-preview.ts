import { SPONSOR_POSITION_PREVIEW_PAGE_SIZE } from "../_constants/sponsor-position-asset-preview";

import type { SponsorPositionSlotDef } from "../../../_constants/sponsor-position-slots";
import type { SponsorPositionPreviewCell } from "../_types/sponsor-position-asset-preview";

export function chunkPositionPreviewSlots(
  slots: SponsorPositionSlotDef[],
): SponsorPositionPreviewCell[][] {
  const chunks: SponsorPositionPreviewCell[][] = [];
  const source = slots.length > 0 ? slots : [];

  for (
    let index = 0;
    index < Math.max(source.length, SPONSOR_POSITION_PREVIEW_PAGE_SIZE);
    index += SPONSOR_POSITION_PREVIEW_PAGE_SIZE
  ) {
    const cells: SponsorPositionPreviewCell[] = source.slice(
      index,
      index + SPONSOR_POSITION_PREVIEW_PAGE_SIZE,
    );

    while (cells.length < SPONSOR_POSITION_PREVIEW_PAGE_SIZE) cells.push(null);
    chunks.push(cells);
  }

  return chunks;
}
