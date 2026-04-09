"use client";

import {
  IconBuildingPlus,
  IconCamera,
  IconCreditCard,
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconPalette,
  IconHelp,
  IconListDetails,
  IconMoneybag,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

import { AccountSwitcher } from "@/components/layout/account-switcher";
import { NavMain } from "@/components/nav-main";
import { NavSandboxMenuItem } from "@/components/nav-sandbox";
import { NavSecondary } from "@/components/nav-secondary";
import { NavSystemMenuItem } from "@/components/nav-system";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { isDevSandboxEnabled } from "@/lib/dev-sandbox";

const fallbackUser = {
  name: "Member",
  email: "member@fixtura.com.au",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({
  navMode,
  accountId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navMode: "gateway" | "scoped";
  accountId?: string;
}) {
  const { data: meData } = useAccountMe();
  const { data: orgQueryData } = useAccountOrganisationContext(
    navMode === "scoped" && accountId ? accountId : "",
  );
  const orgData =
    orgQueryData && !isAccountOrganisationContextGatewayRedirect(orgQueryData)
      ? orgQueryData
      : undefined;

  const bootstrapRow = activeAccountSummaryFromMePayload(meData?.data, accountId);
  const bootstrapOrg = bootstrapRow ? organisationDetailsFromAccountRow(bootstrapRow) : undefined;

  const meUser = {
    ...fallbackUser,
    name: bootstrapRow?.FirstName ?? fallbackUser.name,
    email: bootstrapOrg?.Name ?? meData?.data?.user?.email ?? fallbackUser.email,
    avatar: bootstrapOrg?.ParentLogo ?? fallbackUser.avatar,
  };

  const scopedUser =
    navMode === "scoped" && orgData?.data
      ? {
          ...meUser,
          email: orgData.data.accountOrganisationDetails?.Name ?? meUser.email,
          avatar: orgData.data.accountOrganisationDetails?.ParentLogo ?? meUser.avatar,
        }
      : meUser;

  const gatewayMain = [
    { title: "Select organisation", url: ROUTES.selectOrganisation, icon: IconUsers },
    { title: "Create organisation", url: ROUTES.createOrganisation, icon: IconBuildingPlus },
  ];

  const scopedMain =
    accountId != null
      ? [
          {
            title: "Dashboard",
            url: accountScopedRoutes.dashboard(accountId),
            icon: IconDashboard,
          },
          {
            title: "Bundles",
            url: accountScopedRoutes.bundles(accountId),
            icon: IconFolder,
          },
          {
            title: "Branding",
            url: accountScopedRoutes.branding(accountId),
            icon: IconPalette,
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
            title: "Sponsors",
            url: accountScopedRoutes.manageSponsors(accountId),
            icon: IconMoneybag,
          },
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
        ]
      : [];

  const secondary = [
    ...(navMode === "scoped" && accountId != null
      ? [{ title: "Settings", url: accountScopedRoutes.settings(accountId), icon: IconSettings }]
      : []),
    { title: "Get Help", url: ROUTES.help, icon: IconHelp },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        {navMode === "scoped" && accountId ? <AccountSwitcher accountId={accountId} /> : null}
        <NavUser user={scopedUser} {...(accountId !== undefined ? { accountId } : {})} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMode === "gateway" ? gatewayMain : scopedMain} />
        {isDevSandboxEnabled ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavSandboxMenuItem />
                <NavSystemMenuItem />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
        <NavSecondary items={secondary} className="mt-auto" />
      </SidebarContent>
      {navMode === "scoped" && accountId ? (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href={ROUTES.selectOrganisation}>
                  <IconUsers />
                  <span>All organisations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
