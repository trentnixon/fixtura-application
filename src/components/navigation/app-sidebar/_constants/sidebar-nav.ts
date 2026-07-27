import {
  IconBuilding,
  IconBuildingPlus,
  IconCamera,
  IconDashboard,
  IconEye,
  IconFileDescription,
  IconFolder,
  IconMoneybag,
  IconPalette,
  IconPhoto,
  IconSettings,
  IconArrowsSort,
  IconUsers,
} from "@tabler/icons-react";

import { accountScopedRoutes } from "@/lib/config/account-routes";
import { CLUB_ACCOUNT_TYPE_ID } from "@/lib/config/onboarding";
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

export function getScopedNavSections(
  accountId: string | undefined,
  options?: { accountType?: number | null },
): NavMainSection[] {
  if (accountId == null) return [];

  const showClubLogosNav =
    options?.accountType !== undefined && options.accountType !== CLUB_ACCOUNT_TYPE_ID;

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
      label: "Bundles",
      items: [
        {
          title: "Bundles",
          url: accountScopedRoutes.bundles(accountId),
          icon: IconFolder,
        },
        {
          title: "Vision",
          url: accountScopedRoutes.season(accountId),
          icon: IconEye,
        },
        {
          title: "Settings",
          url: accountScopedRoutes.settings(accountId),
          icon: IconSettings,
        },
      ],
    },
    {
      label: "Assets",
      items: [
        {
          title: "Templates",
          url: accountScopedRoutes.templateBuilder(accountId),
          icon: IconFileDescription,
        },

        {
          title: "Background images",
          url: accountScopedRoutes.mediaGallery(accountId),
          icon: IconCamera,
        },
        {
          title: "Sort Order",
          url: accountScopedRoutes.sortOrder(accountId),
          icon: IconArrowsSort,
        },
      ],
    },
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
        ...(showClubLogosNav
          ? [
              {
                title: "Club Logos",
                url: accountScopedRoutes.clubLogos(accountId),
                icon: IconBuilding,
              },
            ]
          : []),
        {
          title: "Sponsors",
          url: accountScopedRoutes.manageSponsors(accountId),
          icon: IconMoneybag,
        },
      ],
    },
  ];
}
