"use client";

import { MediaGalleryPageHelpTrigger } from "@/app/(members)/o/[accountId]/media-gallery/_components/media-gallery-page-help-trigger";
import { parseAccountScopePath } from "@/lib/config/account-routes";
import { getMediaGalleryPageHelpRouteFromPathRest } from "@/lib/media-gallery/get-media-gallery-page-help-route-from-path";

export function SiteHeaderMediaGalleryHelp({ pathname }: { pathname: string }) {
  const scoped = parseAccountScopePath(pathname);
  if (!scoped) return null;
  const route = getMediaGalleryPageHelpRouteFromPathRest(scoped.rest);
  if (!route) return null;

  return (
    <MediaGalleryPageHelpTrigger accountId={scoped.accountId} route={route} variant="site-header" />
  );
}
