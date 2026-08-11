import { type Icon, IconBolt, IconDatabase, IconLayoutGrid, IconRoute } from "@tabler/icons-react";

import { ROUTES } from "@/lib/config/routes";

export const SANDBOX_LINK_ICONS: Record<string, Icon> = {
  [ROUTES.routeLab]: IconRoute,
  [ROUTES.kitchenSink]: IconLayoutGrid,
  [ROUTES.interactionLab]: IconBolt,
  [ROUTES.dataLab]: IconDatabase,
};
