"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLifebuoy,
  IconList,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TypographyCaption, TypographyNavLabel } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSupportCapability } from "@/lib/api/hooks/account/useSupportCapability";
import { ROUTES } from "@/lib/config/routes";
import { useUnsavedChangesContext } from "@/lib/navigation/unsaved-changes-context";

import {
  NAV_USER_MENU_LABEL_ACCOUNT,
  NAV_USER_MENU_LABEL_ALL_ORGANISATIONS,
  NAV_USER_MENU_LABEL_BILLING,
  NAV_USER_MENU_LABEL_LOGGING_OUT,
  NAV_USER_MENU_LABEL_LOGOUT,
  NAV_USER_MENU_LABEL_NOTIFICATIONS,
  NAV_USER_MENU_LABEL_SUPPORT_ACCOUNTS,
} from "./_constants/nav-user-ui";
import { useNavUserLogout } from "./_hooks/use-nav-user-logout";
import { getNavUserInitials } from "./_utils/get-nav-user-initials";
import {
  resolveNavUserAccountHref,
  resolveNavUserBillingHref,
  resolveNavUserNotificationsHref,
} from "./_utils/resolve-nav-user-menu-hrefs";

import type { NavUserComponentProps } from "./_types/nav-user";
import type { MouseEvent } from "react";

export function NavUser({ user, accountId }: NavUserComponentProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { confirmIfDirty } = useUnsavedChangesContext();
  const { logout, handleLogout } = useNavUserLogout();
  const initials = getNavUserInitials(user.name);
  const { canAccessAllAccounts, ownedAccountIds } = useSupportCapability();

  const guardedNavigate = (href: string) => (event: MouseEvent) => {
    event.preventDefault();
    confirmIfDirty(() => router.push(href));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <TypographyNavLabel as="span" className="truncate">
                  {user.name}
                </TypographyNavLabel>
                <TypographyCaption as="span" className="truncate">
                  {user.email}
                </TypographyCaption>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <TypographyNavLabel as="span" className="truncate">
                    {user.name}
                  </TypographyNavLabel>
                  <TypographyCaption as="span" className="truncate">
                    {user.email}
                  </TypographyCaption>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={resolveNavUserAccountHref(accountId)}
                  onClick={guardedNavigate(resolveNavUserAccountHref(accountId))}
                >
                  <IconUserCircle />
                  {NAV_USER_MENU_LABEL_ACCOUNT}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={resolveNavUserBillingHref(accountId)}
                  onClick={guardedNavigate(resolveNavUserBillingHref(accountId))}
                >
                  <IconCreditCard />
                  {NAV_USER_MENU_LABEL_BILLING}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={resolveNavUserNotificationsHref(accountId)}
                  onClick={guardedNavigate(resolveNavUserNotificationsHref(accountId))}
                >
                  <IconNotification />
                  {NAV_USER_MENU_LABEL_NOTIFICATIONS}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {canAccessAllAccounts && accountId ? (
              <DropdownMenuItem asChild>
                <Link
                  href={ROUTES.supportAccounts}
                  onClick={guardedNavigate(ROUTES.supportAccounts)}
                >
                  <IconLifebuoy />
                  {NAV_USER_MENU_LABEL_SUPPORT_ACCOUNTS}
                </Link>
              </DropdownMenuItem>
            ) : null}
            {ownedAccountIds.length > 0 ? (
              <DropdownMenuItem asChild>
                <Link
                  href={ROUTES.selectOrganisation}
                  onClick={guardedNavigate(ROUTES.selectOrganisation)}
                >
                  <IconList />
                  {NAV_USER_MENU_LABEL_ALL_ORGANISATIONS}
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={logout.isPending} onClick={handleLogout}>
              <IconLogout />
              {logout.isPending ? NAV_USER_MENU_LABEL_LOGGING_OUT : NAV_USER_MENU_LABEL_LOGOUT}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
