"use client";

import * as React from "react";

import { AppSidebarAdminMenu } from "@/components/navigation/app-sidebar/_components/app-sidebar-admin-menu";
import {
  getGatewayNavItems,
  getScopedNavSections,
} from "@/components/navigation/app-sidebar/_constants/sidebar-nav";
import { useAppSidebarUser } from "@/components/navigation/app-sidebar/_hooks/use-app-sidebar-user";
import { NavMain } from "@/components/navigation/nav-main";
/* import { NavSecondary } from "@/components/navigation/nav-secondary"; */
import { NavUser } from "@/components/navigation/nav-user";
import {
  Sidebar,
  SidebarContent,
  /*   SidebarFooter, */
  SidebarHeader,
  /*   SidebarMenuButton,
    SidebarMenuItem, */
} from "@/components/ui/sidebar";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";

export function AppSidebar({
  navMode,
  accountId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navMode: "gateway" | "scoped";
  accountId?: string;
}) {
  const scopedUser = useAppSidebarUser(navMode, accountId);

  const scopedOrgCtx = useAccountOrganisationContext(
    navMode === "scoped" && accountId ? accountId : "",
    { enabled: navMode === "scoped" && Boolean(accountId) },
  );

  const accountTypeFromOrg =
    scopedOrgCtx.data && !isAccountOrganisationContextGatewayRedirect(scopedOrgCtx.data)
      ? scopedOrgCtx.data.data.account_type
      : undefined;

  const gatewayNavSections = [{ items: getGatewayNavItems() }];
  const scopedNavSections = getScopedNavSections(
    accountId,
    accountTypeFromOrg === undefined ? undefined : { accountType: accountTypeFromOrg },
  );

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <NavUser user={scopedUser} {...(accountId !== undefined ? { accountId } : {})} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navMode === "gateway" ? gatewayNavSections : scopedNavSections} />
        <AppSidebarAdminMenu />
        {/* <NavSecondary items={secondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* {navMode === "scoped" && accountId ? (
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
      ) : null} */}
    </Sidebar>
  );
}
