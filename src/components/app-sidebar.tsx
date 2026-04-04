"use client";

import {
  IconBuildingPlus,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFolder,
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
import { NavSecondary } from "@/components/nav-secondary";
import { NavSystem } from "@/components/nav-system";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isOrganisationGatewayRedirect,
  useAccountOrganisation,
} from "@/lib/api/hooks/account/useAccountOrganisation";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";

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
  const { data: orgQueryData } = useAccountOrganisation(
    navMode === "scoped" && accountId ? accountId : "",
  );
  const orgData =
    orgQueryData && !isOrganisationGatewayRedirect(orgQueryData) ? orgQueryData : undefined;

  const meUser = {
    ...fallbackUser,
    name: meData?.data?.contentHub?.FirstName ?? fallbackUser.name,
    email:
      meData?.data?.contentHub?.accountOrganisationDetails?.Name ??
      meData?.data?.user?.email ??
      fallbackUser.email,
    avatar: meData?.data?.contentHub?.accountOrganisationDetails?.ParentLogo ?? fallbackUser.avatar,
  };

  const scopedUser =
    navMode === "scoped" && orgData?.data
      ? {
          ...meUser,
          name: orgData.data.FirstName ?? meUser.name,
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
            title: "Content Bundles",
            url: accountScopedRoutes.bundles(accountId),
            icon: IconFolder,
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
    { title: "Kitchen Sink", url: ROUTES.kitchenSink, icon: IconChartBar },
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
        <NavSystem />
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
