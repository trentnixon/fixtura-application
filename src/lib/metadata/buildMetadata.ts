import { appMetadata } from "@/config/metadata";

import type { Metadata } from "next";

export type BuildPageMetadataOptions = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

/**
 * Full defaults for the root layout: template, icons, metadataBase, robots.
 * Leaf routes should use `buildPageMetadata` so titles merge with `title.template`.
 */
export function buildRootMetadata(): Metadata {
  return {
    title: {
      default: appMetadata.appTitle,
      template: appMetadata.titleTemplate,
    },
    description: appMetadata.description,
    metadataBase: new URL(appMetadata.baseUrl),
    icons: {
      icon: appMetadata.icons.icon,
      shortcut: appMetadata.icons.shortcut,
      apple: appMetadata.icons.apple,
    },
    robots: { ...appMetadata.robotsDefault },
  };
}

/**
 * Overrides for a route segment. Omit `title` to inherit the root default title only.
 */
export function buildPageMetadata(options: BuildPageMetadataOptions = {}): Metadata {
  const { title, description, noIndex } = options;

  const metadata: Metadata = {};

  if (title !== undefined) {
    metadata.title = title;
  }
  if (description !== undefined) {
    metadata.description = description;
  }
  if (noIndex === true) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}
