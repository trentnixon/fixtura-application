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
import { useSupportCapability } from "@/lib/api/hooks/account/useSupportCapability";
import { useSupportView } from "@/lib/support/support-view-context";

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

  const { canAccessAllAccounts } = useSupportCapability();
  const { isSupportView } = useSupportView();

  const accountTypeFromOrg =
    scopedOrgCtx.data && !isAccountOrganisationContextGatewayRedirect(scopedOrgCtx.data)
      ? scopedOrgCtx.data.data.account_type
      : undefined;

  const gatewayNavSections = [
    { items: getGatewayNavItems({ canAccessSupport: canAccessAllAccounts }) },
  ];
  const scopedNavSections = getScopedNavSections(accountId, {
    ...(accountTypeFromOrg === undefined ? {} : { accountType: accountTypeFromOrg }),
    ...(navMode === "scoped" && isSupportView ? { isSupportView: true } : {}),
  });

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
