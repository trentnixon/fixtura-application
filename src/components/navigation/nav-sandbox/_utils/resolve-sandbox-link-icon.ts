import { IconLayoutGrid } from "@tabler/icons-react";

import { SANDBOX_LINK_ICONS } from "../_constants/sandbox-link-icons";

import type { SandboxPortalLink } from "../_types/nav-sandbox";

export function resolveSandboxLinkIcon(href: SandboxPortalLink["href"]) {
  return SANDBOX_LINK_ICONS[href] ?? IconLayoutGrid;
}
