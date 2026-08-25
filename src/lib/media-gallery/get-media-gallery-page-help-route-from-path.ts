export type MediaGalleryPageHelpRoute = "media-gallery";

/**
 * Map a scoped path rest segment to media-gallery page-help content.
 * Returns null when the URL is outside the media gallery area.
 */
export function getMediaGalleryPageHelpRouteFromPathRest(
  rest: string,
): MediaGalleryPageHelpRoute | null {
  if (rest === "media-gallery") {
    return "media-gallery";
  }
  return null;
}
