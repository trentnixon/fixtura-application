import { IconActivity, IconServer } from "@tabler/icons-react";

import { ROUTES } from "@/lib/config/routes";

import type { NavSystemToolItem } from "../_types/nav-system";

export const NAV_SYSTEM_ACTIVE_PATH_PREFIX = "/admin/system";

export const NAV_SYSTEM_TRIGGER_TITLE = "System";
export const NAV_SYSTEM_TRIGGER_SUBTITLE = "Admin Tools";

export const NAV_SYSTEM_SECTION_INFRASTRUCTURE = "Infrastructure";

export const NAV_SYSTEM_OVERVIEW_TITLE = "System Overview";

export const NAV_SYSTEM_OVERVIEW_PATH = ROUTES.systemLanding;

export const NAV_SYSTEM_INFRASTRUCTURE_TOOLS: NavSystemToolItem[] = [
  {
    title: "Inspector",
    url: ROUTES.systemInspector,
    icon: IconServer,
  },
  {
    title: "Fetch Health",
    url: ROUTES.fetchHealth,
    icon: IconActivity,
  },
];
