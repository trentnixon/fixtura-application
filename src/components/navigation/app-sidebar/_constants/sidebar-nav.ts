import {
  IconBuildingPlus,
  IconCamera,
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconListDetails,
  IconMoneybag,
  IconPalette,
  IconPhoto,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

import type {
  NavMainItem,
  NavMainSection,
} from "@/components/navigation/app-sidebar/_types/nav-section";

export function getGatewayNavItems(): NavMainItem[] {
  return [
    { title: "Select organisation", url: ROUTES.selectOrganisation, icon: IconUsers },
    { title: "Create organisation", url: ROUTES.createOrganisation, icon: IconBuildingPlus },
  ];
}

export function getScopedNavSections(accountId: string | undefined): NavMainSection[] {
  if (accountId == null) return [];

  return [
    {
      label: "",
      items: [
        {
          title: "Dashboard",
          url: accountScopedRoutes.dashboard(accountId),
          icon: IconDashboard,
        },
      ],
    },
    /* {
      label: "Account",
      items: [
        {
          title: "Billing",
          url: accountScopedRoutes.billing(accountId),
          icon: IconCreditCard,
        },
        {
          title: "Season",
          url: accountScopedRoutes.season(accountId),
          icon: IconListDetails,
        },
      ],
    }, */
    {
      label: "Organisation",
      items: [
        {
          title: "Branding",
          url: accountScopedRoutes.branding(accountId),
          icon: IconPalette,
        },
        {
          title: "Logo",
          url: accountScopedRoutes.brandLogo(accountId),
          icon: IconPhoto,
        },
        {
          title: "Sponsors",
          url: accountScopedRoutes.manageSponsors(accountId),
          icon: IconMoneybag,
        },
        {
          title: "Season",
          url: accountScopedRoutes.season(accountId),
          icon: IconListDetails,
        },
      ],
    },
    {
      label: "Assets",
      items: [
        {
          title: "Settings",
          url: accountScopedRoutes.settings(accountId),
          icon: IconSettings,
        },
        {
          title: "Templates",
          url: accountScopedRoutes.templateBuilder(accountId),
          icon: IconFileDescription,
        },
        {
          title: "Media Gallery",
          url: accountScopedRoutes.mediaGallery(accountId),
          icon: IconCamera,
        },
        {
          title: "Bundles",
          url: accountScopedRoutes.bundles(accountId),
          icon: IconFolder,
        },
      ],
    },
  ];
}
